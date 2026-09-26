import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

import GameCard from '../../components/GameCard/GameCard';
import GameLandscape from '../../components/GameLandscape/GameLandscape';
import JoystickSetup from '../../components/JoystickSetup/JoystickSetup';
import GamePage from '../../components/GamePage/GamePage';

import { useDb } from '../../hooks/useDb';
import { useSound } from '../../hooks/useSound';

import { getGameCover } from '../../utils/getGameCover';
import { orderBy } from '../../utils/orderBy';

import arrow from '../../assets/icons/menu-arrow.svg';

import type { Game } from '../../types/gamesType';
type ScreenItem = {
    id: Game['id'];
    steamId: Game['steam_id'];
    img: string;
    name: Game['title'];
    installed: Game['installed'];
    action: () => void | Promise<void>;
};

const BANNER_INDEX = 0;

const Home: React.FC = () => {
    const navigation = useNavigate();
    const { handleStartGame, fetchGames } = useDb();
    const { playSelectSound, playConfirmSound, playPopupSound } = useSound();
    const [gamesList, setGamesList] = useState<Game[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [commandCoolDown, setCommandCoolDown] = useState(false);
    const [isOnGamePage, setIsOnGamePage] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState<Game['id'] | undefined>(undefined);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            const orderdGames = orderBy(games, 'rtime_last_played', 'desc');
            const filteredOrderdGames = orderdGames.filter((game: Game) => { return !game.hidden && game.installed });
            setGamesList(filteredOrderdGames);
        }
    }
    useEffect(() => {
        getGames();
    }, []);

    useEffect(() => {
        const selectedIndexAux = selectedIndex;
        getGames();
        setSelectedIndex(selectedIndexAux);
    }, [isOnGamePage]);

    const games = orderBy(gamesList, 'rtime_last_played', 'desc');
    const hasGames = games.length > 0;

    const gameCardsItems = hasGames
        ? games.slice(1, games.length).map((game) => ({
            id: game.id,
            steamId: game.steam_id,
            img: getGameCover(game.title, 'square'),
            name: game.title,
            installed: game.installed,
            action: () => { setSelectedGameId(game.id); setIsOnGamePage(true) }
        }))
        : [];

    const startGame = (id: string, steamId: string) => {
        setIsPlaying(true);
        handleStartGame(id, steamId);
        setTimeout(() => {
            setIsPlaying(false);
        }, 50000);
    }
    const screenItems: ScreenItem[] = hasGames
        ? [
            {
                id: games[0].id,
                steamId: games[0].steam_id,
                img: getGameCover(games[0].title, 'landscape'),
                name: games[0].title,
                installed: games[0].installed,
                action: () => startGame(games[0].id, games[0].steam_id)
            },
            ...gameCardsItems,
            { id: 'more', steamId: '', img: '', name: '', installed: false, action: () => navigation('/library/recentlyPlayed') }
        ]
        : [];

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
            if (!hasGames) return;

            const currentIndex = selectedIndexRef.current;
            const length = itemsLengthRef.current;
            const onBanner = currentIndex === BANNER_INDEX;

            if (onBanner) {
                if (command === 'baixo') {
                    playSelectSound();
                    setSelectedIndex(1);
                } else if (command === 'A') {
                    playConfirmSound();
                    screenItems[currentIndex]?.action();
                }
                return;
            }
            if (command === 'esquerda') {
                if (currentIndex > 1) {
                    playSelectSound();
                    setSelectedIndex(currentIndex - 1);
                }
            } else if (command === 'direita') {
                if (currentIndex < length + 1) {
                    playSelectSound();
                    setSelectedIndex(currentIndex + 1);
                }
            } else if (command === 'cima') {
                playSelectSound();
                setSelectedIndex(BANNER_INDEX);
            } else if (command === 'A') {
                if (commandCoolDown) return;
                playConfirmSound();
                screenItems[currentIndex]?.action();
            } else if (currentIndex !== 6 && command === 'Y') {
                playPopupSound();
                setIsMenuOpen(true);
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

    if (!hasGames) {
        return (
            <>
                <div className="main-content">
                    <h1>Carregando...</h1>
                </div>
            </>
        );
    }

    return (
        <>
            {isOnGamePage && selectedGameId !== undefined && (
                <GamePage gameId={selectedGameId} onExitGamePage={() => setIsOnGamePage(false)} />
            )}

            {!isMenuOpen && <JoystickSetup command={joystickNavigation} />}
            <div className="main-content" style={{ display: isOnGamePage ? 'none' : undefined }}>
                {screenItems.slice(0, 1).map(item => (
                    <GameLandscape
                        key={item.id}
                        id={item.id}
                        steamId={item.steamId}
                        img={item.img}
                        name={item.name}
                        isFocused={selectedIndex === 0}
                        isPlaying={isPlaying}
                        isInstalled={item.installed}
                    />
                ))}

                <div className="continue-playing-container">
                    <h1 className="continue-playing-title">Continue jogando</h1>
                    <div className="continue-playing">
                        {screenItems.slice(1, 6).map((item, index) => (
                            <GameCard
                                key={item.id}
                                id={item.id}
                                steamId={item.steamId}
                                img={item.img}
                                name={item.name}
                                isFocused={selectedIndex === index + 1}
                                isOpen={isMenuOpen && selectedIndex === index + 1}
                                onCloseMenu={handleCloseMenu}
                            />
                        ))}
                        <div className={selectedIndex === 6 ? "focused continue-playing-more" : "continue-playing-more"}>
                            <img src={arrow} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;