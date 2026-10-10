import { IGameGenres } from "./interfaces/gameGenres.interface";

export class GameGenres implements IGameGenres {
    game_id!: number;
    genre_id!: number;

    constructor(data: IGameGenres) {
        Object.assign(this, data);
    }
}