import React from 'react';
import './styles.css';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';

interface GameCardsProps {
    id: string;
    steamId: string;
    img: string;
    name: string;
}

const GameCard: React.FC<GameCardsProps> = ({ id, steamId, img, name }) => {
    const { fetchGames, updateStatus } = useDb();
    
    const getGames = async () => {
        const games = await fetchGames();
        if (!games) {
            alert("Erro ao recuperar jogos.");
        }
        return games;
    }

    const changeStatus = async (id: string, status: string) => {
        const MAX_PLAYING_GAMES = 5;

        if (status === "playing") {
            const games = await getGames();
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

    return (
        <div className="game-card">
            <img
                onClick={() => handleStartGame(id, steamId)}
                className="game-card-img"
                src={img}
                alt={name}
            />
        </div>
    );
};

export default GameCard;