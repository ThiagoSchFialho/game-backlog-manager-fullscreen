import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { getGameCover } from '../../utils/getGameCover';
import { useCollection } from '../../hooks/useCollection';
import closeIcon from '../../assets/icons/close.svg';

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

interface ColelctionFolderProps {
    collection: Collection;
}

const CollectionFolder: React.FC<ColelctionFolderProps> = ({collection}) => {
    const { deleteCollection, updateCollectionTitle } = useCollection();
    const navigation = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
    const [collectionTitle, setCollectionTitle] = useState<string | undefined>('');
    
    const cancelClose = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const scheduleClose = () => {
        cancelClose();
        closeTimeoutRef.current = setTimeout(() => {
            setIsMenuOpen(false);
        }, 150);
    };

    const handleDeleteCollection = async (id: string, name: string) => {
        const confirmation = confirm(`Quer mesmo excluir a coleção '${name}'?`)
        if (confirmation) {
            const result = await deleteCollection(id);
            if (!result) {
                return;
            }

            window.location.reload();
            alert("Coleção excluida com sucesso.");
        }
    }

    const handleRenameCollection = async (collection: Collection) => {
        setIsCollectionFormOpen(false);
        if (collectionTitle) {
            const result = await updateCollectionTitle(String(collection.id), collectionTitle);
            if (!result) {
                return;
            }
        }
        setCollectionTitle('');
        window.location.reload();
    }

    return (
        <>
            {isCollectionFormOpen && (
                <div className="collection-title-form-container">
                    <img onClick={() => setIsCollectionFormOpen(false)} src={closeIcon}/>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <label htmlFor="collection-title">Nome da Coleção</label>
                        <input
                            type="text"
                            name="collection-title"
                            id="collection-title"
                            required
                            value={collectionTitle}
                            onChange={(e) => setCollectionTitle(e.target.value)}
                        />
                            <div onClick={() => handleRenameCollection(collection)}>Renomear Coleção</div>
                    </form>
                </div>
            )}  
            <div className="collection-folder-container">
                {menuPos && isMenuOpen && (
                    <div
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}
                        style={{ position: 'fixed', top: (menuPos.y - 10), left: (menuPos.x - 10) }}
                        className="custom-menu"
                    >
                        <ul>
                            <li onClick={() => {
                                setIsMenuOpen(false)
                                setIsCollectionFormOpen(true)
                            }}
                            >Renomear Coleção</li>
                            <li
                                onClick={() => handleDeleteCollection(collection.id, collection.title)}
                                style={{color: '#D43A2D'}}
                            >Excluir Coleção</li>

                        </ul>
                    </div>
                )}
                <div
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setMenuPos({ x: e.clientX, y: e.clientY });
                        setIsMenuOpen(true);
                    }}
                    onClick={() => navigation(`/collection/${collection.id}`)}
                    className="collection-folder"
                >
                    {collection.games.slice(0, 4).map(game => (
                        <div className="game">
                            <img
                                className="collection-game-img"
                                src={getGameCover(game.title)}
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