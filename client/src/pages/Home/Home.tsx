import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';
import GameLandscape from '../../components/GameLandscape/GameLandscape';
import arrow from '../../assets/icons/menu-arrow.svg';
import JoystickSetup from '../../components/JoystickSetup/JoystickSetup';

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
    const { fetchGames, updateStatus } = useDb();
    const [selected] = useState('home');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const getGames = async () => {
        const games = await fetchGames();
        if (games) {
            const orderdGames = orderBy(games, 'rtime_last_played', 'desc');
            setGamesList(orderdGames.slice(0, 6));
        }
    }
    useEffect(() => {
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
        action: () => navigation(`/game-page/${game.id}`)
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
        { id: 6, steamId: '', img: '', name: '', action: () => navigation('/library') }
    ];

    const rowStart = 1;
    const rowEnd = screenItems.length - 1;

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    const handleCloseMenu = () => {
        setIsMenuOpen(false);
    }

    const joystickNavigation = (command: string) => {
        const onBanner = selectedIndex === BANNER_INDEX;

        if (onBanner) {
            if (command === 'baixo') {
                setSelectedIndex(rowStart);
            }
            if (command === 'A') {
                screenItems[selectedIndex]?.action();
            }
            return;
        }

        if (command === 'esquerda' || command === 'direita') {
            const delta = command === 'direita' ? 1 : -1;
            setSelectedIndex(prev => clamp(prev + delta, rowStart, rowEnd));
        } else if (command === 'cima') {
            setSelectedIndex(BANNER_INDEX);
        } else if (command === 'A') {
            screenItems[selectedIndex]?.action();
        } else if (selectedIndex !== 6 && command === 'Y') {
            setIsMenuOpen(true);
        }
    };

    const changeStatus = async (id: string, status: string) => {
        const MAX_PLAYING_GAMES = 5;

        if (status === "playing") {
            const games = (await fetchGames()) as Game[] | undefined;
            if (!games) return;

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
    };

    const handleStartGame = async (id: string, steamId: string) => {
        window.location.href = `steam://rungameid/${steamId}`;
        changeStatus(id, "playing");
    }

    return (
        <>
            {!isMenuOpen && <JoystickSetup command={joystickNavigation} />}
            <SideMenu currentPage={selected} />
            <div className="main-content">
                 {screenItems.slice(0, 1).map(item => (
                    <GameLandscape
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
                        <div onClick={() => navigation('/library')} className={selectedIndex === 6 ? "focused continue-playing-more" : "continue-playing-more"}>
                            <img src={arrow} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;