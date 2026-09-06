import React from 'react';
import './styles.css';
import { useNavigate } from 'react-router-dom';
interface GameCardsProps {
    id: string;
    img: string;
    name: string;
}

const GameCard: React.FC<GameCardsProps> = ({ id, img, name }) => {
    const navigation = useNavigate();

    return (
        <div className="game-card">
            <img
                onClick={() => navigation(`/game-page/${id}`)}
                className="game-card-img"
                src={img}
                alt={name}
            />
        </div>
    );
};

export default GameCard;