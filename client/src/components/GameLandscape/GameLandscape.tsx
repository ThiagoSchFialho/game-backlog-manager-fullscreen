import React from 'react';
import './styles.css';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';
import play from '../../assets/icons/play.svg';

interface GameLandscapeProps {
    id: string;
    steamId: string;
    img: string;
    name: string;
}

const GameLandscape: React.FC<GameLandscapeProps> = ({ id, steamId, img, name }) => {
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
        <div className="game-landscape">
            <img
                className="game-landscape-img"
                src={img}
                alt={name}
            />
            <div onClick={() => handleStartGame(id, steamId)} className="play-btn-landscape">
                <img src={play} alt="play" />
                <p>Jogar</p>
            </div>
        </div>
    );
};

export default GameLandscape;