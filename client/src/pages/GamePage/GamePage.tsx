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
    type: string
    action: () => void | Promise<void>
}

const statusConfig = {
    playing: { icon: playing, label: 'Jogando', color: '#1FC06D' },
    played: { icon: played, label: 'Jogado', color: '#539FE9' },
    'not-played': { icon: notPlayed, label: 'Não jogado', color: '#D4AC27' },
    completed: { icon: completed, label: 'Zerado', color: '#7B5CFF' },
};

const BANNER_INDEX = 999;

// Índices: 0-3 = opções (grid 2x2) | 4-6 = estatísticas (coluna única)
const NAVIGATION_MAP: Record<number, Partial<Record<string, number>>> = {
    0: { cima: BANNER_INDEX, baixo: 1, direita: 4 },
    1: { cima: 0, baixo: 2, direita: 5 },
    2: { cima: 1, direita: 3 },
    3: { cima: 1, esquerda: 2, direita: 6 },
    4: { cima: BANNER_INDEX, baixo: 5, esquerda: 0 },
    5: { cima: 4, baixo: 6, esquerda: 1 },
    6: { cima: 5, esquerda: 3 },
};

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

    const optionsItems: ScreenItems[] = [
        {
            label: 'Adicionar à coleção',
            type: 'button',
            action: () => console.log('action not implemented')
        },
        {
            label: 'Remover da coleção',
            type: 'button',
            action: () => console.log('action not implemented')
        },
        {
            label: 'Zeravel:',
            type: 'attribute',
            action: () => console.log('action not implemented')
        },
        {
            label: 'Oculto:',
            type: 'attribute',
            action: () => console.log('action not implemented')
        }
    ];

    const statisticsItems: ScreenItems[] = [
        {
            label: 'Status',
            type: 'status',
            action: () => console.log('abrir troca de status')
        },
        {
            label: 'Tempo total',
            type: 'time',
            action: () => console.log('abrir edição de tempo jogado')
        },
        {
            label: 'Conquistas',
            type: 'achievements',
            action: () => console.log('abrir conquistas')
        }
    ];

    const joystickNavigation = (command: string) => {
        if (command === 'B') {
            navigation(-1);
            return;
        }

        if (selectedIndex === BANNER_INDEX) {
            if (command === 'baixo') {
                playSelectSound();
                setSelectedIndex(0);
            } else if (command === 'A' && currentGame) {
                handleStartGame(currentGame.id, currentGame.steam_id);
            }
            return;
        }

        if (command === 'A') {
            playConfirmSound();
            const item = selectedIndex < 4
                ? optionsItems[selectedIndex]
                : statisticsItems[selectedIndex - 4];
            item.action();
            return;
        }

        const nextIndex = NAVIGATION_MAP[selectedIndex]?.[command];
        if (nextIndex !== undefined) {
            playSelectSound();
            setSelectedIndex(nextIndex);
        }
    };

    return (
        <>
            <JoystickSetup command={joystickNavigation} />
            <SideMenu currentPage={''} />
            <div className="main-content">
                {!currentGame ? (
                    <p className="error-message">Jogo não encontrado</p>
                ) : (
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
                                    {optionsItems.map((item, index) => {
                                        const gridArea = item.type === 'attribute'
                                            ? (index === 2 ? 'attr1' : 'attr2')
                                            : (index === 0 ? 'button1' : 'button2');

                                        return (
                                            <div
                                                key={index}
                                                style={{ gridArea }}
                                                className={selectedIndex === index ?
                                                    "game-page-details-item options-item-focused" :
                                                    "game-page-details-item"
                                                }
                                            >
                                                <p>{item.label}</p>
                                                {item.type === 'attribute' && <p>sim</p>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="game-page-details-section">
                                <h2 className="game-page-details-section-title">Estatísticas</h2>
                                <div className="game-page-statistics-container">
                                    <div className={selectedIndex === 4 ?
                                        "game-page-details-item options-item-focused" :
                                        "game-page-details-item"
                                    }>
                                        <div>
                                            <img src={currentStatus.icon} />
                                            <p style={{ color: currentStatus.color, fontWeight: '500' }}>{currentStatus.label}</p>
                                        </div>
                                    </div>
                                    <div className={selectedIndex === 5 ?
                                        "game-page-details-item options-item-focused" :
                                        "game-page-details-item"
                                    }>
                                        <div>
                                            <img src={totalTime} />
                                            <p className="title">Tempo total</p>
                                        </div>
                                        <p>{currentGame.playtime < 60
                                            ? `${currentGame.playtime}min`
                                            : `${Math.floor(currentGame.playtime / 60)}h${currentGame.playtime % 60 > 0 ? ` ${currentGame.playtime % 60}min` : ''}`}
                                        </p>
                                    </div>
                                    <div className={selectedIndex === 6 ?
                                        "game-page-details-item options-item-focused" :
                                        "game-page-details-item"
                                    }>
                                        <div>
                                            <img src={trophy} />
                                            <p className="title">Conquistas</p>
                                        </div>
                                        <p>?/?</p>
                                    </div>
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