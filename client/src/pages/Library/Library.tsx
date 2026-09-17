import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameList from '../../components/GameList/GameList';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';


const Library: React.FC = () => {
    const { sortingMethod } = useParams<{ sortingMethod: string | undefined }>();
    const [currentPage] = useState('library');
    const { fetchGames } = useDb();
    const [gamesList, setGamesList] = useState<Game[]>([]);

    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            setGamesList(games.filter((game: Game) => !game.hidden));
        }
    }
    useEffect(() => {
        getGames();
    }, [])

    return (
        <>
            <SideMenu currentPage={currentPage} />
            <GameList list={gamesList} onReloadList={getGames} sortingMethod={sortingMethod} title='Biblioteca' />
        </>
    )
}
export default Library;