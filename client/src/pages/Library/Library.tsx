import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import type { Game } from '../../types/gamesType';
import { useDb } from '../../hooks/useDb';
import recentlyPlayed from '../../assets/icons/recently-played.svg';
import mostPlayed from '../../assets/icons/most-played.svg'
import alphabet from '../../assets/icons/alphabet.svg';
import { orderBy } from '../../utils/orderBy';
import JoystickSetup from '../../components/JoystickSetup/JoystickSetup';
import { useNavigate, useParams } from 'react-router-dom';
import selectSound from '../../assets/sounds/select.mp3';
import confirmSound from '../../assets/sounds/confirm.mp3';
import popupSound from '../../assets/sounds/popup.mp3';

type ScreenItem = {
    id: Game['id'];
    steamId: Game['steam_id'];
    img: string;
    name: Game['title'];
    action: () => void | Promise<void>;
};

const animateScrollTo = (
    container: HTMLDivElement,
    targetTop: number,
    duration: number = 200
) => {
    const startTop = container.scrollTop;
    const distance = targetTop - startTop;
    const startTime = performance.now();

    const easeOutQuad = (t: number) => t * (2 - t);

    const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuad(progress);

        container.scrollTop = startTop + distance * eased;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };

    requestAnimationFrame(step);
};

const Library: React.FC = () => {
    const { sortingMethod } = useParams<{ sortingMethod: string }>();
    const navigation = useNavigate();
    const { fetchGames } = useDb();
    const [currentPage] = useState('library');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    const [sortedGamesList, setSortedGamesList] = useState<Game[]>([]);
    const [sortMethod, setSortMethod] = useState(sortingMethod ?? 'alphabet');
    const [selectedSortingMethod, setSelectedSorginMethod] = useState(sortMethod);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [commandCooldown, setCommandCooldown] = useState(false);

    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            setGamesList(games);
        }
    }
    useEffect(() => {   
        getGames();
    }, []);
    
    const sortGamesMethods = ['recentlyPlayed', 'mostPlayed', 'alphabet'];
    const sortGames = (method: string, list: Game[] = gamesList) => {
        setSortMethod(method);
        if (method === 'recentlyPlayed') {
            setSelectedSorginMethod('recentlyPlayed')
            setSortedGamesList(orderBy(list, 'rtime_last_played', 'desc'));
        } else if (method === 'mostPlayed') {
            setSelectedSorginMethod('mostPlayed')
            setSortedGamesList(orderBy(list, 'playtime', 'desc'));
        } else if (method === 'alphabet') {
            setSelectedSorginMethod('alphabet')
            setSortedGamesList(orderBy(list, 'title', 'asc'));
        }
        setSelectedIndex(0);
    }
    useEffect(() => {
        sortGames(sortingMethod ?? 'alphabet', gamesList);
    }, [sortingMethod, gamesList]);

    const gameCardsItems: ScreenItem[] = sortedGamesList.map((game) => ({
        id: game.id,
        steamId: game.steam_id,
        img: getGameCover(game.title, 'square'),
        name: game.title,
        action: () => navigation(`/game-page/${game.id}`)
    }));

    const handleCloseMenu = () => {
        setIsMenuOpen(false);
        setCommandCooldown(true);

        setInterval(() => {
            setCommandCooldown(false)
        }, 70);
    }

    // --- Áudio de seleção e confirmação -------------------------------------
    const selectAudioRef = useRef<HTMLAudioElement | null>(null);
    const confirmAudioRef = useRef<HTMLAudioElement | null>(null);
        const popupAudioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        selectAudioRef.current = new Audio(selectSound);
        selectAudioRef.current.volume = 0.8;

        confirmAudioRef.current = new Audio(confirmSound);
        confirmAudioRef.current.volume = 0.2;

        popupAudioRef.current = new Audio(popupSound);
        popupAudioRef.current.volume = 0.1;
    }, []);

    const playSelectSound = () => {
        const audio = selectAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };

    const playConfirmSound = () => {
        const audio = confirmAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };

    const playPopupSound = () => {
        const audio = popupAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };
    // ------------------------------------------------------------------

    // --- Refs para evitar stale closure no joystickNavigation -------------
    const selectedIndexRef = useRef(selectedIndex);
    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    const itemsLengthRef = useRef(gameCardsItems.length);
    useEffect(() => {
        itemsLengthRef.current = gameCardsItems.length;
    }, [gameCardsItems.length]);

    const commandCooldownRef = useRef(commandCooldown);
    useEffect(() => {
        commandCooldownRef.current = commandCooldown;
    }, [commandCooldown]);

    const selectedSortingMethodRef = useRef(selectedSortingMethod);
    useEffect(() => {
        selectedSortingMethodRef.current = selectedSortingMethod;
    }, [selectedSortingMethod]);

    const gamesListRef = useRef(gamesList);
    useEffect(() => {
        gamesListRef.current = gamesList;
    }, [gamesList]);
    // ------------------------------------------------------------------

    const joystickNavigation = (command: string) => {
        if (!commandCooldownRef.current) {
            const currentIndex = selectedIndexRef.current;
            const length = itemsLengthRef.current;

            if (command === 'esquerda') {
                if (currentIndex !== 0) {
                    setSelectedIndex(currentIndex - 1);
                    playSelectSound();
                }
            } else if (command === 'direita') {
                if (currentIndex !== length - 1) {
                    setSelectedIndex(currentIndex + 1);
                    playSelectSound();
                }
            } else if (command === 'cima') {
                if (currentIndex > 4) {
                    setSelectedIndex(currentIndex - 5);
                    playSelectSound();
                }
            } else if (command === 'baixo') {
                if (currentIndex < length - 5) {
                    setSelectedIndex(currentIndex + 5);
                    playSelectSound();
                }
            } else if (command === 'A') {
                gameCardsItems[currentIndex]?.action();
                playConfirmSound();
            } else if (command === 'Y') {
                playPopupSound();
                setIsMenuOpen(true);
            } else if (command === 'RB') {
                if (sortMethod !== sortGamesMethods[sortGamesMethods.length - 1]) {
                    const currentMethodIndex = sortGamesMethods.indexOf(selectedSortingMethodRef.current);
                    const nextIndex = (currentMethodIndex + 1) % sortGamesMethods.length;
                    sortGames(sortGamesMethods[nextIndex], gamesListRef.current);
                }
            } else if (command === 'LB') {
                if (sortMethod !== sortGamesMethods[0]) {
                    const currentMethodIndex = sortGamesMethods.indexOf(selectedSortingMethodRef.current);
                    const prevIndex = (currentMethodIndex - 1 + sortGamesMethods.length) % sortGamesMethods.length;
                    sortGames(sortGamesMethods[prevIndex], gamesListRef.current);
                }
            }
        }
    };

    // --- Scroll setup -----------------------------------------------------
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    const getColumnsCount = () => {
        const refs = cardRefs.current;
        if (!refs[0]) return 1;
        const firstTop = refs[0]!.offsetTop;
        let count = 0;
        for (const el of refs) {
            if (!el || el.offsetTop !== firstTop) break;
            count++;
        }
        return count || 1;
    };

    const getRowHeight = (columns: number) => {
        const refs = cardRefs.current;
        if (!refs[0] || !refs[columns]) return 0;
        return refs[columns]!.offsetTop - refs[0]!.offsetTop;
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || cardRefs.current.length === 0) return;

        const columns = getColumnsCount();
        const row = Math.floor(selectedIndex / columns);
        const rowHeight = getRowHeight(columns);

        if (!rowHeight) return;

        const targetScrollTop = row < 2 ? 0 : (row - 1) * rowHeight;

        animateScrollTo(container, targetScrollTop, 200);
    }, [selectedIndex, gameCardsItems.length]);
    // --- End scroll setup -------------------------------------------------
    
    return (
        <>
            {!isMenuOpen && <JoystickSetup command={joystickNavigation} />}
            <SideMenu currentPage={currentPage} />
            <div className="main-content">
                <div className="sortings-container">
                    <ul>
                        <li
                            className={selectedSortingMethod === 'recentlyPlayed' ? 'selected-method' : ''}
                            onClick={() => sortGames('recentlyPlayed')}
                        >
                            <img src={recentlyPlayed} />
                            <p>Jogados Recentemente</p>
                        </li>
                        <li
                            className={selectedSortingMethod === 'mostPlayed' ? 'selected-method' : ''}
                            onClick={() => sortGames('mostPlayed')}
                        >
                            <img src={mostPlayed} />
                            <p>Mais jogados</p>
                        </li>
                        <li
                            className={selectedSortingMethod === 'alphabet' ? 'selected-method' : ''}
                            onClick={() => sortGames('alphabet')}
                        >
                            <img src={alphabet} />
                            <p>Alfabeticamente</p>
                        </li>
                    </ul>
                </div>
                <div className="list-game-container" ref={scrollContainerRef}>
                    {gameCardsItems.map((item, index) => (
                        <div key={item.id} ref={(el) => { cardRefs.current[index] = el; }}>
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
                    ))}
                </div>
            </div>
        </>
    )
}

export default Library;
