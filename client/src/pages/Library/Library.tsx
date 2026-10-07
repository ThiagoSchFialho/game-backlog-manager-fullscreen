import React, { useState, useEffect } from 'react';
import GameList from '../../components/GameList/GameList';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';


const Library: React.FC = () => {
    const { fetchGames } = useDb();
    const [gamesList, setGamesList] = useState<Game[]>([]);

    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            setGamesList(games);
        }
    }
    useEffect(() => {
        getGames();
    }, [])

    return (
        <>
            <GameList list={gamesList} onReloadList={getGames} page='Biblioteca' />
        </>
    )
}
export default Library;