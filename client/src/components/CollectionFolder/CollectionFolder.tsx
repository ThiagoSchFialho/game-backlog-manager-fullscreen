import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { getGameCover } from '../../utils/getGameCover';

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

interface ColelctionFolderProps {
    collection: Collection;
}

const CollectionFolder: React.FC<ColelctionFolderProps> = ({collection}) => {
    const navigation = useNavigate();

    return (
        <>  
            <div className="collection-folder-container">
                <div
                    onClick={() => navigation(`/collection/${collection.id}`)}
                    className="collection-folder"
                >
                    {collection.games.slice(0, 4).map(game => (
                        <div className="game">
                            <img
                                className="collection-game-img"
                                src={getGameCover(game.title, 'square')}
                            />
                        </div> 
                    ))}
                </div>
                <p>{collection.title}</p>
            </div>
        </>
    )
}

export default CollectionFolder;