import React, { useState } from 'react';
import './styles.css';
import Header from '../../components/Header/Header';
import SideMenu from '../../components/SideMenu/SideMenu';
import sync from '../../assets/icons/sync.svg';
import info from '../../assets/icons/info.svg';

const Settings: React.FC = () => {
    const [steamApiConnected, setSteamApiConnected] = useState(false);
    const [currentPage, setCurrentPage] = useState('settings');

    const [steamId, setSteamId] = useState('');
    const [steamApiKey, setSteamApiKey] = useState('');

    return (
        <>
            <Header steamApiConnected={steamApiConnected} />
            <div className="main-container">
                <SideMenu currentPage={currentPage} />
                
                <div className="settings-main-content">
                    <div className="page-header">
                        <h1 className="title">Configurações</h1>
                    </div>
                        <div className="steam-section">
                            <h1 className="steam-section-title">Steam</h1>
                            <form className="steam-section-form" onSubmit={(e) => e.preventDefault()}>
                                <div className="input-label-container">
                                    <label htmlFor="steam-id">ID da sua conta Steam</label>
                                    <div className="input-container">
                                        <input 
                                            onChange={(e) => setSteamId(e.target.value)}
                                            value={steamId} 
                                            type="text" 
                                            name="steam-id" 
                                            id="steam-id" 
                                            maxLength={17} 
                                            minLength={17}
                                        />
                                        <img src={info} alt="informação" />
                                    </div>
                                </div>
                                <div className="input-label-container">
                                    <label htmlFor="steam-key">Sua chave da API</label>
                                    <div className="input-container"> 
                                        <input 
                                            onChange={(e) => setSteamApiKey(e.target.value)}
                                            value={steamApiKey} 
                                            type="text" 
                                            name="steam-key" 
                                            id="steam-key" 
                                            maxLength={33} 
                                            minLength={33}
                                        />
                                        <img src={info} alt="informação" />
                                    </div>
                                </div>

                                <div className="steam-section-btn-container">
                                    <img src={sync} alt="sincronizar" />
                                    <div className="steam-section-btn">Sincronizar Steam</div>
                                </div>
                            </form>
                        </div>
                </div>
            </div>
        </>
    )
}

export default Settings;