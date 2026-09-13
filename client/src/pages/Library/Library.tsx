import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './styles.css';

import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import JoystickSetup from '../../components/JoystickSetup/JoystickSetup';

import { useDb } from '../../hooks/useDb';
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
    action: () => void | Promise<void>;
};


const Library: React.FC = () => {
    const { sortingMethod } = useParams<{ sortingMethod: string }>();
    const navigation = useNavigate();
    const { playSelectSound, playConfirmSound, playPopupSound, playSwipeSound } = useSound();
    const { fetchGames } = useDb();
    const [currentPage] = useState('library');
    const [sortMethod, setSortMethod] = useState(sortingMethod ?? 'alphabet');
    const [selectedSortingMethod, setSelectedSorginMethod] = useState(sortMethod);
    const [gamesList, setGamesList] = useState<Game[]>([]);
    const [sortedGamesList, setSortedGamesList] = useState<Game[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [commandCoolDown, setCommandCoolDown] = useState(false);
    
    useEffect(() => {
        const getGames = async () => {
            const games = await fetchGames();
            if (games) {
                setGamesList(games);
            }
        } 
        getGames();
    }, []);
    
    const gameCardsItems: ScreenItem[] = sortedGamesList.map((game) => ({
        id: game.id,
        steamId: game.steam_id,
        img: getGameCover(game.title, 'square'),
        name: game.title,
        action: () => navigation(`/game-page/${game.id}`)
    }));
    const { scrollContainerRef, setCardRef } = useScroll(selectedIndex, gameCardsItems.length);
    
    const sortGames = (method: string, list: Game[] = gamesList) => {
        setSortMethod(method);
        setSelectedSorginMethod(method);
        if (method === 'recentlyPlayed') {
            setSortedGamesList(orderBy(list, 'rtime_last_played', 'desc'));
        } else if (method === 'mostPlayed') {
            setSortedGamesList(orderBy(list, 'playtime', 'desc'));
        } else if (method === 'alphabet') {
            setSortedGamesList(orderBy(list, 'title', 'asc'));
        }
        setSelectedIndex(0);
    }
    useEffect(() => {
        sortGames(sortingMethod ?? 'alphabet', gamesList);
    }, [sortingMethod, gamesList]);

    // --- Refs para evitar stale closure no joystickNavigation -------------
    const selectedIndexRef = useRef(selectedIndex);
    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    const itemsLengthRef = useRef(gameCardsItems.length);
    useEffect(() => {
        itemsLengthRef.current = gameCardsItems.length;
    }, [gameCardsItems.length]);

    const selectedSortingMethodRef = useRef(selectedSortingMethod);
    useEffect(() => {
        selectedSortingMethodRef.current = selectedSortingMethod;
    }, [selectedSortingMethod]);

    const gamesListRef = useRef(gamesList);
    useEffect(() => {
        gamesListRef.current = gamesList;
    }, [gamesList]);
    // ------------------------------------------------------------------

    const sortGamesMethods = ['recentlyPlayed', 'mostPlayed', 'alphabet'];
    const joystickNavigation = (command: string) => {
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
        } else if (command === 'Y') {
            playPopupSound();
            setIsMenuOpen(true);
        } else if (command === 'RB') {
            if (sortMethod !== sortGamesMethods[sortGamesMethods.length - 1]) {
                playSwipeSound();
                const currentMethodIndex = sortGamesMethods.indexOf(selectedSortingMethodRef.current);
                const nextIndex = (currentMethodIndex + 1) % sortGamesMethods.length;
                sortGames(sortGamesMethods[nextIndex], gamesListRef.current);
            }
        } else if (command === 'LB') {
            if (sortMethod !== sortGamesMethods[0]) {
                playSwipeSound();
                const currentMethodIndex = sortGamesMethods.indexOf(selectedSortingMethodRef.current);
                const prevIndex = (currentMethodIndex - 1 + sortGamesMethods.length) % sortGamesMethods.length;
                sortGames(sortGamesMethods[prevIndex], gamesListRef.current);
            }
        }
    };

    const handleCloseMenu = () => {
        setCommandCoolDown(true);
        setTimeout(() => {
            setCommandCoolDown(false);
        }, 1000);
        setIsMenuOpen(false);
    }
    
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
                        <div key={item.id} ref={setCardRef(index)}>
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