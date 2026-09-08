import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './styles.css';
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
    beatable: boolean;
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
    const [currentPage] = useState('collections');
    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);
    const collection = collectionsList.find(c => c.id === id);

    const getCollections = async () => {
        const collections = await fetchCollections();
        if (collections) {
            setCollectionsList(collections);
        }
    }
    useEffect(() => {
        getCollections();
    }, []);

    return (
        <>
            <SideMenu currentPage={currentPage} />
            
            <div className="main-content">
                <div className="title-collection-container">
                    <h1 className="title">{collection?.title}</h1>
                </div>

                <div className="collection-games-container">
                    {collection?.games.map(game => (
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

export default Collection;