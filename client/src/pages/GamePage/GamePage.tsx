import React, { useEffect, useState } from 'react';
import './styles.css';
import SideMenu from '../../components/SideMenu/SideMenu';
import { getGameCover } from '../../utils/getGameCover';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import GameLandscape from '../../components/GameLandscape/GameLandscape';
import { useNavigate, useParams } from 'react-router-dom';
import playing from '../../assets/icons/playing.svg';
import played from '../../assets/icons/played.svg';
import notPlayed from '../../assets/icons/not-played.svg';
import completed from '../../assets/icons/completed.svg';
import totalTime from '../../assets/icons/total-time.svg';
import trophy from '../../assets/icons/trophy.svg';
import JoystickSetup from '../../components/JoystickSetup/JoystickSetup';
import { orderBy } from '../../utils/orderBy';

type ScreenItem = {
    id: Game['id'];
    steamId: Game['steam_id'];
    img: string;
    name: Game['title'];
    action: () => void | Promise<void>;
};

const statusConfig = {
    playing: { icon: playing, label: 'Jogando', color: '#1FC06D' },
    played: { icon: played, label: 'Jogado', color: '#539FE9' },
    'not-played': { icon: notPlayed, label: 'Não jogado', color: '#D4AC27' },
    completed: { icon: completed, label: 'Zerado', color: '#7B5CFF' },
};

const GamePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigation = useNavigate();
    const { fetchGames, updateStatus } = useDb();
    const { getGameById } = useDb();
    const [currentGame, setCurrentGame] = useState<Game>();
    const currentStatus = statusConfig[currentGame?.status ?? 'not-played'];
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    useEffect(() => {
        const getGame = async () => {
            const game = await getGameById(String(id));
            if (game) {
                setCurrentGame(game);
            }
        }
        getGame();
    }, []);

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

    const screenItems: ScreenItem[] = currentGame ? [
        {
            id: currentGame.id,
            steamId: currentGame.steam_id,
            img: getGameCover(currentGame.title, 'landscape'),
            name: currentGame.title,
            action: () => handleStartGame(currentGame.id, currentGame.steam_id)
        }
    ] : [];

    const joystickNavigation = (command: string) => {
        if (command === 'A') {
            screenItems[selectedIndex]?.action();
        }
        if (command === 'B') {
            navigation(-1);
        }
    };

    return (
        <>
            <JoystickSetup command={joystickNavigation} />
            <SideMenu currentPage={''} />
            <div className="main-content">
                {!currentGame ? (
                    <p className="error-message">Jogo não encontrado</p>
                ): (
                    <>
                        <h1 className="game-page-title">{currentGame?.title}</h1>
                        {screenItems.slice(0, 1).map(item => (
                            <GameLandscape
                                id={item.id}
                                steamId={item.steamId}
                                img={item.img}
                                name={item.name}
                                isFocused={selectedIndex === 0}
                            />
                        ))}

                        <div className="game-page-details-container">
                            <div className="game-page-details-section">
                                <h2 className="game-page-details-section-title">Opções</h2>
                                <div className="game-page-details-item game-page-options-item">
                                    <p>Alterar status</p>
                                </div>
                                <div className="game-page-details-item game-page-options-item">
                                    <p>Adicionar à coleção</p>
                                </div>
                                <div className="game-page-details-item game-page-options-item">
                                    <p>Ocultar jogo</p>
                                </div>
                            </div>

                            <div className="game-page-details-section">
                                <h2 className="game-page-details-section-title">Estatísticas</h2>
                                <div className="game-page-details-item game-page-statistics-item">
                                    <div>
                                        <img src={currentStatus.icon} />
                                        <p style={{color: currentStatus.color, fontWeight: '500'}}>{currentStatus.label}</p>
                                    </div>
                                </div>
                                <div className="game-page-details-item game-page-statistics-item">
                                    <div>
                                        <img src={totalTime} />
                                        <p className="title">Tempo total</p>
                                    </div>
                                    <p>{currentGame.playtime < 60
                                        ? `${currentGame.playtime}min`
                                        : `${Math.floor(currentGame.playtime / 60)}h${currentGame.playtime % 60 > 0 ? ` ${currentGame.playtime % 60}min` : ''}`}
                                    </p>
                                </div>
                                <div className="game-page-details-item game-page-statistics-item">
                                    <div>
                                        <img src={trophy} />
                                        <p className="title">Conquistas</p>
                                    </div>
                                    <p>?/?</p>
                                </div>
                            </div>

                            <div className="game-page-details-section">
                                <h2 className="game-page-details-section-title">Conquistas recentes</h2>
                                <div className="game-page-achievements">

                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

export default GamePage;