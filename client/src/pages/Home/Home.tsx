import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import Header from '../../components/Header/Header';
import SideMenu from '../../components/SideMenu/SideMenu';
import GameCard from '../../components/GameCard/GameCard';
import { getGameCover } from '../../utils/getGameCover';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import { orderBy } from '../../utils/orderBy';

import gamepadInfo from '../../assets/icons/gamepad-info.svg';
import checkInfo from '../../assets/icons/check-info.svg';
import playInfo from '../../assets/icons/play-info.svg';
import clockInfo from '../../assets/icons/clock-info.svg';
import SyncSteamBtn from '../../components/syncSteamBtn/SyncSteamBtn';

const Home: React.FC = () => {
    const navigation = useNavigate();
    const { fetchGames } = useDb();
    const [steamApiConnected, setSteamApiConnected] = useState(false);
    const [selected] = useState('home');
    const [gamesList, setGamesList] = useState<Game[]>([]);
    
    useEffect(() => {
        const getGames = async () => {
            const games = await fetchGames();
            if (games) {
                setGamesList(games);
                setSteamApiConnected(true);
            }
        }
        
        getGames();
    }, []);
    
    const notPlayedGames = gamesList.filter(game => game.status === 'not-played');
    const playedGames = orderBy(gamesList.filter(game => game.status === 'played'), 'title', 'asc');
    const completedGames = orderBy(gamesList.filter(game => game.status === 'completed'), 'playtime', 'desc');
    const playingGames = orderBy(gamesList.filter(game => game.status === 'playing'), 'rtime_last_played', 'desc');
    
    const calcFullPlaytime = () => {
        let fullPlayTime = 0;
        gamesList.forEach(game => (fullPlayTime = fullPlayTime + game.playtime));
        return Math.round(fullPlayTime / 60);
    }

    return (
        <>
            <Header steamApiConnected={steamApiConnected} />
            <div className="main-container">
                <SideMenu currentPage={selected} />
                <div className="home-main-content">

                    <div className="content-header">
                        <div className="content-header-text">
                            <h1>Bem vindo, Thiago!</h1>
                            <p>Aqui está um resumo dos jogos na sua biblioteca</p>
                        </div>
                        <SyncSteamBtn />
                    </div>

                    <div className="info-cards-container">
                        <div className="info-card background-blue">
                            <div className="info-icon-container blue">
                                <img src={gamepadInfo} alt="joystick" />
                            </div>
                            <div className="info-card-text-container blue-text">
                                <h1 className="info-card-title">{gamesList.length}</h1>
                                <p className="info-card-text">Jogos Adiquiridos</p>
                            </div>
                        </div>
                        <div className="info-card background-green">
                            <div className="info-icon-container green">
                                <img src={playInfo} alt="verificado" />
                            </div>
                            <div className="info-card-text-container green-text">
                                <h1 className="info-card-title">{playedGames.length + completedGames.length + playingGames.length}</h1>
                                <p className="info-card-text">Jogos Iniciados</p>
                            </div>
                        </div>
                        <div className="info-card background-purple">
                            <div className="info-icon-container purple">
                                <img src={checkInfo} alt="play" />
                            </div>
                            <div className="info-card-text-container purple-text">
                                <h1 className="info-card-title">{completedGames.length}</h1>
                                <p className="info-card-text">Jogos Zerados</p>
                            </div>
                        </div>
                        <div className="info-card background-yellow">
                            <div className="info-icon-container yellow">
                                <img src={clockInfo} alt="relógio" />
                            </div>
                            <div className="info-card-text-container yellow-text">
                                <h1 className="info-card-title">{calcFullPlaytime()}h</h1>
                                <p className="info-card-text">Horas Jogadas</p>
                            </div>
                        </div>
                    </div>

                    {playingGames.length === 0 ? (
                        <></>
                    ): (
                        <div className="playing-now-container">
                            <div className="playing-now-header">
                                <h1>Jogando Agora</h1>
                                <p onClick={() => navigation('/backlog')}>Ver todos</p>
                            </div>
                            <div className="game-cards-container">
                                {playingGames.slice(0, 4).map(game => (
                                    <GameCard
                                        key={game.id}
                                        id={game.id}
                                        steamId={game.steam_id}
                                        img={getGameCover(game.title)}
                                        name={game.title}
                                        status={game.status}
                                        playtime={game.playtime}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="backlog-overview-container">
                        <h1 className="backlog-overview-title">Backlog</h1>
                        <div className="overview-lists-container">

                            <div className="overview-list">
                                <div className="overview-header">
                                    <h1 className="not-played">Não jogados <span>({notPlayedGames.length})</span></h1>
                                    <p onClick={() => navigation('/backlog')}>Ver todos</p>
                                </div>
                                <div className="overview">
                                    <ul>
                                        {notPlayedGames.slice(0, 4).map(game => (
                                            <li key={game.id}>
                                                <img className="game-icon" src={game.cover_square} />
                                                <div>
                                                    <h1 className="game-title">{game.title}</h1>
                                                    <p className="aditional-text">{game.developer}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="overview-list">
                                <div className="overview-header">
                                    <h1 className="played">Jogados <span>({playedGames.length})</span></h1>
                                    <p onClick={() => navigation('/backlog')}>Ver todos</p>
                                </div>
                                <div className="overview">
                                    <ul>
                                        {playedGames.slice(0, 4).map(game => (
                                            <li key={game.id}>
                                                <img className="game-icon" src={game.cover_square} />
                                                <div>
                                                    <h1 className="game-title">{game.title}</h1>
                                                    <p className="aditional-text">
                                                    {game.playtime < 60
                                                        ? `${game.playtime}m`
                                                        : `${Math.floor(game.playtime / 60)}h${game.playtime % 60 > 0 ? ` ${game.playtime % 60}m` : ''}`}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="overview-list">
                                <div className="overview-header">
                                    <h1 className="completed">Zerados <span>({completedGames.length})</span></h1>
                                    <p onClick={() => navigation('/completed')}>Ver todos</p>
                                </div>
                                <div className="overview">
                                    <ul>
                                        {completedGames.slice(0, 4).map(game => (
                                            <li key={game.id}>
                                                <img className="game-icon" src={game.cover_square} />
                                                <div>
                                                    <h1 className="game-title">{game.title}</h1>
                                                    <p className="aditional-text">
                                                    {game.playtime < 60
                                                        ? `${game.playtime}m`
                                                        : `${Math.floor(game.playtime / 60)}h${game.playtime % 60 > 0 ? ` ${game.playtime % 60}m` : ''}`}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;