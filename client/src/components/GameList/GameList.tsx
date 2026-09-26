import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

import GameCard from '../GameCard/GameCard';
import JoystickSetup from '../JoystickSetup/JoystickSetup';
import GamePage from '../GamePage/GamePage';

import { useSound } from '../../hooks/useSound';

import { getGameCover } from '../../utils/getGameCover';
import { orderBy } from '../../utils/orderBy';

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
    title?: string,
    onBack?: () => void
}


const GameList: React.FC<GameListProps> = ({ list, onReloadList, title, onBack }) => {
    const { playSelectSound, playConfirmSound, playPopupSound } = useSound();
    const [gamesList, setGamesList] = useState<Game[]>(list);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [commandCoolDown, setCommandCoolDown] = useState(false);
    const [isOnGamePage, setIsOnGamePage] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState<Game['id'] | undefined>(undefined);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

    useEffect(() => {
        setGamesList(orderBy(list, 'title', 'asc'));
    }, [list]);

    useEffect(() => {
        const selectedIndexAux = selectedIndex;

        onReloadList();
        setSelectedIndex(selectedIndexAux);
    }, [isOnGamePage]);

    const gameCardsItems: ScreenItem[] = gamesList.map((game) => ({
        id: game.id,
        steamId: game.steam_id,
        img: getGameCover(game.title, 'square'),
        name: game.title,
        installed: game.installed,
        action: () => { setSelectedGameId(game.id); setIsOnGamePage(true) }
    }));

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

    // SCROLL ==========================================================================
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        const el = itemRefs.current[selectedIndex];
        if (el) {
            el.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [selectedIndex]);
    // SCROLL ==========================================================================

    return (
        <>
            {isOnGamePage && selectedGameId !== undefined && (
                <GamePage gameId={selectedGameId} onExitGamePage={handleCloseGamePage} />
            )}

            {!isMenuOpen && !isOnGamePage && <JoystickSetup command={joystickNavigation} />}
            <div className="main-content" style={{ display: isOnGamePage ? 'none' : undefined }}>
                <div className="game-list-container">
                    <div className="list-game-container" ref={scrollContainerRef}>
                        {gameCardsItems.length === 0 ? (
                            <div className="message-container">
                                <h3>Nenhum jogo aqui.</h3>
                            </div>
                        ) : (
                            gameCardsItems.map((item, index) => (
                                <div ref={(el) => { itemRefs.current[index] = el }} onClick={() => {setSelectedGameId(item.id); setIsOnGamePage(true)}}>
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
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default GameList;