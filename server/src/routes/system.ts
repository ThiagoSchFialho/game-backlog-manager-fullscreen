import { Router } from "express";
import { execFile } from "node:child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { lookupService } from "node:dns";

const router = Router();

const FRONT_PORT = process.env.FRONT_PORT ?? "4173";
const DEBUG_PORT = process.env.BROWSER_DEBUG_PORT ?? "9222";
const ALLOWED_ORIGIN = `http://localhost:${FRONT_PORT}`;

//========== Fechar sistema ============
async function closeBrowser(): Promise<void> {
  try {
    const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    const { webSocketDebuggerUrl } = (await res.json()) as {
      webSocketDebuggerUrl: string;
    };

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(webSocketDebuggerUrl);
      const timer = setTimeout(resolve, 3000);
      const done = () => {
        clearTimeout(timer);
        resolve();
      };
      ws.onopen = () =>
        ws.send(JSON.stringify({ id: 1, method: "Browser.close" }));
      ws.onclose = done;
      ws.onerror = done;
    });
  } catch {

  }
}

function killPort(port: string): Promise<void> {
  return new Promise((resolve) => {
    execFile("netstat", ["-ano"], { windowsHide: true }, (err, stdout) => {
      if (err) return resolve();

      const pids = new Set<string>();
      for (const line of stdout.split(/\r?\n/)) {
        const cols = line.trim().split(/\s+/);
        const isListening = /^(0\.0\.0\.0|\[::\]):0$/.test(cols[2] ?? "");
        if (cols.length >= 5 && isListening && cols[1]?.endsWith(`:${port}`)) {
          const pid = cols[4];
          if (pid !== undefined) pids.add(pid);
        }
      }

      pids.delete(String(process.pid));

      if (pids.size === 0) return resolve();

      let pending = pids.size;
      for (const pid of pids) {
        execFile("taskkill", ["/PID", pid, "/T", "/F"], { windowsHide: true }, () => {
          if (--pending === 0) resolve();
        });
      }
    });
  });
}

router.post("/shutdown", (req, res) => {
  const ip = req.socket.remoteAddress;
  const isLocal =
    ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
  const origin = req.headers.origin;

  if (!isLocal || (origin && origin !== ALLOWED_ORIGIN)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json({ ok: true });

  res.on("finish", () => {
    setTimeout(async () => {
      await closeBrowser();
      await killPort(FRONT_PORT);
      process.exit(0);
    }, 200);
  });
});
//========== Fim fechar sistema ============


//========== Checar jogos instalados ============
const FLAGS = {
  UpdateRequired: 2,
  FullyInstalled: 4,
  FilesMissing: 32,
  AppRunning: 64,
  FilesCorrupt: 128,
  UpdateRunning: 256,
  UpdatePaused: 512,
  UpdateStarted: 1024,
  AddingFiles: 262144,
  Preallocating: 524288,
  Downloading: 1048576,
  Staging: 2097152,
  Committing: 4194304,
} as const;

// qualquer um desses bits indica que a Steam está baixando/instalando algo agora
const INSTALLING_MASK =
  FLAGS.UpdateRunning |
  FLAGS.UpdateStarted |
  FLAGS.AddingFiles |
  FLAGS.Preallocating |
  FLAGS.Downloading |
  FLAGS.Staging |
  FLAGS.Committing;

function getSteamPath(): string {
  if (process.env.STEAM_PATH) return process.env.STEAM_PATH;

  switch (process.platform) {
    case "win32":
      return "C:\\Program Files (x86)\\Steam";
    case "darwin":
      return path.join(os.homedir(), "Library/Application Support/Steam");
    default:
      return path.join(os.homedir(), ".local/share/Steam");
  }
}

async function getLibraryFolders(steamPath: string): Promise<string[]> {
  const libraries = [steamPath];
  try {
    const vdf = await fs.readFile(
      path.join(steamPath, "steamapps", "libraryfolders.vdf"),
      "utf-8"
    );
    for (const match of vdf.matchAll(/"path"\s+"([^"]+)"/g)) {
      libraries.push(match[1]!.replace(/\\\\/g, "\\"));
    }
  } catch {
    // sem libraryfolders.vdf, usa só a pasta principal
  }
  return [...new Set(libraries)];
}

export interface SteamApp {
  appId: number;
  name: string;
  library: string;
  flags: number;
  isInstalled: boolean;
  needsUpdate: boolean;
  isRunning: boolean;
  isInstalling: boolean;
  isPaused: boolean;
  isHealthy: boolean;
}

function readNumber(content: string, key: string): number {
  return Number(content.match(new RegExp(`"${key}"\\s+"(\\d+)"`))?.[1] ?? 0);
}

async function getAllSteamApps(): Promise<SteamApp[]> {
  const libraries = await getLibraryFolders(getSteamPath());
  const apps: SteamApp[] = [];

  for (const library of libraries) {
    const steamapps = path.join(library, "steamapps");
    const files = await fs.readdir(steamapps).catch(() => [] as string[]);

    for (const file of files) {
      const m = file.match(/^appmanifest_(\d+)\.acf$/);
      if (!m) continue;

      const content = await fs
        .readFile(path.join(steamapps, file), "utf-8")
        .catch(() => null);
      if (!content) continue;

      const name = content.match(/"name"\s+"([^"]+)"/)?.[1] ?? "";
      const flags = readNumber(content, "StateFlags");
      const isInstalling = !!(flags & INSTALLING_MASK);

      apps.push({
        appId: Number(m[1]),
        name,
        library,
        flags,
        isInstalled: !!(flags & FLAGS.FullyInstalled),
        needsUpdate: !!(flags & FLAGS.UpdateRequired),
        isRunning: !!(flags & FLAGS.AppRunning),
        isInstalling,
        isPaused: !!(flags & FLAGS.UpdatePaused),
        isHealthy: !(flags & (FLAGS.FilesMissing | FLAGS.FilesCorrupt)),
      });
    }
  }
  return apps;
}

export async function getInstalledSteamApps(): Promise<SteamApp[]> {
  return (await getAllSteamApps()).filter((a) => a.isInstalled);
}

router.get("/installed-games", async (_req, res) => {
  try {
    res.json(await getInstalledSteamApps());
  } catch (err) {
    res.status(500).json({ error: "Não foi possível ler os jogos instalados" });
  }
});

router.get("/running-game", async (_req, res) => {
  try {
    const apps = await getAllSteamApps();
    const game = apps.find((a) => a.isRunning) ?? null;
    res.json({ running: game !== null, game });
  } catch (err) {
    res.status(500).json({ error: "Não foi possível verificar o jogo em execução" });
  }
});

router.get("/installing-game", async (_req, res) => {
  try {
    const apps = (await getAllSteamApps()).filter((a) => a.isInstalling);
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Não foi possível verificar as instalações em andamento" });
  }
});

router.get("/required-updates", async (_req, res) => {
  try {
    const apps = (await getAllSteamApps()).filter(
      (a) => a.isInstalled && a.needsUpdate
    );
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Não foi possível verificar as atualizações pendentes" });
  }
});
//========== Fim checar jogos instalados ============

export default router;