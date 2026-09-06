import React, { useState, useEffect } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import SyncSteamBtn from '../syncSteamBtn/SyncSteamBtn';

const Header: React.FC = () => {
    const [time, setTime] = useState(new Date());

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

    return (
        <>
            <div className="header">
                <img className="logo" src={logo} alt="game backlog manager logo" />
                <SyncSteamBtn />
                <p className="clock">{formattedTime}</p>
            </div>
        </>
    )
}

export default Header;
