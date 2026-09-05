import { Games } from "../../entities/games";

export interface CreateGameInput {
    title: string;
    steam_id: number;
    developer: string;
    release_date: string;
    rtime_last_played: string;
    playtime: number;
    status: string;
    cover_square?: string | undefined;
    cover_hero?: string | undefined;
    cover_grid?: string | undefined;
    personal_rating?: number | undefined;
    favorite?: boolean | undefined;
}

export interface GameWithGenres extends Games {
    genres: { id: number; name: string }[];
}

export interface UpdateGameInput extends Partial<CreateGameInput> {}

export interface IGamesModel {
    createGame(input: CreateGameInput): Promise<Games>;
    getGameById(id: number): Promise<Games | undefined>;
    getGameByIdWithGenres(id: number): Promise<GameWithGenres | undefined>;
    getGameBySteamId(steam_id: number): Promise<Games | undefined>;
    getGameBySteamIdWithGenres(steam_id: number): Promise<GameWithGenres | undefined>;
    getAllGames(): Promise<Games[]>;
    getAllGamesWithGenres(): Promise<GameWithGenres[]>
    updateGame(id: number, input: UpdateGameInput): Promise<Games | undefined>;
    deleteGame(id: number): Promise<Games | undefined>;
}