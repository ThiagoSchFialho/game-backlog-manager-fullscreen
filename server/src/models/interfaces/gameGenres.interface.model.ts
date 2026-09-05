import { GameGenres } from "../../entities/gameGenres";

export interface IGameGenresModel {
    createGameGenre(game_id: number, genre_id: number): Promise<GameGenres>;
    getAllGameGenres(): Promise<GameGenres[]>;
    getGameGenre(id: number): Promise<GameGenres | undefined>;
    updateGameGenre(id: number, game_id: number, genre_id: number): Promise<GameGenres | undefined>;
    deleteGameGenre(id: number): Promise<GameGenres | undefined>;
}