export type GameStatus = 'completed' | 'not-played' | 'played' | 'playing';

export interface Game {
    id: string;
    title: string;
    steam_id: string;
    cover_square: string;
    cover_hero: string;
    cover_grid: string;
    developer: string;
    release_date: string;
    rtime_last_played: string;
    favorite: boolean;
    personal_rating: number;
    playtime: number;
    status: GameStatus;
}