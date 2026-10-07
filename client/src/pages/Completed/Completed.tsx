import React, { useState, useEffect } from 'react';
import GameList from '../../components/GameList/GameList';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';


const Completed: React.FC = () => {
    const { fetchGames } = useDb();
    const [gamesList, setGamesList] = useState<Game[]>([]);

    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            const filteredGames = games.filter((game: Game) => game.status === 'completed');
            const orderdList = orderBy(filteredGames, 'title' ,'asc');
            setGamesList(orderdList);
        }
    }
    useEffect(() => {   
        getGames();
    }, []);
    
    return (
        <>
            <GameList list={gamesList} onReloadList={getGames} page='Zerados' />
        </>
    )
}
export default Completed;