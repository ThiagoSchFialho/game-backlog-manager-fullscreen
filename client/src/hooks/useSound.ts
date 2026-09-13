import { useCallback } from 'react';
import selectSound from '../assets/sounds/select.mp3';
import confirmSound from '../assets/sounds/confirm.mp3';
import confirm2Sound from '../assets/sounds/confirm2.mp3';
import popupSound from '../assets/sounds/popup.mp3';
import swipeSound from '../assets/sounds/swipe.mp3';
import cursorSound from '../assets/sounds/cursor.mp3';
import backSound from '../assets/sounds/back.mp3';

const createAudio = (src: string, volume: number) => {
    const audio = new Audio(src);
    audio.volume = volume;
    return audio;
};

const sounds = {
    select: createAudio(selectSound, 0.8),
    confirm: createAudio(confirmSound, 0.2),
    confirm2: createAudio(confirm2Sound, 0.1),
    popup: createAudio(popupSound, 0.1),
    swipe: createAudio(swipeSound, 0.1),
    cursor: createAudio(cursorSound, 0.2),
    back: createAudio(backSound, 0.1),
};

const play = (audio: HTMLAudioElement) => {
    audio.currentTime = 0;
    audio.play().catch(() => {});
};

export const useSound = () => {
    const playSelectSound = useCallback(() => play(sounds.select), []);
    const playConfirmSound = useCallback(() => play(sounds.confirm), []);
    const playConfirm2Sound = useCallback(() => play(sounds.confirm2), []);
    const playPopupSound = useCallback(() => play(sounds.popup), []);
    const playSwipeSound = useCallback(() => play(sounds.swipe), []);
    const playCursorSound = useCallback(() => play(sounds.cursor), []);
    const playBackSound = useCallback(() => play(sounds.back), []);

    return {
        playSelectSound,
        playConfirmSound,
        playConfirm2Sound,
        playPopupSound,
        playSwipeSound,
        playCursorSound,
        playBackSound
    };
}; 