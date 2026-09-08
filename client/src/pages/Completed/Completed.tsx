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

const Completed: React.FC = () => {
    const { fetchGames } = useDb();
    const [currentPage] = useState('completed');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    const [sortedGamesList, setSortedGamesList] = useState<Game[]>([]);
    const [sortMethod, setSortMethod] = useState('alphabet');
    const [selectedSortingMethod, setSelectedSorginMethod] = useState(sortMethod);
        
    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            const filteredGames = games.filter((game: Game) => game.status === 'completed');
            setGamesList(filteredGames);
        }
    }
    useEffect(() => {   
        getGames();
    }, []);
    
    const sortGames = (method: string, list: Game[] = gamesList) => {
        setSortMethod(method);
        if (method === 'recentlyPlayed') {
            setSelectedSorginMethod('recentlyPlayed')
            setSortedGamesList(orderBy(list, 'rtime_last_played', 'desc'));
        } else if (method === 'mostPlayed') {
            setSelectedSorginMethod('mostPlayed')
            setSortedGamesList(orderBy(list, 'playtime', 'desc'));
        } else if (method === 'alphabet') {
            setSelectedSorginMethod('alphabet')
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
                <div className="sortings-container">
                    <ul>
                        <li
                            className={selectedSortingMethod === 'recentlyPlayed' ? 'selected-method' : ''}
                            onClick={() => sortGames('recentlyPlayed')}
                        >
                            <img src={recentlyPlayed} />
                            <p>Jogados Recentemente</p>
                        </li>
                        <li
                            className={selectedSortingMethod === 'mostPlayed' ? 'selected-method' : ''}
                            onClick={() => sortGames('mostPlayed')}
                        >
                            <img src={mostPlayed} />
                            <p>Mais jogados</p>
                        </li>
                        <li
                            className={selectedSortingMethod === 'alphabet' ? 'selected-method' : ''}
                            onClick={() => sortGames('alphabet')}
                        >
                            <img src={alphabet} />
                            <p>Alfabeticamente</p>
                        </li>
                    </ul>
                </div>
                <div className="completed-games-container">
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

export default Completed;