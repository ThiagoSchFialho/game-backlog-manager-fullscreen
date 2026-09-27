import React, { useState, useEffect } from 'react';
import GameList from '../../components/GameList/GameList';
import { useDb } from '../../hooks/useDb';
import { orderBy } from '../../utils/orderBy';
import type { Game } from '../../types/gamesType';


const MostPlayed: React.FC = () => {
    const { fetchGames } = useDb();
    const [gamesList, setGamesList] = useState<Game[]>([]);

    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            const orderdList = orderBy(games, 'playtime' ,'desc');
            setGamesList(orderdList);
        }
    }
    useEffect(() => {   
        getGames();
    }, []);
    
    return (
        <>
            <GameList list={gamesList} onReloadList={getGames} title='Mais jogados' />
        </>
    )
}
export default MostPlayed;