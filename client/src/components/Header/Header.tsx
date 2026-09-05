import React from 'react';
import './styles.css';
import logo from '../../assets/GAME BACKLOG logo.svg';
import searchIcon from '../../assets/icons/search.svg';
import steamIcon from '../../assets/icons/steam.svg';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    steamApiConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({steamApiConnected}) => {
    const navigation = useNavigate();

    return (
        <>
            <div className="header">
                <img onClick={() => navigation('/')} className="logo" src={logo} alt="game backlog manager logo" />
                <div className="search-bar-container">
                    <img src={searchIcon} alt="icone de pesquisa" />
                    <input className="search-input" type="text" name="search" id="search" placeholder="Pesquisar jogos, desenvolvedoras, tags..." />
                </div>
                <div className="steam-api-indicator-container">
                    <img src={steamIcon} alt="steam logo" />
                    <div className="steam-api-indicator-text-container">
                        <p>Steam API</p>
                        <p className={`steam-api-indicator ${steamApiConnected ? 'connected' : 'disconnected'}`}>
                            {steamApiConnected ? "conectado" : "não conectado"}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header;