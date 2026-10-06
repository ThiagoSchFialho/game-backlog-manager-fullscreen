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

    const handleStartGame = async (id: string, steamId: string) => {
        window.location.href = `steam://rungameid/${steamId}`;
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
        try {
            const response = await fetch (`${host}/games/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
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
        try {
            const response = await fetch (`${host}/games/${id}/hidden`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hidden: !isHidden })
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
        try {
            const response = await fetch (`${host}/games/${id}/beatable`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ beatable: !isBeatable })
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

    const syncPlaytime = async () => {
        try {
            const response = await fetch (`${host}/steam-api/sync-playtime-from-steam`);
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao sincronizar playtime.", data.error);
                return null;
            }

            return data;

        } catch (error) {
            console.error("Erro ao sincronizar playtime.", error);
        }
    }

    const syncRtimeLastPlayed = async () => {
        try {
            const response = await fetch (`${host}/steam-api/sync-rtime-last-played-from-steam`);
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao sincronizar rtime_last_played.", data.error);
                return null;
            }

            return data;

        } catch (error) {
            console.error("Erro ao sincronizar rtime_last_played.", error);
        }
    }

    return {
        handleStartGame,
        getGameById,
        fetchGames,
        updateStatus,
        updateHidden,
        updateBeatable,
        syncSteam,
        syncPlaytime,
        syncRtimeLastPlayed
    };
}