import type { Game } from '../types/gamesType';

const RANDOM_GAME_STORAGE_KEY = 'home:randomGame';
const RANDOM_GAME_INTERVAL_MS = 5 * 60 * 1000;

type StoredRandomGame = {
    id: Game['id'];
    pickedAt: number;
};

const pickRandomGame = (list: Game[]): Game => {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
};

const getOrPickRandomGame = (installedGames: Game[]): Game => {
    const raw = localStorage.getItem(RANDOM_GAME_STORAGE_KEY);

    if (raw) {
        try {
            const stored: StoredRandomGame = JSON.parse(raw);
            const stillValid = Date.now() - stored.pickedAt < RANDOM_GAME_INTERVAL_MS;
            const existingGame = installedGames.find(g => g.id === stored.id);

            if (stillValid && existingGame) {
                return existingGame;
            }
        } catch {
            // storage corrompido, ignora e sorteia de novo
        }
    }

    const newGame = pickRandomGame(installedGames);
    localStorage.setItem(
        RANDOM_GAME_STORAGE_KEY,
        JSON.stringify({ id: newGame.id, pickedAt: Date.now() })
    );
    return newGame;
};

export default getOrPickRandomGame;