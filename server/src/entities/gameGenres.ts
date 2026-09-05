import { IGameGenres } from "./interfaces/gameGenres.interface";

export class GameGenres implements IGameGenres {
    game_id: number;
    genre_id: number;

    constructor(game_id: number, genre_id: number) {
        this.game_id = game_id;
        this.genre_id = genre_id;
    }
}