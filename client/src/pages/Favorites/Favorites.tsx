import React, { useEffect, useState } from 'react';
import './styles.css';
import Header from '../../components/Header/Header';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import type { Game } from '../../types/gamesType';
import { useDb } from '../../hooks/useDb';


const Favorites: React.FC = () => {
    const { fetchGames } = useDb();
    const [steamApiConnected, setSteamApiConnected] = useState(false);
    const [currentPage] = useState('favorites');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    
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
    
    const favoriteGames = gamesList.filter(game => game.favorite === true);

    return (
        <>
            <Header steamApiConnected={steamApiConnected} />
            <div className="main-container">
                <SideMenu currentPage={currentPage} />
                
                <div className="favorites-main-content">
                    <div className="page-header">
                        <h1 className="title">Favoritos</h1>
                    </div>

                    <div className="favorites-games-container">
                        {favoriteGames.length === 0 ? (
                            <h2>Nenhum jogo favorito ainda.</h2>
                        ): (
                            favoriteGames.map(game => (
                                <GameCard
                                    key={game.id}
                                    id={game.id}
                                    steamId={game.steam_id}
                                    img={getGameCover(game.title)}
                                    name={game.title}
                                    status={game.status}
                                    playtime={game.playtime}
                                />
                            )
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Favorites;