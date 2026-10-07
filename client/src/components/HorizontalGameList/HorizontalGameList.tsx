import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

import GameCardPortrait from '../GameCardPortrait/GameCardPortrait';
import JoystickSetup from '../JoystickSetup/JoystickSetup';
import GamePage from '../GamePage/GamePage';

import { useSound } from '../../hooks/useSound';

import { getGameCover } from '../../utils/getGameCover';

import type { Game } from '../../types/gamesType';

type ScreenItem = {
    id: Game['id'];
    steamId: Game['steam_id'];
    img: string;
    name: Game['title'];
    playtime: number;
    installed: boolean;
    action: () => void | Promise<void>;
};

interface HorizontalGameListProps {
    list: Game[];
    onReloadList: () => void;
    page?: string;
    onBack?: () => void;
}

const HorizontalGameList: React.FC<HorizontalGameListProps> = ({
    list,
    onReloadList,
    page,
    onBack,
}) => {
    const { playSelectSound, playConfirmSound, playPopupSound } = useSound();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [commandCoolDown, setCommandCoolDown] = useState<boolean>(false);
    const [isOnGamePage, setIsOnGamePage] = useState<boolean>(false);
    const [selectedGameId, setSelectedGameId] = useState<Game['id'] | undefined>(undefined);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        const selectedIndexAux = selectedIndex;

        onReloadList();
        setSelectedIndex(selectedIndexAux);
    }, [isOnGamePage]);

    const gameCardsItems: ScreenItem[] = list.map((game) => ({
        id: game.id,
        steamId: game.steam_id,
        img: getGameCover(game.title, 'portrait', 'png'),
        name: game.title,
        playtime: game.playtime,
        installed: game.installed,
        action: () => { setSelectedGameId(game.id); setIsOnGamePage(true); },
    }));

    const selectedIndexRef = useRef(selectedIndex);
    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    const itemsLengthRef = useRef(gameCardsItems.length);
    useEffect(() => {
        itemsLengthRef.current = gameCardsItems.length;
    }, [gameCardsItems.length]);

    const joystickNavigation = (command: string) => {
        if (command === 'START') {
            setIsHeaderMenuOpen(!isHeaderMenuOpen);
        }

        if (isHeaderMenuOpen) {
            if (command === 'B' || command === 'A') {
                setIsHeaderMenuOpen(false);
            }
            return;
        }

        const currentIndex = selectedIndexRef.current;
        const length = itemsLengthRef.current;  

        if (command === 'esquerda') {
            if (currentIndex !== 0) {
                playSelectSound();
                setSelectedIndex(currentIndex - 1);
            }
        } else if (command === 'direita') {
            if (currentIndex < length - 1) {
                playSelectSound();
                setSelectedIndex(currentIndex + 1);
            }
        } else if (command === 'A') {
            if (commandCoolDown) return;
            playConfirmSound();
            gameCardsItems[currentIndex]?.action();
        } else if (command === 'B') {
            if (commandCoolDown) return;
            onBack?.();
        } else if (command === 'Y') {
            playPopupSound();
            setIsMenuOpen(true);
        }
    };

    const handleCloseMenu = () => {
        setCommandCoolDown(true);
        setTimeout(() => {
            setCommandCoolDown(false);
        }, 50);
        setIsMenuOpen(false);
    };

    const handleCloseGamePage = () => {
        setCommandCoolDown(true);
        setIsOnGamePage(false);
        setTimeout(() => {
            setCommandCoolDown(false);
        }, 50);
        setIsMenuOpen(false);
    };

    // SCROLL ==========================================================================
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        const container = scrollContainerRef.current;
        const el = itemRefs.current[selectedIndex];
        if (!container || !el) return;

        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        const elLeftInContainer = elRect.left - containerRect.left + container.scrollLeft;
        const target =
            elLeftInContainer - container.clientWidth / 2 + elRect.width / 2;

        container.scrollTo({ left: target, behavior: 'smooth' });
    }, [selectedIndex]);
    // SCROLL ==========================================================================

    return (
        <>
            {isOnGamePage && selectedGameId !== undefined && (
                <GamePage gameId={selectedGameId} onExitGamePage={handleCloseGamePage} />
            )}

            {!isMenuOpen && !isOnGamePage && (
                <JoystickSetup command={joystickNavigation} />
            )}

            <div className="main-content" style={{ display: isOnGamePage ? 'none' : undefined }}>
                <div className="horizontal-game-list-container">
                    <div className="horizontal-list-game-container" ref={scrollContainerRef}>
                        {gameCardsItems.length === 0 ? (
                            <div className="message-container">
                                <h3>Nenhum jogo aqui.</h3>
                            </div>
                        ) : (
                            gameCardsItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    ref={(el) => { itemRefs.current[index] = el; }}
                                    onClick={() => { setSelectedGameId(item.id); setIsOnGamePage(true); }}
                                >
                                    <GameCardPortrait
                                        id={item.id}
                                        steamId={item.steamId}
                                        img={item.img}
                                        name={item.name}
                                        page={page ?? ''}
                                        playtime={item.playtime}
                                        isFocused={selectedIndex === index}
                                        isOpen={isMenuOpen && selectedIndex === index}
                                        onCloseMenu={handleCloseMenu}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="game-count">Jogos: {gameCardsItems.length}</div>
            </div>
        </>
    );
};

export default HorizontalGameList;