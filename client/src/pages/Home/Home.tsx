import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';
import GameLandscape from '../../components/GameLandscape/GameLandscape';
import arrow from '../../assets/icons/menu-arrow.svg';

const Home: React.FC = () => {
    const navigation = useNavigate();
    const { fetchGames } = useDb();
    const [selected] = useState('home');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    
    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            setGamesList(games);
        }
    }
    useEffect(() => {
        getGames();
    }, []);
    
    const games = orderBy(gamesList, 'rtime_last_played', 'desc');

    return (
        <>
            <SideMenu currentPage={selected} />
            <div className="home-main-content">
                {games.slice(0, 1).map(game => (
                    <GameLandscape
                        id={game.id}
                        steamId={game.steam_id}
                        img={getGameCover(game.title, 'landscape')}
                        name={game.title}
                    />
                ))}

                <div className="continue-playing-container">
                    <h1 className="continue-playing-title">Continue jogando</h1>
                    <div className="continue-playing">
                        {games.slice(1, 6).map(game => (
                            <GameCard
                                key={game.id}
                                id={game.id}
                                steamId={game.steam_id}
                                img={getGameCover(game.title, 'square')}
                                name={game.title}
                            />
                        ))}
                        <div onClick={() => navigation('/allGames')} className="continue-playing-more">
                            <img src={arrow} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;