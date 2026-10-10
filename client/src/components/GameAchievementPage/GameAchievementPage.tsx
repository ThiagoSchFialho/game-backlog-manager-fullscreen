import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

import JoystickSetup from '../../components/JoystickSetup/JoystickSetup';

import { useDb } from '../../hooks/useDb';

import type { Game } from '../../types/gamesType';
import type { Achievement } from '../../types/achievementType';
import { useSound } from '../../hooks/useSound';

interface GamePageProps {
    gameId: string,
    onExitGamePage: () => void
}

const GameAchievementPage: React.FC<GamePageProps> = ({ gameId, onExitGamePage }) => {
    const { getGameById, getAchievements} = useDb();
    const { playSelectSound } = useSound();
    const [currentGame, setCurrentGame] = useState<Game>();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState<boolean>(false);

    const getGame = async () => {
        const game = await getGameById(String(gameId));
        if (game) {
            setCurrentGame(game);
        }
    }

    const loadAchievements = async () => {
        const data = await getAchievements(String(gameId));
        if (data) {
            setAchievements(data);
        }
    }

    useEffect(() => {
        getGame();
        loadAchievements();
    }, []);

    const unlockedAchievements = achievements.filter((a) => a.unlocked);

    const recentAchievements = achievements
        .sort((a, b) => b.global_percent! - a.global_percent!);

    const achievementsLabel = achievements.length
        ? `${unlockedAchievements.length}/${achievements.length}`
        : '—';

    function formatarData(data: string | null): string {
        if (!data) {
            return '--/--/---- --:--';
        }

        const match = data.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);

        if (!match) {
            return '--/--/---- --:--';
        }

        const [, ano, mes, dia, hora, minuto] = match;

        return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    }

    const selectedIndexRef = useRef(selectedIndex);
    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    const itemsLengthRef = useRef(achievements.length);
    useEffect(() => {
        itemsLengthRef.current = achievements.length;
    }, [achievements.length]);

    const joystickNavigation = (command: string) => {
        if (command === 'START') {
            setIsHeaderMenuOpen(!isHeaderMenuOpen);
        }

        if (isHeaderMenuOpen) {
            if (command === 'B' || command === 'A') {
                setIsHeaderMenuOpen(false);
            }
            return;
        }

        const currentIndex = selectedIndexRef.current;
        const length = itemsLengthRef.current;  

        if (command === 'cima') {
            if (currentIndex !== 0) {
                playSelectSound();
                setSelectedIndex(currentIndex - 1);
            }
        } else if (command === 'baixo') {
            if (currentIndex < length - 1) {
                playSelectSound();
                setSelectedIndex(currentIndex + 1);
            }
        } else if (command === 'B') {
            onExitGamePage();
        }
    };

    // SCROLL ==========================================================================
    const SCROLL_DURATION = 90;

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const container = scrollContainerRef.current;
        const el = itemRefs.current[selectedIndex];
        if (!container || !el) return;

        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        const elTopInContainer = elRect.top - containerRect.top + container.scrollTop;
        const target =
            elTopInContainer - container.clientHeight / 2 + elRect.height / 2;

        const start = container.scrollTop;
        const distance = target - start;
        const startTime = performance.now();

        if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);

        const easeInOut = (t: number) =>
            t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const step = (now: number) => {
            const progress = Math.min((now - startTime) / SCROLL_DURATION, 1);
            container.scrollTop = start + distance * easeInOut(progress);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(step);
            } else {
                animationRef.current = null;
            }
        };

        animationRef.current = requestAnimationFrame(step);

        return () => {
            if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        };
    }, [selectedIndex]);
    // SCROLL ==========================================================================

    return (
        <>
            <JoystickSetup command={joystickNavigation} />
            <div className="background"></div>

            <div className="main-content">
                <h1>{achievementsLabel}</h1>
                <div className="game-achievements-page" ref={scrollContainerRef}>
                    {recentAchievements.map((achievement, index) => (
                        <div
                            className={selectedIndex === index ? "game-achievements-page-container game-achievements-page-container-focused" : "game-achievements-page-container"}
                            style={achievement.unlocked ? {} : {opacity: '0.5'}}
                            ref={(el) => { itemRefs.current[index] = el; }}
                            key={achievement.id}
                        >
                            <img
                                className="game-achievement-page-icon"
                                src={achievement.unlocked ? achievement.icon! : achievement.icon_gray!}
                                alt={achievement.display_name ?? achievement.api_name}
                                title={achievement.display_name ?? achievement.api_name}
                            />
                            <div className="game-achievement-page-name-time-container">
                                <div className="game-achievement-page-name-container">
                                    <p className="game-achievement-page-name">{achievement.display_name}</p>
                                    <p className="game-achievement-page-global-percent">{achievement.global_percent}%</p>
                                </div>

                                <div className="game-achievement-page-time">
                                    <p>{formatarData(achievement.unlocked_at)}</p>
                                </div>
                            </div>

                            <div className="game-achievement-page-description">
                                <p>{achievement.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default GameAchievementPage;
