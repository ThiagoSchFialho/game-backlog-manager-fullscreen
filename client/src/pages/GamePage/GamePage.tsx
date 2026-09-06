import React, { useEffect, useState } from 'react';
import './styles.css';
import SideMenu from '../../components/SideMenu/SideMenu';
import { getGameCover } from '../../utils/getGameCover';
import { useDb } from '../../hooks/useDb';
import type { Game } from '../../types/gamesType';
import GameLandscape from '../../components/GameLandscape/GameLandscape';
import { useParams } from 'react-router-dom';
import playing from '../../assets/icons/playing.svg';
import played from '../../assets/icons/played.svg';
import notPlayed from '../../assets/icons/not-played.svg';
import completed from '../../assets/icons/completed.svg';
import totalTime from '../../assets/icons/total-time.svg';
import trophy from '../../assets/icons/trophy.svg';

const statusConfig = {
    playing: { icon: playing, label: 'Jogando', color: '#1FC06D' },
    played: { icon: played, label: 'Jogado', color: '#539FE9' },
    'not-played': { icon: notPlayed, label: 'Não jogado', color: '#D4AC27' },
    completed: { icon: completed, label: 'Zerado', color: '#7B5CFF' },
};

const GamePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getGameById } = useDb();
    const [selected] = useState('library');
    const [currentGame, setCurrentGame] = useState<Game>();
    const currentStatus = statusConfig[currentGame?.status ?? 'not-played'];
    
    useEffect(() => {
        const getGame = async () => {
            const game = await getGameById(String(id));
            if (game) {
                setCurrentGame(game);
            }
        }
        getGame();
    }, []);

    return (
        <>
            <SideMenu currentPage={selected} />
            <div className="main-content">
                {!currentGame ? (
                    <p className="error-message">Jogo não encontrado</p>
                ): (
                    <>
                        <h1 className="game-page-title">{currentGame?.title}</h1>
                        <GameLandscape
                            id={currentGame.id}
                            steamId={currentGame.steam_id}
                            img={getGameCover(currentGame.title, 'landscape')}
                            name={currentGame.title}
                        />

                        <div className="game-page-details-container">
                            <div className="game-page-details-section">
                                <h2 className="game-page-details-section-title">Opções</h2>
                                <div className="game-page-details-item game-page-options-item">
                                    <p>Alterar status</p>
                                </div>
                                <div className="game-page-details-item game-page-options-item">
                                    <p>Adicionar à coleção</p>
                                </div>
                                <div className="game-page-details-item game-page-options-item">
                                    <p>Ocultar jogo</p>
                                </div>
                            </div>

                            <div className="game-page-details-section">
                                <h2 className="game-page-details-section-title">Estatísticas</h2>
                                <div className="game-page-details-item game-page-statistics-item">
                                    <div>
                                        <img src={currentStatus.icon} />
                                        <p style={{color: currentStatus.color, fontWeight: '500'}}>{currentStatus.label}</p>
                                    </div>
                                </div>
                                <div className="game-page-details-item game-page-statistics-item">
                                    <div>
                                        <img src={totalTime} />
                                        <p className="title">Tempo total</p>
                                    </div>
                                    <p>{currentGame.playtime < 60
                                        ? `${currentGame.playtime}min`
                                        : `${Math.floor(currentGame.playtime / 60)}h${currentGame.playtime % 60 > 0 ? ` ${currentGame.playtime % 60}min` : ''}`}
                                    </p>
                                </div>
                                <div className="game-page-details-item game-page-statistics-item">
                                    <div>
                                        <img src={trophy} />
                                        <p className="title">Conquistas</p>
                                    </div>
                                    <p>?/?</p>
                                </div>
                            </div>

                            <div className="game-page-details-section">
                                <h2 className="game-page-details-section-title">Conquistas recentes</h2>
                                <div className="game-page-achievements">

                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

export default GamePage;