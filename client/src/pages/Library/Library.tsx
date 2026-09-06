import React, { useState, useEffect } from 'react';
import './styles.css';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import type { Game } from '../../types/gamesType';
import { useDb } from '../../hooks/useDb';
import recentlyPlayed from '../../assets/icons/recently-played.svg';
import mostPlayed from '../../assets/icons/most-played.svg'
import alphabet from '../../assets/icons/alphabet.svg';
import { orderBy } from '../../utils/orderBy';

const Library: React.FC = () => {
    const { fetchGames } = useDb();
    const [currentPage] = useState('library');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    const [sortedGamesList, setSortedGamesList] = useState<Game[]>([]);
    const [sortMethod, setSortMethod] = useState('recentlyPlayed');
        
    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            setGamesList(games);
        }
    }
    useEffect(() => {   
        getGames();
    }, []);
    
    const sortGames = (method: string, list: Game[] = gamesList) => {
        setSortMethod(method);
        if (method === 'recentlyPlayed') {
            setSortedGamesList(orderBy(list, 'rtime_last_played', 'desc'));
        } else if (method === 'mostPlayed') {
            setSortedGamesList(orderBy(list, 'playtime', 'desc'));
        } else if (method === 'alphabet') {
            setSortedGamesList(orderBy(list, 'title', 'asc'));
        }
    }
    useEffect(() => {
        sortGames(sortMethod, gamesList);
    }, [gamesList]);

    return (
        <>
            <SideMenu currentPage={currentPage} />
            <div className="main-content">
                <div className="filters-container">
                    <ul>
                        <li onClick={() => sortGames('recentlyPlayed')} >
                            <img src={recentlyPlayed} />
                            <p>Jogados Recentemente</p>
                        </li>
                        <li onClick={() => sortGames('mostPlayed')} >
                            <img src={mostPlayed} />
                            <p>Mais jogados</p>
                        </li>
                        <li onClick={() => sortGames('alphabet')} >
                            <img src={alphabet} />
                            <p>Alfabeticamente</p>
                        </li>
                    </ul>
                </div>
                <div className="list-game-container">
                    {sortedGamesList.map(game => (
                        <GameCard
                            key={game.id}
                            id={game.id}
                            steamId={game.steam_id}
                            img={getGameCover(game.title, 'square')}
                            name={game.title}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default Library;