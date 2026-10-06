import { useCallback } from 'react';

const host = import.meta.env.VITE_BACKEND_HOST;

export interface SteamApp {
    appId: number;
    name: string;
    library: string;
    flags: number;
    isInstalled: boolean;
    needsUpdate: boolean;
    isRunning: boolean;
    isInstalling: boolean;
    isPaused: boolean;
    isHealthy: boolean;
}

export interface RunningGameResponse {
    running: boolean;
    game: SteamApp | null;
}

export const useSystem = () => {
    const request = useCallback(async <T,>(endpoint: string, fallback: T): Promise<T> => {
        try {
            const response = await fetch(`${host}/system${endpoint}`);
            if (!response.ok) throw new Error(`Erro ${response.status}`);
            return (await response.json()) as T;
        } catch (error) {
            console.error(`Falha ao buscar ${endpoint}:`, error);
            return fallback;
        }
    }, []);

    const fetchInstalledGames = useCallback(
        () => request<SteamApp[]>('/installed-games', []),
        [request]
    );

    const fetchRunningGame = useCallback(
        () => request<RunningGameResponse>('/running-game', { running: false, game: null }),
        [request]
    );

    const fetchInstallingGames = useCallback(
        () => request<SteamApp[]>('/installing-game', []),
        [request]
    );

    const fetchRequiredUpdates = useCallback(
        () => request<SteamApp[]>('/required-updates', []),
        [request]
    );

    return {
        fetchInstalledGames,
        fetchRunningGame,
        fetchInstallingGames,
        fetchRequiredUpdates,
    };
};