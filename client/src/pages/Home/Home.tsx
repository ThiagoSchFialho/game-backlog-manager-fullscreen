import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

import SideMenu from '../../components/SideMenu/SideMenu';
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
    action: () => void | Promise<void>;
};

const BANNER_INDEX = 0;


const Home: React.FC = () => {
    const navigation = useNavigate();
    const { handleStartGame, fetchGames } = useDb();
    const { playSelectSound, playConfirmSound, playPopupSound } = useSound();
    const [selected] = useState('home');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [commandCoolDown, setCommandCoolDown] = useState(false);
    const [isOnGamePage, setIsOnGamePage] = useState(false);
    const [selectedGameId, setSelectedGameId] = useState<Game['id'] | undefined>(undefined);
    
    useEffect(() => {
        const getGames = async () => {
            const games = await fetchGames();
            if (games) {
                const orderdGames = orderBy(games, 'rtime_last_played', 'desc');
                setGamesList(orderdGames.slice(0, 6));
            }
        }
        getGames();
    }, []);

    const games = orderBy(gamesList, 'rtime_last_played', 'desc');
    if (games.length === 0) {
        return (
            <>
                <SideMenu currentPage={selected} />
                <div className="main-content">
                    <h1>Carregando...</h1>
                </div>
            </>
        );
    }

    const gameCardsItems = games.slice(1, games.length).map((game) => ({
        id: game.id,
        steamId: game.steam_id,
        img: getGameCover(game.title, 'square'),
        name: game.title,
        action: () => { setSelectedGameId(game.id); setIsOnGamePage(true) }
    }));
    const screenItems: ScreenItem[] = [
        {
            id: games[0].id,
            steamId: games[0].steam_id,
            img: getGameCover(games[0].title, 'landscape'),
            name: games[0].title,
            action: () => handleStartGame(games[0].id, games[0].steam_id)
        },
        ...gameCardsItems,
        { id: 6, steamId: '', img: '', name: '', action: () => navigation('/library/recentlyPlayed') }
    ];

    const joystickNavigation = (command: string) => {
        const onBanner = selectedIndex === BANNER_INDEX;
        if (onBanner) {
            if (command === 'baixo') {
                playSelectSound();
                setSelectedIndex(1);
            } else if (command === 'A') {
                playConfirmSound();
                screenItems[selectedIndex]?.action();
            }
            return;
        }
        if (command === 'esquerda') {
            if (selectedIndex > 1) {
                playSelectSound();
                setSelectedIndex(selectedIndex - 1);
            }
        } else if (command === 'direita') {
            if (selectedIndex < screenItems.length - 1) {
                playSelectSound();
                setSelectedIndex(selectedIndex + 1);
            }
        } else if (command === 'cima') {
            playSelectSound();
            setSelectedIndex(BANNER_INDEX);
        } else if (command === 'A') {
            if (commandCoolDown) return null;
            playConfirmSound();
            screenItems[selectedIndex]?.action();
        } else if (selectedIndex !== 6 && command === 'Y') {
            playPopupSound();
            setIsMenuOpen(true);
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
            <SideMenu currentPage={selected} />

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