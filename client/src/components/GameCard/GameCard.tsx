import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import playing from '../../assets/icons/playing.svg';
import played from '../../assets/icons/played.svg';
import notPlayed from '../../assets/icons/not-played.svg';
import completed from '../../assets/icons/completed.svg';
import clock from '../../assets/icons/clock.svg';
import menuArrow from '../../assets/icons/menu-arrow.svg';
import { useDb } from '../../hooks/useDb';
import type { ICollection } from '../../types/collectionsType';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';
import { useCollection } from '../../hooks/useCollection';

interface GameCardsProps {
    id: string;
    steamId: string;
    img: string;
    name: string;
    status: 'completed' | 'not-played' | 'played' | 'playing';
    playtime: number;
}

const statusConfig = {
    playing: { icon: playing, label: 'Jogando' },
    played: { icon: played, label: 'Jogado' },
    'not-played': { icon: notPlayed, label: 'Não jogado' },
    completed: { icon: completed, label: 'Zerado' },
};

const GameCard: React.FC<GameCardsProps> = ({ id, steamId, img, name, status, playtime }) => {
    const { fetchGames, updateStatus } = useDb();
    const { fetchCollections, addToCollection, deleteFromCollection, getCollectionsFromGame } = useCollection();
    const currentStatus = statusConfig[status];
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isChangeStatusMenuOpen, setIsChangeStatusMenuOpen] = useState<boolean>(false);
    const [isAddToCollectionMenuOpen, setIsAddToCollectionMenuOpen] = useState<boolean>(false);
    const [isRemoveFromCollectionMenuOpen, setisRemoveFromCollectionMenuOpen] = useState<boolean>(false);
    const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);
    const [gameCollectionsList, setGameCollectionsList] = useState<ICollection[]>([]);
    
    useEffect(() => {
        const getCollections = async () => {
            const collections = await fetchCollections();
            if (collections) {
                setCollectionsList(collections);
            }
        }
        
        const getGameCollections = async () => {
            const gameCollections = await getCollectionsFromGame(id);
            if (gameCollections) {
                setGameCollectionsList(gameCollections);
            }
        }

        getCollections();
        getGameCollections();
    }, []);

    const getGames = async () => {
        const games = await fetchGames();
        if (!games) {
            alert("Erro ao recuperar jogos.");
        }
        return games;
    }

    const changeStatus = async (id: string, status: string) => {
        const MAX_PLAYING_GAMES = 5;

        if (status === "playing") {
            const games = await getGames();
            const playingGames = games.filter((game: Game) => game.status === "playing");
            const orderedPlayingGames = orderBy(playingGames, "rtime_last_played", "asc");

            if (orderedPlayingGames.length >= MAX_PLAYING_GAMES) {
                const oldestGame = orderedPlayingGames[0];
                const freedSlot = await updateStatus(oldestGame.id, "played");
                if (!freedSlot) return;
            }
        }

        const updated = await updateStatus(id, status);
        if (!updated) return;

        window.location.reload();
    };

    const cancelClose = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const closeMenus = () => {
        setIsMenuOpen(false);
        setIsChangeStatusMenuOpen(false);
        setIsAddToCollectionMenuOpen(false);
        setisRemoveFromCollectionMenuOpen(false);
    }

    const scheduleClose = () => {
        cancelClose();
        closeTimeoutRef.current = setTimeout(() => {
            closeMenus();
        }, 150);
    }; 

    const handleStatusChange = async (id: string, status: string) => {
        closeMenus();
        changeStatus(id, status);
    }

    const handleAddToCollection = async (gameId: string, collectionId: string) => {
        closeMenus();
        const result = await addToCollection(Number(gameId), Number(collectionId));

        if (!result) {
            return;
        }

        if (result.error) {
            alert(result.error);
        } else {
            window.location.reload();
        }
    }

    const handleRemoveFromCollection = async (gameId: string, collectionId: string) => {
        closeMenus();
        const result = await deleteFromCollection(Number(gameId), Number(collectionId));

        if (!result) {
            return;
        }

        if (result.error) {
            alert(result.error);
        } else {
            window.location.reload();
        }
    }

    const handleHideGame = (name: string) => {
        closeMenus();
        console.log(name);
    }

    const handleStartGame = async (id: string, steamId: string) => {
        closeMenus();
        window.location.href = `steam://rungameid/${steamId}`;
        changeStatus(id, "playing");
    }

    return (
        <div className="game-card">
            {menuPos && isMenuOpen && (
                <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    style={{ position: 'fixed', top: (menuPos.y - 10), left: (menuPos.x - 10) }}
                    className="custom-menu"
                >
                    <ul>
                        <li onMouseOver={() => {
                            setIsChangeStatusMenuOpen(true);
                            setIsAddToCollectionMenuOpen(false);
                            setisRemoveFromCollectionMenuOpen(false);
                        }}>
                            Alterar status
                            <img src={menuArrow} />
                        </li>
                        <li onMouseOver={() => {
                            setIsChangeStatusMenuOpen(false);
                            setIsAddToCollectionMenuOpen(true);
                            setisRemoveFromCollectionMenuOpen(false);
                        }}>
                            Adicionar a coleção
                            <img src={menuArrow} />
                        </li>
                        {gameCollectionsList.length > 0 && (
                            <li onMouseOver={() => {
                                setIsChangeStatusMenuOpen(false);
                                setIsAddToCollectionMenuOpen(false);
                                setisRemoveFromCollectionMenuOpen(true);
                            }}>
                                Remover da coleção
                                <img src={menuArrow} />
                            </li>
                        )}
                        <li onClick={() => handleHideGame(name)}>Ocultar</li>
                    </ul>
                </div>
            )}
            {menuPos && isChangeStatusMenuOpen && (
                <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    style={{ position: 'fixed', top: (menuPos.y - 5), left: (menuPos.x + 240) }}
                    className="custom-menu"
                >
                    <ul>
                        <li onClick={() => handleStatusChange(id, 'completed')}>Zerado</li>
                        <li onClick={() => handleStatusChange(id, 'playing')}>Jogando</li>
                        <li onClick={() => handleStatusChange(id, 'played')}>Jogado</li>
                        <li onClick={() => handleStatusChange(id, 'not-played')}>Não jogado</li>
                    </ul>
                </div>
            )}
            {menuPos && isAddToCollectionMenuOpen && (
                <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    style={{ position: 'fixed', top: (menuPos.y + 35), left: (menuPos.x + 240) }}
                    className="custom-menu"
                >
                    <ul>
                        {collectionsList.map(collection => (
                            <li onClick={() => handleAddToCollection(id, collection.id)}>{collection.title}</li>
                        ))}
                    </ul>
                </div>
            )}
            {menuPos && isRemoveFromCollectionMenuOpen && (
                <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    style={{ position: 'fixed', top: (menuPos.y + 75), left: (menuPos.x + 240) }}
                    className="custom-menu"
                >
                    <ul>
                        {gameCollectionsList.map(collection => (
                            <li onClick={() => handleRemoveFromCollection(id, collection.id)}>{collection.title}</li>
                        ))}
                    </ul>
                </div>
            )}
            <img
                onClick={() => handleStartGame(id, steamId)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setMenuPos({ x: e.clientX, y: e.clientY });
                    setIsMenuOpen(true);
                }}
                className="game-img"
                src={img}
                alt={name}
            />
            <div className="game-card-info">
                <h1>{name}</h1>
                <div className="game-footer-info-container">
                    <div className="game-status-container">
                        <img className="game-status" src={currentStatus.icon} alt={currentStatus.label} />
                        <p className={status}>{currentStatus.label}</p>
                    </div>
                    <div className="playtime-container">
                        <img className="playtime-icon" src={clock} alt="relógio" />
                        <p className="aditional-text">
                        {playtime < 60
                            ? `${playtime}m`
                            : `${Math.floor(playtime / 60)}h${playtime % 60 > 0 ? ` ${playtime % 60}m` : ''}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameCard;