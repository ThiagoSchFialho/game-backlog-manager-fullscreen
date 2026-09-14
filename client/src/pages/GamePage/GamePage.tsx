import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './styles.css';

import SideMenu from '../../components/SideMenu/SideMenu';
import GameLandscape from '../../components/GameLandscape/GameLandscape';
import JoystickSetup from '../../components/JoystickSetup/JoystickSetup';

import { useDb } from '../../hooks/useDb';

import { getGameCover } from '../../utils/getGameCover';

import playing from '../../assets/icons/playing.svg';
import played from '../../assets/icons/played.svg';
import notPlayed from '../../assets/icons/not-played.svg';
import completed from '../../assets/icons/completed.svg';
import totalTime from '../../assets/icons/total-time.svg';
import trophy from '../../assets/icons/trophy.svg';

import type { Game } from '../Collection/Collection';
import { useSound } from '../../hooks/useSound';
interface ScreenItems {
    label: string
    action:  () => void | Promise<void>
}

const statusConfig = {
    playing: { icon: playing, label: 'Jogando', color: '#1FC06D' },
    played: { icon: played, label: 'Jogado', color: '#539FE9' },
    'not-played': { icon: notPlayed, label: 'Não jogado', color: '#D4AC27' },
    completed: { icon: completed, label: 'Zerado', color: '#7B5CFF' },
};

const BANNER_INDEX = 999;


const GamePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigation = useNavigate();
    const { getGameById, handleStartGame } = useDb();
    const { playSelectSound, playConfirmSound } = useSound();
    const [currentGame, setCurrentGame] = useState<Game>();
    const currentStatus = statusConfig[currentGame?.status ?? 'not-played'];
    const [selectedIndex, setSelectedIndex] = useState(999);
    
    useEffect(() => {
        const getGame = async () => {
            const game = await getGameById(String(id));
            if (game) {
                setCurrentGame(game);
            }
        }
        getGame();
    }, []);

    const screenItems: ScreenItems[] = [
        {
            label: 'Zeravel:',
            action: () => console.log('action not implemented')
        },
        {
            label: 'Alterar status',
            action: () => console.log('action not implemented')
        },
        {
            label: 'Adicionar à coleção',
            action: () => console.log('action not implemented')
        },
        {
            label: 'Remover da coleção',
            action: () => console.log('action not implemented')
        },
        {
            label: 'Ocultar jogo',
            action: () => console.log('action not implemented')
        }
    ];

    const joystickNavigation = (command: string) => {
        if (selectedIndex === BANNER_INDEX) {
            if (command === 'baixo') {
                playSelectSound();
                setSelectedIndex(0);
            } else if (command === 'A') {
                if (currentGame) {
                    handleStartGame(currentGame.id, currentGame.steam_id)
                }
            }
        } else {
            if (command === 'esquerda') {
                if (selectedIndex % 2 !== 0) {
                    playSelectSound();
                    setSelectedIndex(selectedIndex - 1);
                }
            } else if (command === 'direita') {
                if (selectedIndex % 2 === 0) {
                    if (selectedIndex < screenItems.length - 1) {
                        playSelectSound();
                        setSelectedIndex(selectedIndex + 1);
                    }
                }
            } else if (command === 'cima') {
                playSelectSound();
                if (selectedIndex < 2) {
                    setSelectedIndex(999);
                } else {
                    setSelectedIndex(selectedIndex - 2);
                }
            } else if (command === 'baixo') {
                if (selectedIndex < screenItems.length - 2 ){
                    playSelectSound();
                    setSelectedIndex(selectedIndex + 2);
                }
            } else if (command === 'A') {
                playConfirmSound();
                screenItems[selectedIndex].action();
            } else if (command === 'B') {
                navigation(-1);
            }
        }
    };

    return (
        <>
            <JoystickSetup command={joystickNavigation} />
            <SideMenu currentPage={''} />
            <div className="main-content">
                {!currentGame ? (
                    <p className="error-message">Jogo não encontrado</p>
                ): (
                    <>
                        <h1 className="game-page-title">{currentGame?.title}</h1>
                            <GameLandscape
                                id={currentGame.steam_id}
                                steamId={currentGame.steam_id}
                                img={getGameCover(currentGame.title, 'landscape')}
                                name={currentGame.title}
                                isFocused={selectedIndex === 999}
                            />

                        <div className="game-page-details-container">
                            <div className="game-page-details-section">
                                <h2 className="game-page-details-section-title">Opções</h2>
                                <div className="game-page-options-container">
                                    {screenItems.map((item, index) => (
                                        <div
                                            className={ selectedIndex === index ? "game-page-details-item game-page-options-item options-item-focused" : "game-page-details-item game-page-options-item"}
                                        >
                                            {index === 0 ? (
                                                <>
                                                    <p>{item.label}</p>
                                                    <p>sim</p>
                                                </>
                                            ) : (
                                                <p>{item.label}</p>
                                            )}
                                        </div>
                                    ))}
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