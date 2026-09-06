import express, { Request, Response } from 'express';
import { GamesModel } from '../models/games.model';

const gamesModel = new GamesModel();
const router = express.Router();

interface CreateGameInput {
    title: string;
    steam_id: number;
    developer: string;
    release_date: string;
    rtime_last_played: string;
    playtime: number;
    status: string;
    cover_square?: string | undefined;
    cover_hero?: string | undefined;
    cover_grid?: string | undefined;
    personal_rating?: number | undefined;
    beatable?: boolean | undefined;
}

router.post('/', async function (req: Request, res: Response) {
    const {
        title,
        steam_id,
        developer,
        release_date,
        rtime_last_played,
        playtime,
        status,
        cover_square,
        cover_hero,
        cover_grid,
        personal_rating,
        beatable,
    }: CreateGameInput = req.body;

    const requiredFields: Record<string, unknown> = { title, steam_id, developer, release_date, playtime, status };

    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
            return res.status(400).json({ error: `${field} não informado.` });
        }
    }

    try {
        const game = await gamesModel.createGame({
            title,
            steam_id,
            developer,
            release_date,
            rtime_last_played,
            playtime,
            status,
            ...(cover_square !== undefined && { cover_square }),
            ...(cover_hero !== undefined && { cover_hero }),
            ...(cover_grid !== undefined && { cover_grid }),
            ...(personal_rating !== undefined && { personal_rating }),
            ...(beatable !== undefined && { beatable })
        });

        if (!game) {
            return res.status(500).json({ error: "Erro ao criar jogo." });
        }

        return res.status(201).json(game);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

router.get('/', async function (req: Request, res: Response) {
    const { steam_id } = req.query;

    try {
        if (steam_id) {
            const game = await gamesModel.getGameBySteamId(Number(steam_id));
            if (!game) {
                return res.status(404).json({ message: "Nenhum jogo encontrado." });
            }
            return res.status(200).json(game);
        }

        const games = await gamesModel.getAllGames();
        if (!games?.length) {
            return res.status(404).json({ message: "Nenhum jogo encontrado." });
        }
        return res.status(200).json(games);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

router.get('/with-genres', async function (req: Request, res: Response) {
    const { steam_id } = req.query;

    try {
        if (steam_id) {
            const game = await gamesModel.getGameBySteamIdWithGenres(Number(steam_id));
            if (!game) {
                return res.status(404).json({ message: "Nenhum jogo encontrado." });
            }
            return res.status(200).json(game);
        }

        const games = await gamesModel.getAllGamesWithGenres();
        if (!games?.length) {
            return res.status(404).json({ message: "Nenhum jogo encontrado." });
        }
        return res.status(200).json(games);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

router.get('/with-genres/:id', async function (req: Request, res: Response) {
    const { id } = req.params;

    try {
        const game = await gamesModel.getGameByIdWithGenres(Number(id));
        if (!game) {
            return res.status(404).json({ message: "Nenhum jogo encontrado." });
        }
        return res.status(200).json(game);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

router.get('/:id', async function (req: Request, res: Response) {
    const { id } = req.params;

    try {
        const game = await gamesModel.getGameById(Number(id));
        if (!game) {
            return res.status(404).json({ message: "Nenhum jogo encontrado." });
        }
        return res.status(200).json(game);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

router.put('/:id', async function (req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ error: "Id não informado." });
    }

    const {
        title,
        steam_id,
        developer,
        release_date,
        rtime_last_played,
        playtime,
        status,
        cover_square,
        cover_hero,
        cover_grid,
        personal_rating,
        beatable
    }: CreateGameInput = req.body;

    const requiredFields: Record<string, unknown> = { title, steam_id, developer, release_date, playtime, status };

    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
            return res.status(400).json({ error: `${field} não informado.` });
        }
    }

    try {
        const game = await gamesModel.getGameById(Number(id));

        if (!game) {
            return res.status(404).json({ message: "Jogo encontrado." });
        }

        const updatedGame = await gamesModel.updateGame(Number(id), {
            title,
            steam_id,
            developer,
            release_date,
            rtime_last_played,
            playtime,
            status,
            ...(cover_square !== undefined && { cover_square }),
            ...(cover_hero !== undefined && { cover_hero }),
            ...(cover_grid !== undefined && { cover_grid }),
            ...(personal_rating !== undefined && { personal_rating }),
            ...(beatable !== undefined && { beatable })
        });

        if (!updatedGame) {
            return res.status(500).json({ error: "Erro ao atualizar jogo." });
        }

        return res.status(201).json(updatedGame);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

router.delete('/:id', async function (req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Id não informado." });
    }

    try {
        const game = await gamesModel.deleteGame(Number(id));

        if (!game) {
            return res.status(500).json({ erro: "Erro ao excluir o jogo." });
        }

        return res.status(200).json(game);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});

export default router;