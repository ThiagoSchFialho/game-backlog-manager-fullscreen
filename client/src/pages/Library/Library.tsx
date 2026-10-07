import React, { useState, useEffect } from 'react';
import GameList from '../../components/GameList/GameList';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';
import './styles.css';


const Library: React.FC = () => {
    const { fetchGames } = useDb();
    const [gamesList, setGamesList] = useState<Game[]>([]);

    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            const orderdList = orderBy(games, 'title' ,'asc');
            setGamesList(orderdList.filter((game: Game) => !game.hidden));
        }
    }
    useEffect(() => {
        getGames();
    }, [])

    return (
        <>
            <div className="page-header">
                <h1 className="page-header-title">Biblioteca</h1>
                <div className="degrade"></div>
            </div>
            <GameList list={gamesList} onReloadList={getGames} title='Biblioteca' />
        </>
    )
}
export default Library;