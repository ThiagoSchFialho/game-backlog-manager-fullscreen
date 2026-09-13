import React, { useEffect, useState } from 'react';
import './styles.css';
import GameActionsMenu from '../GameActionsMenu/GameActionsMenu';
import { useNavigate } from 'react-router-dom';
interface GameCardsProps {
    id: string;
    steamId: string;
    img: string;
    name: string;
    isFocused: boolean;
    isOpen: boolean;
    onCloseMenu: () => void;
}

const GameCard: React.FC<GameCardsProps> = ({ id, steamId, img, name, isFocused, isOpen, onCloseMenu }) => {
    const navigation = useNavigate();
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
            <div className={isFocused ? "game-card focused" : "game-card"}>
                <img
                    onClick={() => navigation(`/game-page/${id}`)}
                    className="game-card-img"
                    src={img}
                    alt={name}
                />
            </div>
        </>
    );
};

export default GameCard;