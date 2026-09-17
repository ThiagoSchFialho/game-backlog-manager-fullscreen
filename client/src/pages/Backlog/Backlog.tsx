import React, { useState, useEffect } from 'react';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameList from '../../components/GameList/GameList';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';


const Backlog: React.FC = () => {
    const [currentPage] = useState('backlog');
    const { fetchGames } = useDb();
    const [gamesList, setGamesList] = useState<Game[]>([]);

    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            const filteredGames = games.filter((game: Game) => {
                if (game.status !== 'completed' && game.beatable === true) {
                    if (!game.hidden) {
                        return game;
                    }
                }
            });
            setGamesList(filteredGames);
        }
    }
    useEffect(() => {   
        getGames();
    }, []);
    
    return (
        <>
            <SideMenu currentPage={currentPage} />
            <GameList list={gamesList} onReloadList={getGames} sortingMethod={undefined} title='Backlog' />
        </>
    )
}
export default Backlog;