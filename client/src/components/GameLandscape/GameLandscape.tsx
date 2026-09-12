import React from 'react';
import './styles.css';
import play from '../../assets/icons/play.svg';

interface GameLandscapeProps {
    id: string;
    steamId: string;
    img: string;
    name: string;
    isFocused: boolean;
}

const GameLandscape: React.FC<GameLandscapeProps> = ({ id, steamId, img, name, isFocused }) => {
    return (
        <div className="game-landscape">
            <img
                className="game-landscape-img"
                src={img}
                alt={name}
            />
            <div className={isFocused ? "focused play-btn-landscape" : "play-btn-landscape"}>
                <img src={play} alt="play" />
                <p>Jogar</p>
            </div>
        </div>
    );
};

export default GameLandscape;