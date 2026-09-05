import React, { useEffect, useState } from 'react';
import './styles.css';
import Header from '../../components/Header/Header';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import type { Game } from '../../types/gamesType';
import { useDb } from '../../hooks/useDb';
import { orderBy } from '../../utils/orderBy';

const Completed: React.FC = () => {
    const { fetchGames } = useDb();
    const [steamApiConnected, setSteamApiConnected] = useState(false);
    const [currentPage] = useState('completed');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    
    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            setGamesList(games);
            setSteamApiConnected(true);
        }
    }
    useEffect(() => {   
        getGames();
    }, []);

    const completedGames = orderBy(gamesList.filter(game => game.status === "completed"), 'title', 'asc');

    return (
        <>
            <Header steamApiConnected={steamApiConnected} />
            <div className="main-container">
                <SideMenu currentPage={currentPage} />
                
                <div className="completed-main-content">
                    <div className="page-header">
                        <h1 className="title">Zerados</h1>
                    </div>

                    <div className="completed-games-container">
                        {completedGames.length === 0 ? (
                            <h2>Nenhum jogo zerado ainda.</h2>
                        ): (
                            completedGames.map(game => (
                                <GameCard
                                    key={game.id}
                                    id={game.id}
                                    steamId={game.steam_id}
                                    img={getGameCover(game.title)}
                                    name={game.title}
                                    status={game.status}
                                    playtime={game.playtime}
                                    onUpdate={getGames}
                                />
                            )
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Completed;