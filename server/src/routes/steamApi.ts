import express, { Request, Response } from 'express';
import { CreateGameInput } from "../models/interfaces/games.interface.model";
import { GamesModel } from '../models/games.model';
import { UsersModel } from '../models/users.model';

const router = express.Router();
const userModel = new UsersModel();
const gamesModel = new GamesModel();

interface SteamOwnedGame {
    appid: number;
    name: string;
    playtime_forever: number;
    rtime_last_played?: number;
    img_icon_url?: string;
}

interface AppDetails {
    developer: string | null;
    release_date: string | null;
    cover_hero: string | null;
}

interface SyncResult {
    steam_id: number;
    status: 'created' | 'updated' | 'unchanged' | 'error';
    game?: any;
    error?: string;
}

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveStatus(
    sg: SteamOwnedGame,
    existingGame: any,
    isRecentlyPlayed: boolean
): string {
    if (existingGame?.status === 'completed') {
        return 'completed';
    }

    if (isRecentlyPlayed) {
        return 'playing';
    }

    return sg.playtime_forever > 0 ? 'played' : 'not-played';
}

async function fetchAppDetails(appid: number): Promise<AppDetails | null> {
    try {
        const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
        if (!res.ok) return null;

        const json = await res.json();
        const entry = json[String(appid)];

        if (!entry?.success || !entry.data) return null;

        return {
            developer: entry.data.developers?.[0] ?? null,
            release_date: entry.data.release_date?.date || null,
            cover_hero: entry.data.header_image ?? null,
        };
    } catch (error) {
        console.error(`Erro ao buscar appdetails de ${appid}:`, error);
        return null;
    }
}

function buildCoverSquare(sg: SteamOwnedGame): string | undefined {
    return sg.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${sg.appid}/${sg.img_icon_url}.jpg`
        : undefined;
}

async function fetchSteamLibrary(user: any): Promise<SteamOwnedGame[]> {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${user.steam_api_key}&steamid=${user.steam_id}&include_appinfo=true&include_played_free_games=true`;

    const steamRes = await fetch(url);

    if (!steamRes.ok) {
        console.error(`Steam API respondeu ${steamRes.status}`);
        throw new Error("STEAM_API_ERROR");
    }

    const data = await steamRes.json();
    return data.response.games ?? [];
}

async function syncGames(
    steamGames: SteamOwnedGame[],
    options: { updateExisting: boolean }
): Promise<SyncResult[]> {
    const existingGames = await gamesModel.getAllGames();
    const existingBySteamId = new Map(
        existingGames.map((g: any) => [Number(g.steam_id), g])
    );

    const recentlyPlayedIds = new Set(
        steamGames
            .filter((sg) => (sg.rtime_last_played ?? 0) > 0)
            .sort((a, b) => (b.rtime_last_played ?? 0) - (a.rtime_last_played ?? 0))
            .slice(0, 5)
            .map((sg) => sg.appid)
    );

    const results: SyncResult[] = [];

    for (let i = 0; i < steamGames.length; i += BATCH_SIZE) {
        const batch = steamGames.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.all(
            batch.map(async (sg): Promise<SyncResult> => {
                try {
                    const gameCheck = existingBySteamId.get(sg.appid);

                    if (gameCheck && !options.updateExisting) {
                        return { steam_id: sg.appid, status: 'unchanged', game: gameCheck };
                    }

                    const needsDetails =
                        !gameCheck ||
                        !gameCheck.developer ||
                        !gameCheck.release_date ||
                        !gameCheck.cover_hero;

                    const details = needsDetails ? await fetchAppDetails(sg.appid) : null;

                    const game: CreateGameInput = {
                        title: sg.name,
                        steam_id: sg.appid,
                        playtime: sg.playtime_forever,
                        status: resolveStatus(sg, gameCheck, recentlyPlayedIds.has(sg.appid)),
                        developer: details?.developer ?? gameCheck?.developer ?? null,
                        release_date: details?.release_date ?? gameCheck?.release_date ?? null,
                        rtime_last_played: String(sg.rtime_last_played ?? 0),
                        cover_square: buildCoverSquare(sg) ?? gameCheck?.cover_square,
                        cover_hero: details?.cover_hero ?? gameCheck?.cover_hero ?? undefined,
                        cover_grid: gameCheck?.cover_grid ?? undefined,
                        personal_rating: gameCheck?.personal_rating ?? undefined,
                        favorite: gameCheck?.favorite ?? false,
                    };

                    if (gameCheck?.id) {
                        const updated = await gamesModel.updateGame(gameCheck.id, game);
                        return { steam_id: sg.appid, status: 'updated', game: updated };
                    }

                    const created = await gamesModel.createGame(game);
                    return { steam_id: sg.appid, status: 'created', game: created };
                } catch (error: any) {
                    console.error(`Erro ao sincronizar jogo ${sg.appid}:`, error);
                    return {
                        steam_id: sg.appid,
                        status: 'error',
                        error: error?.message ?? 'Erro desconhecido',
                    };
                }
            })
        );

        results.push(...batchResults);

        if (i + BATCH_SIZE < steamGames.length) {
            await delay(BATCH_DELAY_MS);
        }
    }

    return results;
}

async function handleSync(req: Request, res: Response, updateExisting: boolean) {
    try {
        const user = await userModel.getUser();

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        let steamGames: SteamOwnedGame[];
        try {
            steamGames = await fetchSteamLibrary(user);
        } catch {
            return res.status(502).json({ error: "Erro ao consultar a API da Steam." });
        }

        if (!steamGames.length) {
            return res.status(200).json([]);
        }

        const results = await syncGames(steamGames, { updateExisting });

        const hasErrors = results.some((r) => r.status === 'error');

        return res.status(hasErrors ? 207 : 200).json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}

router.get('/sync-games-from-steam', (req: Request, res: Response) =>
    handleSync(req, res, false)
);

router.get('/sync-and-update-games-from-steam', (req: Request, res: Response) =>
    handleSync(req, res, true)
);

export default router;