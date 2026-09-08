import React, { useEffect, useRef, useState } from "react";
import './styles.css';
import menuArrow from '../../assets/icons/menu-arrow.svg';
import playIcon from '../../assets/icons/play.svg';
import { useCollection } from "../../hooks/useCollection";
import { useDb } from "../../hooks/useDb";
import type { ICollection } from "../../types/collectionsType";
import type { Game } from "../../types/gamesType";
import { orderBy } from "../../utils/orderBy";

interface GameActionsMenuProps {
    gameId: string;
    gameSteamId: string;
    isOpen: boolean;
    closeMenu: () => void;
}

const GameActionsMenu: React.FC<GameActionsMenuProps> = ({ gameId, gameSteamId, isOpen, closeMenu }) => {
    const { fetchGames, updateStatus } = useDb();
    const { fetchCollections, addToCollection, deleteFromCollection, getCollectionsFromGame } = useCollection();
    const [isChangeStatusMenuOpen, setIsChangeStatusMenuOpen] = useState<boolean>(false);
    const [isAddToCollectionMenuOpen, setIsAddToCollectionMenuOpen] = useState<boolean>(false);
    const [isRemoveFromCollectionMenuOpen, setisRemoveFromCollectionMenuOpen] = useState<boolean>(false);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);
    const [gameCollectionsList, setGameCollectionsList] = useState<ICollection[]>([]);

    const getGames = async () => {
        const games = await fetchGames();
        if (!games) {
            alert("Erro ao recuperar jogos.");
        }
        return games;
    }
    
    const getCollections = async () => {
        const collections = await fetchCollections();
        if (collections) {
            setCollectionsList(collections);
        }
    }
    
    const getGameCollections = async () => {
        const gameCollections = await getCollectionsFromGame(gameId);
        if (gameCollections) {
            setGameCollectionsList(gameCollections);
        }
    }

    useEffect(() => {
        getCollections();
        getGameCollections();
    }, []);

    const cancelClose = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const closeMenus = () => {
        setIsChangeStatusMenuOpen(false);
        setIsAddToCollectionMenuOpen(false);
        setisRemoveFromCollectionMenuOpen(false);
    }

    const scheduleClose = () => {
        cancelClose();
        closeTimeoutRef.current = setTimeout(() => {
            closeMenus();
        }, 250);
    };

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

        getCollections();
        getGameCollections();
        closeMenu?.();
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
            getCollections();
            getGameCollections();
            closeMenu?.();
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
            getCollections();
            getGameCollections();
            closeMenu?.();
        }
    }

    const handleHideGame = (id: string) => {
        console.error("'handleHideGame' -> Funcion not implemented.");
    }

    const handleStartGame = async (id: string, steamId: string) => {
        window.location.href = `steam://rungameid/${steamId}`;
        changeStatus(id, "playing");
    }

    return (
        <>
            {isChangeStatusMenuOpen && (
                <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    className="game-actions-menu sub-menu"
                    style={{transform: 'translate(170px, -35px)'}}
                >
                    <ul>
                        <li onClick={() => handleStatusChange(gameId, 'completed')}>Zerado</li>
                        <li onClick={() => handleStatusChange(gameId, 'playing')}>Jogando</li>
                        <li onClick={() => handleStatusChange(gameId, 'played')}>Jogado</li>
                        <li onClick={() => handleStatusChange(gameId, 'not-played')}>Não jogado</li>
                    </ul>
                </div>
            )}
            {isAddToCollectionMenuOpen && (
                <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    className="game-actions-menu sub-menu"
                    style={{transform: 'translate(170px, 25px)'}}
                >
                    <ul>
                        {collectionsList.length > 0 ? collectionsList.map(collection => (
                            <li onClick={() => handleAddToCollection(gameId, collection.id)}>{collection.title}</li>
                        )): (<p>Nenhuma coleção criada</p>)}
                    </ul>
                </div>
            )}
            {isRemoveFromCollectionMenuOpen && (
                <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    className="game-actions-menu sub-menu"
                    style={{transform: 'translate(170px, 85px)'}}
                >
                    <ul>
                        {gameCollectionsList.map(collection => (
                            <li onClick={() => handleRemoveFromCollection(gameId, collection.id)}>{collection.title}</li>
                        ))}
                    </ul>
                </div>
            )}
            {isOpen && (
                <div className="game-actions-menu">
                    <ul>
                        <li
                            onMouseEnter={closeMenus}
                            onClick={() => handleStartGame(gameId, gameSteamId)}
                            className="game-actions-menu-play-btn"
                        >
                            <div>
                                <img src={playIcon} />
                                Jogar
                            </div>
                        </li>
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
                            Adicionar à coleção
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
                        {/* <li>Conquistas</li> */}
                        <li
                            onMouseEnter={closeMenus}
                            onClick={() => handleHideGame(gameId)}
                        >Ocultar</li>
                        <li
                            onClick={() => closeMenu?.()}
                            onMouseEnter={closeMenus}
                        >Cancelar</li>
                    </ul>
                </div>
            )}
        </>
    )
}

export default GameActionsMenu;