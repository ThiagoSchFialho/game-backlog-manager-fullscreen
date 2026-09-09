import React, { useEffect, useRef, useState } from "react";
import './styles.css';
import menuArrow from '../../assets/icons/menu-arrow.svg';
import playIcon from '../../assets/icons/play.svg';
import { useCollection } from "../../hooks/useCollection";
import { useDb } from "../../hooks/useDb";
import type { ICollection } from "../../types/collectionsType";
import type { Game } from "../../types/gamesType";
import { orderBy } from "../../utils/orderBy";
import JoystickSetup from "../JoystickSetup/JoystickSetup";

interface GameActionsMenuProps {
    gameId: string;
    gameSteamId: string;
    isOpen: boolean;
    closeMenu: () => void;
}

interface MenuItem {
    id: number;
    label: string;
    isSubMenu: boolean;
    action: () => void;
}

interface SubMenuOption {
    id: string;
    label: string;
    onSelect: () => void;
}

type SubMenuId = 'status' | 'addCollection' | 'removeCollection';

interface SubMenuConfig {
    id: SubMenuId;
    position: React.CSSProperties;
    options: SubMenuOption[];
    emptyMessage?: string;
}

const MAX_PLAYING_GAMES = 5;

const STATUS_OPTIONS = [
    { label: 'Zerado', value: 'completed' },
    { label: 'Jogando', value: 'playing' },
    { label: 'Jogado', value: 'played' },
    { label: 'Não jogado', value: 'not-played' },
];

const GameActionsMenu: React.FC<GameActionsMenuProps> = ({ gameId, gameSteamId, isOpen, closeMenu }) => {
    const { fetchGames, updateStatus } = useDb();
    const { fetchCollections, addToCollection, deleteFromCollection, getCollectionsFromGame } = useCollection();

    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);
    const [gameCollectionsList, setGameCollectionsList] = useState<ICollection[]>([]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeSubMenu, setActiveSubMenu] = useState<SubMenuId | null>(null);
    const [subSelectedIndex, setSubSelectedIndex] = useState(0);

    // --- Data loading -----------------------------------------------------

    const getGames = async () => {
        const games = await fetchGames();
        if (!games) alert("Erro ao recuperar jogos.");
        return games;
    };

    const getCollections = async () => {
        const collections = await fetchCollections();
        if (collections) setCollectionsList(collections);
    };

    const getGameCollections = async () => {
        const gameCollections = await getCollectionsFromGame(gameId);
        if (gameCollections) setGameCollectionsList(gameCollections);
    };

    useEffect(() => {
        getCollections();
        getGameCollections();
    }, []);

    useEffect(() => {
        setSelectedIndex(0);
    }, [isOpen]);

    // --- Actions ------------------------------------------------------------

    const changeStatus = async (id: string, status: string) => {
        if (status === "playing") {
            const games = await getGames();
            const playingGames = games.filter((game: Game) => game.status === "playing");
            const oldestFirst = orderBy(playingGames, "rtime_last_played", "asc");

            if (oldestFirst.length >= MAX_PLAYING_GAMES) {
                const freedSlot = await updateStatus(oldestFirst[0].id, "played");
                if (!freedSlot) return;
            }
        }

        const updated = await updateStatus(id, status);
        if (!updated) return;

        getCollections();
        getGameCollections();
        setActiveSubMenu(null);
    };

    const handleStatusChange = (id: string, status: string) => {
        setActiveSubMenu(null);
        changeStatus(id, status);
    };

    const handleAddToCollection = async (id: string, collectionId: string) => {
        setActiveSubMenu(null);
        const result = await addToCollection(Number(id), Number(collectionId));
        if (!result) return;

        if (result.error) {
            alert(result.error);
            return;
        }
        getCollections();
        getGameCollections();
        setActiveSubMenu(null);
    };

    const handleRemoveFromCollection = async (id: string, collectionId: string) => {
        setActiveSubMenu(null);
        const result = await deleteFromCollection(Number(id), Number(collectionId));
        if (!result) return;

        if (result.error) {
            alert(result.error);
            return;
        }
        getCollections();
        getGameCollections();
        setActiveSubMenu(null);
    };

    const handleHideGame = (id: string) => {
        console.error("'handleHideGame' -> Funcion not implemented.");
    };

    const handleStartGame = (id: string, steamId: string) => {
        window.location.href = `steam://rungameid/${steamId}`;
        changeStatus(id, "playing");
    };

    const openSubMenu = (id: SubMenuId) => {
        setSubSelectedIndex(0);
        setActiveSubMenu(id);
    };

    // --- Menu structure -------------------------------------------------

    const mainMenuItems: MenuItem[] = [
        { id: 0, label: 'Jogar', isSubMenu: false, action: () => handleStartGame(gameId, gameSteamId) },
        { id: 1, label: 'Alterar status', isSubMenu: true, action: () => openSubMenu('status') },
        { id: 2, label: 'Adicionar à coleção', isSubMenu: true, action: () => openSubMenu('addCollection') },
        { id: 3, label: 'Remover da coleção', isSubMenu: true, action: () => openSubMenu('removeCollection') },
        { id: 4, label: 'Ocultar', isSubMenu: false, action: () => handleHideGame(gameId) },
        { id: 5, label: 'Cancelar', isSubMenu: false, action: () => closeMenu?.() },
    ];

    // "Remover da coleção" só existe se o jogo já estiver em alguma coleção.
    const visibleMenuItems = mainMenuItems.filter(
        item => item.label !== 'Remover da coleção' || gameCollectionsList.length > 0
    );

    const subMenus: SubMenuConfig[] = [
        {
            id: 'status',
            position: { transform: 'translate(170px, -35px)' },
            options: STATUS_OPTIONS.map(option => ({
                id: option.value,
                label: option.label,
                onSelect: () => handleStatusChange(gameId, option.value),
            })),
        },
        {
            id: 'addCollection',
            position: { transform: 'translate(170px, 25px)' },
            emptyMessage: 'Nenhuma coleção criada',
            options: collectionsList.map(collection => ({
                id: collection.id,
                label: collection.title,
                onSelect: () => handleAddToCollection(gameId, collection.id),
            })),
        },
        {
            id: 'removeCollection',
            position: { transform: 'translate(170px, 85px)' },
            options: gameCollectionsList.map(collection => ({
                id: collection.id,
                label: collection.title,
                onSelect: () => handleRemoveFromCollection(gameId, collection.id),
            })),
        },
    ];

    const activeSubMenuConfig = subMenus.find(subMenu => subMenu.id === activeSubMenu) ?? null;

    // --- Joystick navigation -------------------------------------------

    /** Move um índice para cima/baixo sem sair dos limites [0, length - 1]. */
    const moveSelection = (current: number, direction: 'cima' | 'baixo', length: number) => {
        const delta = direction === 'baixo' ? 1 : -1;
        return Math.min(Math.max(current + delta, 0), length - 1);
    };

    const navigateSubMenu = (command: string, subMenu: SubMenuConfig) => {
        const { options } = subMenu;

        if ((command === 'cima' || command === 'baixo') && options.length > 0) {
            setSubSelectedIndex(prev => moveSelection(prev, command, options.length));
        } else if (command === 'confirmar' && options.length > 0) {
            options[subSelectedIndex].onSelect();
        } else if (command === 'voltar') {
            setActiveSubMenu(null);
        }
    };

    const navigateMainMenu = (command: string) => {
        if (command === 'cima' || command === 'baixo') {
            setSelectedIndex(prev => moveSelection(prev, command, visibleMenuItems.length));
        } else if (command === 'confirmar') {
            visibleMenuItems[selectedIndex]?.action();
        } else if (command === 'voltar') {
            closeMenu?.();
        }
    };

    const joystickNavigation = (command: string) => {
        if (activeSubMenuConfig) {
            navigateSubMenu(command, activeSubMenuConfig);
        } else {
            navigateMainMenu(command);
        }
    };

    // --- Render -----------------------------------------------------------

    const renderSubMenu = (subMenu: SubMenuConfig) => (
        <div
            key={subMenu.id}
            className="game-actions-menu sub-menu"
            style={subMenu.position}
        >
            <ul>
                {subMenu.options.length > 0 ? (
                    subMenu.options.map((option, index) => (
                        <li
                            key={option.id}
                            className={subSelectedIndex === index ? "game-actions-menu-focused" : ""}
                            onClick={option.onSelect}
                        >
                            {option.label}
                        </li>
                    ))
                ) : (
                    <p>{subMenu.emptyMessage}</p>
                )}
            </ul>
        </div>
    );

    return (
        <>
            {isOpen && <JoystickSetup command={joystickNavigation} />}

            {activeSubMenuConfig && renderSubMenu(activeSubMenuConfig)}

            {isOpen && (
                <div className="game-actions-menu-background">
                    <div className="game-actions-menu">
                        <ul>
                            {visibleMenuItems.map((item, index) => (
                                <li
                                    key={item.id}
                                    className={
                                        item.label === 'Jogar'
                                            ? (selectedIndex === index ? "game-actions-menu-play-btn-focused" : "game-actions-menu-play-btn")
                                            : (selectedIndex === index ? "game-actions-menu-focused" : "")
                                    }
                                >
                                    {item.label === 'Jogar' ? (
                                        <div>
                                            <img src={playIcon} />
                                            {item.label}
                                        </div>
                                    ) : (
                                        <>
                                            {item.label}
                                            {item.isSubMenu && <img src={menuArrow} />}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
};

export default GameActionsMenu;