import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

import GameCard from '../GameCard/GameCard';
import JoystickSetup from '../JoystickSetup/JoystickSetup';
import GamePage from '../GamePage/GamePage';

import { useSound } from '../../hooks/useSound';
import { useScroll } from '../../hooks/useScroll';

import { getGameCover } from '../../utils/getGameCover';
import { orderBy } from '../../utils/orderBy';

import recentlyPlayed from '../../assets/icons/recently-played.svg';
import mostPlayed from '../../assets/icons/most-played.svg'
import alphabet from '../../assets/icons/alphabet.svg';

import type { Game } from '../../types/gamesType';
type ScreenItem = {
    id: Game['id'];
    steamId: Game['steam_id'];
    img: string;
    name: Game['title'];
    installed: boolean;
    action: () => void | Promise<void>;
};

interface GameListProps {
    list: Game[]
    onReloadList: () => void,
    sortingMethod: string | undefined,
    title?: string,
    onBack?: () => void
}


const GameList: React.FC<GameListProps> = ({ list, onReloadList, sortingMethod, title, onBack }) => {
    const { playSelectSound, playConfirmSound, playPopupSound, playSwipeSound } = useSound();
    const [sortMethod, setSortMethod] = useState(sortingMethod ?? 'alphabet');
    const [gamesList, setGamesList] = useState<Game[]>(list);
    const [sortedGamesList, setSortedGamesList] = useState<Game[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [commandCoolDown, setCommandCoolDown] = useState(false);
    const [isOnGamePage, setIsOnGamePage] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState<Game['id'] | undefined>(undefined);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

    useEffect(() => {
        setGamesList(list);
    }, [list]);

    const sortGames = (method: string, list: Game[] = gamesList) => {
        setSortMethod(method);

        let sorted: Game[];
        if (method === 'alphabet') {
            sorted = orderBy(list, 'title', 'asc');
        } else if (method === 'mostPlayed') {
            sorted = orderBy(list, 'playtime', 'desc');
        } else if (method === 'recentlyPlayed') {
            sorted = orderBy(list, 'rtime_last_played', 'desc');
        } else {
            sorted = list;
        }

        const installed = sorted.filter((game) => game.installed);
        const notInstalled = sorted.filter((game) => !game.installed);

        setSortedGamesList([...installed, ...notInstalled]);
    }

    useEffect(() => {
        const sortMethodAux = sortMethod;
        const selectedIndexAux = selectedIndex;

        onReloadList();
        setSortMethod(sortMethodAux);
        setSelectedIndex(selectedIndexAux);
    }, [isOnGamePage]);

    useEffect(() => {
        sortGames(sortingMethod ?? 'alphabet', gamesList);
    }, [sortingMethod]);

    useEffect(() => {
        sortGames(sortMethod, gamesList);
    }, [gamesList]);
    
    const gameCardsItems: ScreenItem[] = sortedGamesList.map((game) => ({
        id: game.id,
        steamId: game.steam_id,
        img: getGameCover(game.title, 'square'),
        name: game.title,
        installed: game.installed,
        action: () => { setSelectedGameId(game.id); setIsOnGamePage(true) }
    }));
    const { scrollContainerRef, setCardRef } = useScroll(selectedIndex, gameCardsItems.length);

    const firstNotInstalledIndex = gameCardsItems.findIndex((item) => !item.installed);

    // --- Refs para evitar stale closure no joystickNavigation -------------
    const selectedIndexRef = useRef(selectedIndex);
    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    const itemsLengthRef = useRef(gameCardsItems.length);
    useEffect(() => {
        itemsLengthRef.current = gameCardsItems.length;
    }, [gameCardsItems.length]);
    // ------------------------------------------------------------------

    const sortGamesMethods = ['alphabet', 'mostPlayed', 'recentlyPlayed'];
    const joystickNavigation = (command: string) => {
        if (command === 'START') {
            setIsHeaderMenuOpen(!isHeaderMenuOpen);
        }

        if (isHeaderMenuOpen) {
            if (command === 'B' || command === 'A') {
                setIsHeaderMenuOpen(false);
            }
        }
        if (!isHeaderMenuOpen) {
            const currentIndex = selectedIndexRef.current;
            const length = itemsLengthRef.current;

            if (command === 'esquerda') {
                if (currentIndex !== 0) {
                    playSelectSound();
                    setSelectedIndex(currentIndex - 1);
                }
            } else if (command === 'direita') {
                if (currentIndex !== length - 1) {
                    playSelectSound();
                    setSelectedIndex(currentIndex + 1);
                }
            } else if (command === 'cima') {
                if (currentIndex > 4) {
                    playSelectSound();
                    setSelectedIndex(currentIndex - 5);
                }
            } else if (command === 'baixo') {
                if (currentIndex < length - 5) {
                    playSelectSound();
                    setSelectedIndex(currentIndex + 5);
                }
            } else if (command === 'A') {
                if (commandCoolDown) return null;
                playConfirmSound();
                gameCardsItems[currentIndex]?.action();
            } else if (command === 'B') {
                if (commandCoolDown) return null;
                onBack?.();
            } else if (command === 'Y') {
                playPopupSound();
                setIsMenuOpen(true);
            } else if (command === 'RB') {
                if (sortMethod !== sortGamesMethods[sortGamesMethods.length - 1]) {
                    playSwipeSound();
                    const currentIndex = sortGamesMethods.indexOf(sortMethod);
                    setSortMethod(sortGamesMethods[currentIndex + 1]);
                    sortGames(sortGamesMethods[currentIndex + 1], gamesList);
                    setSelectedIndex(0);
                }
            } else if (command === 'LB') {
                if (sortMethod !== sortGamesMethods[0]) {
                    playSwipeSound();
                    const currentIndex = sortGamesMethods.indexOf(sortMethod);
                    setSortMethod(sortGamesMethods[currentIndex - 1]);
                    sortGames(sortGamesMethods[currentIndex - 1], gamesList);
                    setSelectedIndex(0);
                }
            }
        }
    };

    const handleCloseMenu = () => {
        setCommandCoolDown(true);
        setTimeout(() => {
            setCommandCoolDown(false);
        }, 50);
        setIsMenuOpen(false);
    }

    const handleCloseGamePage = () => {
        setCommandCoolDown(true);
        setIsOnGamePage(false);
        setTimeout(() => {
            setCommandCoolDown(false);
        }, 50);
        setIsMenuOpen(false);
    }
    
    return (
        <>
            {isOnGamePage && selectedGameId !== undefined && (
                <GamePage gameId={selectedGameId} onExitGamePage={handleCloseGamePage} />
            )}

            {!isMenuOpen && !isOnGamePage && <JoystickSetup command={joystickNavigation} />}
            <div className="main-content" style={{ display: isOnGamePage ? 'none' : undefined }}>
                <div className="sortings-container">
                    <h1>{title ?? ''}</h1>
                    <ul>
                        <li
                            className={sortMethod === 'alphabet' ? 'selected-method' : ''}
                        >
                            <img src={alphabet} />
                            <p>Alfabeticamente</p>
                        </li>
                        <li
                            className={sortMethod === 'mostPlayed' ? 'selected-method' : ''}
                        >
                            <img src={mostPlayed} />
                            <p>Mais jogados</p>
                        </li>
                        <li
                            className={sortMethod === 'recentlyPlayed' ? 'selected-method' : ''}
                        >
                            <img src={recentlyPlayed} />
                            <p>Jogados Recentemente</p>
                        </li>
                    </ul>
                </div>

                <div className="list-game-container" ref={scrollContainerRef}>
                    {gameCardsItems.length === 0 ? (
                        <div className="message-container">
                            <h3>Nenhum jogo aqui.</h3>
                        </div>
                    ) : (
                        gameCardsItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                {index === firstNotInstalledIndex && index !== 0 && (
                                    <hr className="installed-divider" />
                                )}
                                <div ref={setCardRef(index)} onClick={() => {setSelectedGameId(item.id); setIsOnGamePage(true)}}>
                                    <GameCard
                                        id={item.id}
                                        steamId={item.steamId}
                                        img={item.img}
                                        name={item.name}
                                        isFocused={selectedIndex === index}
                                        isOpen={isMenuOpen && selectedIndex === index}
                                        onCloseMenu={handleCloseMenu}
                                    />
                                </div>
                            </React.Fragment>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}

export default GameList;