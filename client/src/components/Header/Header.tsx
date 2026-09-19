import React, { useState, useEffect } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import JoystickSetup from '../JoystickSetup/JoystickSetup';
import { useDb } from '../../hooks/useDb';
import sync from '../../assets/icons/sync.svg';
import { useShutdown } from '../../hooks/useShutdown';
import { useSound } from '../../hooks/useSound';
import { useNavigate } from 'react-router-dom';
interface MenuItems {
    label: string,
    action: () => void
}


const Header: React.FC = () => {
    const navigation = useNavigate();
    const { syncSteam } = useDb();
    const { shutdown, loading, error } = useShutdown();
    const { playCursorSound, playConfirmSound, playBackSound } = useSound();
    const [time, setTime] = useState(new Date());
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
    const [isSynchronizing, setIsSynchronizing] = useState(false);
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    const formattedTime = time.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const joystickNavigation = (command: string) => {
        if (command === 'START') {
            setSelectedMenuIndex(0);
            setIsHeaderMenuOpen(!isHeaderMenuOpen);
        }
        if (isHeaderMenuOpen) {
            if (command === 'B') {
                playBackSound();
                setIsHeaderMenuOpen(false);
            } else if (command === 'A') {
                if (selectedMenuIndex === 2) {
                    playBackSound();
                } else {
                    playConfirmSound();
                }
                menuItems[selectedMenuIndex].action();
            } else if (command === 'cima') {
                if (selectedMenuIndex > 0) {
                    playCursorSound();
                    setSelectedMenuIndex(selectedMenuIndex - 1);
                }
            } else if (command === 'baixo') {
                if (selectedMenuIndex < menuItems.length -1) {
                    playCursorSound();
                    setSelectedMenuIndex(selectedMenuIndex + 1);
                }
            }
        }
    };
    
    const handleSyncSteam = async () => {
        setIsHeaderMenuOpen(false);
        if (!isSynchronizing) {
            setIsSynchronizing(true);
            const result = await syncSteam();
    
            if (result) {
                setIsSynchronizing(false);
                window.location.reload();
            }
        }
    }

    const handleClick = () => {
        setIsHeaderMenuOpen(false);
        if (window.confirm("Fechar o app e o navegador?")) shutdown();
    };

    const menuItems: MenuItems[] = [
        { label: 'Inicio', action: () => { setIsHeaderMenuOpen(false); navigation('/'); }},
        { label: 'Jogos ocultos', action: () => { setIsHeaderMenuOpen(false); navigation('/hidden'); }},
        { label: 'Voltar', action: () => setIsHeaderMenuOpen(false) },
        { label: 'Sincronizar steam', action: () => handleSyncSteam() },
        { label: 'Sair', action: () => handleClick() }
    ]

    return (
        <>
            <JoystickSetup command={joystickNavigation} />
            <div className="header">
                <div className="logo-container">
                    <img onClick={() => setIsHeaderMenuOpen(true)} className="logo" src={logo} alt="game backlog manager logo" />
                    {isSynchronizing && (
                        <div
                            className="sync-steam-btn-container"
                        >
                            <img 
                                className="img-sync-steam-animation"
                                src={sync}
                                alt="sincronizar"
                            />
                            <div className="sync-steam-btn">
                                Sincronizando...
                            </div>
                        </div>
                    )}
                    {loading && (<h2>Saindo...</h2>)}
                </div>
                <p className="clock">{formattedTime}</p>
            </div>

            {isHeaderMenuOpen && (
                <div className="header-menu-container">
                    <img className="logo" src={logo} alt="game backlog manager logo" />
                    <ul>
                        {menuItems.map((item, index) => {
                            if (index >= menuItems.length - 2) { return (
                                <>
                                    <hr />
                                    <li
                                        className={selectedMenuIndex === index ? "selected-header-menu-item header-menu-item" : "header-menu-item" }
                                        onClick={item.action}
                                    >{item.label}</li>
                                </>
                            )} else { return (
                                <li
                                    className={selectedMenuIndex === index ? "selected-header-menu-item header-menu-item" : "header-menu-item" }
                                    onClick={item.action}
                                >{item.label}</li>
                            )}
                        })}
                    </ul>
                </div>
            )}
        </>
    )
}

export default Header;
