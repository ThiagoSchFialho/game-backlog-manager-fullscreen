import { useEffect, useRef } from 'react';
import selectSound from '../assets/sounds/select.mp3';
import confirmSound from '../assets/sounds/confirm.mp3';
import confirm2Sound from '../assets/sounds/confirm2.mp3';
import popupSound from '../assets/sounds/popup.mp3';
import swipeSound from '../assets/sounds/swipe.mp3';
import cursorSound from '../assets/sounds/cursor.mp3';
import backSound from '../assets/sounds/back.mp3';

export const useSound = () => {
    const selectAudioRef = useRef<HTMLAudioElement | null>(null);
    const confirmAudioRef = useRef<HTMLAudioElement | null>(null);
    const confirm2AudioRef = useRef<HTMLAudioElement | null>(null);
    const popupAudioRef = useRef<HTMLAudioElement | null>(null);
    const swipeSoundRef = useRef<HTMLAudioElement | null>(null);
    const cursorAudioRef = useRef<HTMLAudioElement | null>(null);
    const backAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        selectAudioRef.current = new Audio(selectSound);
        selectAudioRef.current.volume = 0.8;

        confirmAudioRef.current = new Audio(confirmSound);
        confirmAudioRef.current.volume = 0.2;

        confirm2AudioRef.current = new Audio(confirm2Sound);
        confirm2AudioRef.current.volume = 0.1;

        popupAudioRef.current = new Audio(popupSound);
        popupAudioRef.current.volume = 0.1;

        swipeSoundRef.current = new Audio(swipeSound);
        swipeSoundRef.current.volume = 0.1;

        cursorAudioRef.current = new Audio(cursorSound);
        cursorAudioRef.current.volume = 0.2;

        backAudioRef.current = new Audio(backSound);
        backAudioRef.current.volume = 0.1;
    }, []);

    const playSelectSound = () => {
        const audio = selectAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };

    const playConfirmSound = () => {
        const audio = confirmAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };

    const playConfirm2Sound = () => {
        const audio = confirm2AudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };

    const playPopupSound = () => {
        const audio = popupAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };

    const playSwipeSound = () => {
        const audio = swipeSoundRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };

    const playCursorSound = () => {
        const audio = cursorAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };

    const playBackSound = () => {
        const audio = backAudioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
            });
        }
    };

    return {
        playSelectSound,
        playConfirmSound,
        playConfirm2Sound,
        playPopupSound,
        playSwipeSound,
        playCursorSound,
        playBackSound
    };
}