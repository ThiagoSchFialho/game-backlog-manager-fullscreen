import type { Game } from "../types/gamesType";
import { orderBy } from "../utils/orderBy";

export const useDb = () => {
    const host = import.meta.env.VITE_BACKEND_HOST;

    const fetchGames = async () => {
        try {
            const response = await fetch (`${host}/games`);
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao carregar jogos.", data.error);
                return null;
            }

            return data;

        } catch (error) {
            console.error("Erro ao carregar jogos.", error);
        }
    }

    const changeStatus = async (id: string, status: string) => {
        const MAX_PLAYING_GAMES = 5;

        if (status === "playing") {
            const games = (await fetchGames()) as Game[] | undefined;
            if (!games) return;

            const playingGames = games.filter((game: Game) => game.status === "playing");
            const orderedPlayingGames = orderBy(playingGames, "rtime_last_played", "asc");

            if (orderedPlayingGames.length >= MAX_PLAYING_GAMES) {
                const oldestGame = orderedPlayingGames[0];
                const freedSlot = await updateStatus(oldestGame.id, "played");
                if (!freedSlot) return;
            }
        }

        const updated = await updateStatus(id, status);
        if (!updated) return;
    };

    const handleStartGame = async (id: string, steamId: string) => {
        window.location.href = `steam://rungameid/${steamId}`;
        changeStatus(id, "playing");
    }

    const getGameById = async (id: string) => {
        try {
            const response = await fetch (`${host}/games/${id}`);
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao carregar jogos.", data.error);
                return null;
            }

            return data;

        } catch (error) {
            console.error("Erro ao carregar jogos.", error);
        }
    }

    const updateStatus = async (id: string, status: string) => {
        const game = await getGameById(id);
        if (!game) {
            console.error("Jogo não encontrado:", id);
            return null;
        }

        const dataISO = game.rtime_last_played;

        const timestampMs = new Date(dataISO).getTime();
        const timestampSegundos = Math.floor(timestampMs / 1000);
        
        const updatedGame = { ...game, status, rtime_last_played: timestampSegundos };

        try {
            const response = await fetch (`${host}/games/${updatedGame.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedGame)
            });
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao atualizar status.", data.error);
                return null;
            }

            return data;
        } catch (error) {
            console.error("Erro ao atualizar status.", error);
        }
    }

    const updateHidden = async (id: string, isHidden: boolean) => {
        const game = await getGameById(id);
        if (!game) {
            console.error("Jogo não encontrado:", id);
            return null;
        }

        const updatedGame = { ...game, hidden: !isHidden};

        try {
            const response = await fetch (`${host}/games/${updatedGame.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedGame)
            });
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao atualizar jogo.", data.error);
                return null;
            }

            return data;
        } catch (error) {
            console.error("Erro ao atualizar jogo.", error);
        }
    }

    const updateBeatable = async (id: string, isBeatable: boolean) => {
        const game = await getGameById(id);
        if (!game) {
            console.error("Jogo não encontrado:", id);
            return null;
        }

        const updatedGame = { ...game, beatable: !isBeatable};

        try {
            const response = await fetch (`${host}/games/${updatedGame.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedGame)
            });
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao atualizar jogo.", data.error);
                return null;
            }

            return data;
        } catch (error) {
            console.error("Erro ao atualizar jogo.", error);
        }
    }

    const syncSteam = async () => {
        try {
            const response = await fetch (`${host}/steam-api/sync-and-update-games-from-steam`);
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao sincronizar jogos.", data.error);
                return null;
            }

            return data;

        } catch (error) {
            console.error("Erro ao sincronizar jogos.", error);
        }
    }

    return { handleStartGame, getGameById, fetchGames, updateStatus, updateHidden, updateBeatable, syncSteam };
}