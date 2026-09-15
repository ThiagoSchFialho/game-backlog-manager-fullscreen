import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './styles.css';

import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import JoystickSetup from '../../components/JoystickSetup/JoystickSetup';

import { useCollection } from '../../hooks/useCollection';

import { getGameCover } from '../../utils/getGameCover';

import type { Game } from '../../types/gamesType';
import type { ICollection } from '../../types/collectionsType';
type ScreenItem = {
    id: Game['id'];
    steamId: Game['steam_id'];
    img: string;
    name: Game['title'];
    action: () => void | Promise<void>;
};


const Collection: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigation = useNavigate();
    const { fetchCollections } = useCollection();
    const [currentPage] = useState('collections');
    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);
    const collection = collectionsList.find(c => c.id === id);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [commandCooldown, setCommandCooldown] = useState(false);

    const getCollections = async () => {
        const collections = await fetchCollections();
        if (collections) {
            setCollectionsList(collections);
        }
    }
    useEffect(() => {
        getCollections();
    }, []);

    const gameCardsItems: ScreenItem[] = collection?.games.map((game) => ({
        id: game.id,
        steamId: game.steam_id,
        img: getGameCover(game.title, 'square'),
        name: game.title,
        action: () => navigation(`/game-page/${game.id}`)
    })) ?? [];

    const handleCloseMenu = () => {
        setIsMenuOpen(false);
        setCommandCooldown(true);

        setInterval(() => {
            setCommandCooldown(false)
        }, 70);
    }

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
    // ------------------------------------------------------------------

    const joystickNavigation = (command: string) => {
        if (!commandCooldownRef.current) {
            const currentIndex = selectedIndexRef.current;
            const length = itemsLengthRef.current;

            if (command === 'esquerda') {
                if (currentIndex !== 0) {
                    setSelectedIndex(currentIndex - 1);
                }
            } else if (command === 'direita') {
                if (currentIndex !== length - 1) {
                    setSelectedIndex(currentIndex + 1);
                }
            } else if (command === 'cima') {
                if (currentIndex > 4) {
                    setSelectedIndex(currentIndex - 5);
                }
            } else if (command === 'baixo') {
                if (currentIndex < length - 5) {
                    setSelectedIndex(currentIndex + 5);
                }
            } else if (command === 'A') {
                gameCardsItems[currentIndex]?.action();
            } else if (command === 'Y') {
                setIsMenuOpen(true);
            } else if (command === 'B') {
                navigation(-1);
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

        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }, [selectedIndex, gameCardsItems.length]);
    // --- End scroll setup -------------------------------------------------
        
    return (
        <>
            {!isMenuOpen && <JoystickSetup command={joystickNavigation} />}
            <SideMenu currentPage={currentPage} />
            <div className="main-content">
                <div className="title-collection-container">
                    <h1 className="title">{collection?.title}</h1>
                </div>

                <div className="collection-games-container" ref={scrollContainerRef}>
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

export default Collection;