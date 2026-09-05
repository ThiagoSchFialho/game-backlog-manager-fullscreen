import React, { useEffect, useState } from 'react';
import './styles.css';
import Header from '../../components/Header/Header';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import type { Game } from '../../types/gamesType';
import { useDb } from '../../hooks/useDb';
import { orderBy } from '../../utils/orderBy';
import SyncSteamBtn from '../../components/syncSteamBtn/SyncSteamBtn';
import arrow from '../../assets/icons/menu-arrow.svg';

const Backlog: React.FC = () => {
    const { fetchGames } = useDb();
    const [steamApiConnected, setSteamApiConnected] = useState(false);
    const [currentPage] = useState('backlog');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    const [isPlayedSectionOpen, setIsPlayedSectionOpen] = useState(false);
    const [isNotPlayedSectionOpen, setIsNotPlayedSectionOpen] = useState(false);
    
    useEffect(() => {
        const getGames = async () => {
            const games = await fetchGames();
            if (games) {
                setGamesList(games);
                setSteamApiConnected(true);
            }
        }
        
        getGames();
    }, []);
        
    const playingGames = orderBy(gamesList.filter(game => game.status === 'playing'), 'rtime_last_played', 'desc');
    const playedGames = orderBy(gamesList.filter(game => game.status === 'played'), 'title', 'asc');
    const notPlayedGames = orderBy(gamesList.filter(game => game.status === 'not-played'), 'title', 'asc');

    return (
        <>
            <Header steamApiConnected={steamApiConnected} />
            <div className="main-container">
                <SideMenu currentPage={currentPage} />
                
                <div className="backlog-main-content">
                    <div className="page-header">
                        <h1 className="title">Backlog</h1>
                        <SyncSteamBtn />
                    </div>

                    <section id="playing-section">
                        <div className="backlog-games-container backlog-playing-games">
                            <h1 className="backlog-games-container-title">Jogando</h1>
                            <div className="game-container">
                                {playingGames.slice(0, 5).map(game => (
                                    <GameCard
                                        key={game.id}
                                        id={game.id}
                                        steamId={game.steam_id}
                                        img={getGameCover(game.title)}
                                        name={game.title}
                                        status={game.status}
                                        playtime={game.playtime}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="played-section">
                            <div className="backlog-games-container backlog-played-games">
                                <div className="backlog-games-container-header">
                                    <h1 className="backlog-games-container-title">Jogado</h1>
                                    <img
                                        onClick={() => setIsPlayedSectionOpen(!isPlayedSectionOpen)}
                                        className={isPlayedSectionOpen ? "expand-arrow-active" : "expand-arrow"}
                                        src={arrow}
                                    />
                                </div>
                                <div className="game-container">
                                    {isPlayedSectionOpen ? playedGames.map(game => (
                                        <GameCard
                                            key={game.id}
                                            id={game.id}
                                            steamId={game.steam_id}
                                            img={getGameCover(game.title)}
                                            name={game.title}
                                            status={game.status}
                                            playtime={game.playtime}
                                        />
                                    )) : playedGames.slice(0, 5).map(game => (
                                        <GameCard
                                            key={game.id}
                                            id={game.id}
                                            steamId={game.steam_id}
                                            img={getGameCover(game.title)}
                                            name={game.title}
                                            status={game.status}
                                            playtime={game.playtime}
                                        />
                                    ))}
                                </div>
                            </div>
                    </section>
                    
                    <section id="not-played-section">
                            <div className="backlog-games-container backlog-not-played-games">
                                <div className="backlog-games-container-header">
                                    <h1 className="backlog-games-container-title">Não jogado</h1>
                                    <img
                                        onClick={() => setIsNotPlayedSectionOpen(!isNotPlayedSectionOpen)}
                                        className={isNotPlayedSectionOpen ? "expand-arrow-active" : "expand-arrow"}
                                        src={arrow}
                                    />
                                </div>
                                <div className="game-container">
                                    {isNotPlayedSectionOpen ? notPlayedGames.map(game => (
                                        <GameCard
                                            key={game.id}
                                            id={game.id}
                                            steamId={game.steam_id}
                                            img={getGameCover(game.title)}
                                            name={game.title}
                                            status={game.status}
                                            playtime={game.playtime}
                                        />
                                    )) : notPlayedGames.slice(0, 5).map(game => (
                                        <GameCard
                                            key={game.id}
                                            id={game.id}
                                            steamId={game.steam_id}
                                            img={getGameCover(game.title)}
                                            name={game.title}
                                            status={game.status}
                                            playtime={game.playtime}
                                        />
                                    ))}
                                </div>
                            </div>
                    </section>
                </div>
            </div>
        </>
    )
}

export default Backlog;