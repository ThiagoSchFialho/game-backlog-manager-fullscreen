import { IGames } from "./interfaces/games.interface";

export class Games implements IGames {
    id?: number;
    title!: string;
    steam_id!: number;
    cover_square?: string;
    developer?: string;
    release_date?: string;
    rtime_last_played!: string;
    beatable!: boolean;
    hidden!: boolean;
    installed?: boolean;
    personal_rating?: number;
    playtime!: number;
    status!: string;
    
    constructor(data: IGames) {
        Object.assign(this, data);
    }
}