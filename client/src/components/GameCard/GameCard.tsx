import React, { useState } from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import GameActionsMenu from '../GameActionsMenu/GameActionsMenu';
interface GameCardsProps {
    id: string;
    steamId: string;
    img: string;
    name: string;
}

const GameCard: React.FC<GameCardsProps> = ({ id, steamId, img, name }) => {
    const navigation = useNavigate();
    const [isGameActionsMenuOpen, setIsGameActionsMenuOpen] = useState(false);

    return (
        <>
            <GameActionsMenu
                gameSteamId={steamId}
                gameId={id}
                isOpen={isGameActionsMenuOpen}
                closeMenu={() => setIsGameActionsMenuOpen(false)}
            />
            <div className="game-card">
                <img
                    onClick={() => navigation(`/game-page/${id}`)}
                    onContextMenu={(e) => {e.preventDefault(); setIsGameActionsMenuOpen(true)}}
                    className="game-card-img"
                    src={img}
                    alt={name}
                />
            </div>
        </>
    );
};

export default GameCard;