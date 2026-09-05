import { Genres } from "../../entities/genres";

export interface IGenresModel {
    createGenre(name: string): Promise<Genres>
    getAllGenres(): Promise<Genres[]>
    getGenre(id: number): Promise<Genres | undefined>
    updateGenre(id: number, name: string): Promise<Genres | undefined>
    deleteGenre(id: number): Promise<Genres | undefined>
}