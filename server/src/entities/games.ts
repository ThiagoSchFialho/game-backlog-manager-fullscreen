import { IGames } from "./interfaces/games.interface";

export class Games implements IGames {
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
    
    constructor(
        title: string,
        steam_id: number,
        cover_square: string,
        cover_hero: string,
        cover_grid: string,
        developer: string,
        release_date: string,
        rtime_last_played: string,
        beatable: boolean,
        personal_rating: number,
        playtime: number,
        status: string
    ) {
        this.title = title;
        this.steam_id = steam_id;
        this.cover_square = cover_square;
        this.cover_hero = cover_hero;
        this.cover_grid = cover_grid;
        this.developer = developer;
        this.release_date = release_date;
        this.rtime_last_played = rtime_last_played;
        this.beatable = beatable;
        this.personal_rating = personal_rating;
        this.playtime = playtime;
        this.status = status;
    }
}