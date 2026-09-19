import { Router } from "express";
import { execFile } from "node:child_process";

const router = Router();

const FRONT_PORT = process.env.FRONT_PORT ?? "4173";
const DEBUG_PORT = process.env.BROWSER_DEBUG_PORT ?? "9222";
const ALLOWED_ORIGIN = `http://localhost:${FRONT_PORT}`;

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

export default router;