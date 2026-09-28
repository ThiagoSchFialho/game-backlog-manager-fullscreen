import React, { useEffect, useState } from 'react';
import './styles.css';
import GameActionsMenu from '../GameActionsMenu/GameActionsMenu';
interface GameCardsPortraitProps {
    id: string;
    steamId: string;
    img: string;
    name: string;
    page: string;
    playtime: number;
    isFocused: boolean;
    isOpen: boolean;
    onCloseMenu: () => void;
}

const GameCardPortrait: React.FC<GameCardsPortraitProps> = ({ id, steamId, img, name, page, playtime, isFocused, isOpen, onCloseMenu }) => {
    const [isGameActionsMenuOpen, setIsGameActionsMenuOpen] = useState(isOpen);

    useEffect(() => {
        setIsGameActionsMenuOpen(isOpen);
    }, [isOpen]);

    const handleCloseMenu = () => {
        setIsGameActionsMenuOpen(false);
        onCloseMenu?.();
    }
    
    return (
        <>
            <GameActionsMenu
                gameSteamId={steamId}
                gameId={id}
                isOpen={isGameActionsMenuOpen}
                closeMenu={() => handleCloseMenu()}
            />
            <div className={isFocused ? "game-card-portrait focused" : "game-card-portrait"}>
                {page === 'Mais jogados' && (
                    <p className="playtime-game-card-portrait">
                        {playtime < 60
                            ? `${playtime}m`
                            : `${Math.floor(playtime / 60)}h${playtime % 60 > 0 ? ` ${playtime % 60}m` : ''}`}
                    </p>
                )}
                <img
                    className="game-card-portrait-img"
                    src={img}
                    alt={name}
                />
            </div>
        </>
    );
};

export default GameCardPortrait;