import React, { useState, useEffect } from 'react';
import GameList from '../../components/GameList/GameList';
import { useDb } from '../../hooks/useDb';
import { useSystem } from '../../hooks/useSystem';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';


const Home: React.FC = () => {
    const { fetchGames } = useDb();
    const { fetchInstalledGames } = useSystem();
    const [gamesList, setGamesList] = useState<Game[]>([]);

    const getGames = async () => {
        const [games, installedApps] = await Promise.all([
            fetchGames(),
            fetchInstalledGames(),
        ]);

        if (games) {
            const installedIds = new Set(installedApps.map((app) => app.appId));
            const orderedList = orderBy(games, 'rtime_last_played', 'desc');

            setGamesList(
                orderedList.filter(
                    (game: Game) => !game.hidden && installedIds.has(Number(game.steam_id))
                )
            );
        }
    }
    useEffect(() => {
        getGames();
    }, [])

    return (
        <>
            <GameList list={gamesList} onReloadList={getGames} page='Início' />
        </>
    )
}
export default Home;