export interface IGames {
    id?: number;
    title: string;
    steam_id: number;
    cover_square?: string;
    cover_hero?: string;
    cover_grid?: string;
    developer: string;
    release_date: string;
    rtime_last_played: string;
    beatable: boolean;
    personal_rating?: number;
    playtime: number;
    status: string;
}