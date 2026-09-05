import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './styles.css';
import Header from '../../components/Header/Header';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import type { ICollection } from '../../types/collectionsType';
import { useCollection } from '../../hooks/useCollection';

export type GameStatus = 'completed' | 'not-played' | 'played' | 'playing';

export interface Game {
    id: string;
    title: string;
    steam_id: string;
    cover_square: string;
    cover_hero: string;
    cover_grid: string;
    developer: string;
    release_date: string;
    favorite: boolean;
    personal_rating: number;
    playtime: number;
    status: GameStatus;
}

export interface Collection {
    id: string;
    title: string;
    games: Game[];
}

const Collection: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { fetchCollections } = useCollection();
    const [steamApiConnected, setSteamApiConnected] = useState(false);
    const [currentPage, setCurrentPage] = useState(`collection${id}`);
    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);
    const collection = collectionsList.find(c => c.id === id);

    useEffect(() => {
        setCurrentPage(`collection${id}`);
    }, [id]);

    useEffect(() => {
        const getCollections = async () => {
            const collections = await fetchCollections();
            if (collections) {
                setCollectionsList(collections);
                setSteamApiConnected(true);
            }
        }
        
        getCollections();
    }, []);

    return (
        <>
            <Header steamApiConnected={steamApiConnected} />
            <div className="main-container">
                <SideMenu currentPage={currentPage} />
                
                <div className="collection-main-content">
                    <div className="page-header">
                        <h1 className="title">{collection?.title}</h1>
                    </div>

                    <div className="collection-games-container">
                        {collection?.games.map(game => (
                            <GameCard
                                key={game.id}
                                id={game.id}
                                steamId={game.steam_id}
                                img={getGameCover(game.title)}
                                name={game.title}
                                status={game.status}
                                playtime={game.playtime}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Collection;