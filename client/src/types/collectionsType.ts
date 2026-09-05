import type { Game } from "./gamesType";
export interface ICollection {
    id: string;
    title: string;
    games: Game[];
}