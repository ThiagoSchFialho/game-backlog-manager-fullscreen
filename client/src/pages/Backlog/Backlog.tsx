import React, { useState, useEffect } from 'react';
import GameList from '../../components/GameList/GameList';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';


const Backlog: React.FC = () => {
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

            const orderdList = orderBy(filteredGames, 'title' ,'asc');
            setGamesList(orderdList);
        }
    }
    useEffect(() => {   
        getGames();
    }, []);
    
    return (
        <>
            <GameList list={gamesList} onReloadList={getGames} page='Backlog' />
        </>
    )
}
export default Backlog;