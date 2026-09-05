import { IGenres } from "./interfaces/genres.interface";

export class Genres implements IGenres {
    id?: number;
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}