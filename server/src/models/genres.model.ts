import { Genres } from "../entities/genres";
import { IGenresModel } from "./interfaces/genres.interface.model";
import pool from "../config/db.config";

function dbError(context: string, error: unknown): Error {
    return new Error(`${context}\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`);
}

export class GenresModel implements IGenresModel {
    public async createGenre(name: string): Promise<Genres> {
        try {
            const result = await pool.query(`
                INSERT INTO genres (name)
                VALUES ($1)
                RETURNING *;  
            `, [name]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao adicionar gênero ao banco de dados.", error);
        }
    }


    public async getAllGenres(): Promise<Genres[]> {
        try {
            const result = await pool.query(`
                SELECT * FROM genres;    
            `);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao recuperar gêneros do banco de dados.", error);
        }
    }


    public async getGenre(id: number): Promise<Genres | undefined> {
        try {
            const result = await pool.query(`
                SELECT * FROM genres
                WHERE id = $1;    
            `, [id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao recuperar gênero do banco de dados.", error);
        }
    }


    public async updateGenre(id: number, name: string): Promise<Genres | undefined> {
        try {
            const result = await pool.query(`
                UPDATE genres
                SET name = $1
                WHERE id = $2
                RETURNING *;   
            `, [name, id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar gênero no banco de dados.", error);
        }
    }

    
    public async deleteGenre(id: number): Promise<Genres | undefined> {
        try {
            const result = await pool.query(`
                DELETE FROM genres
                WHERE id = $1
                RETURNING *;    
            `, [id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao excluir gênero do banco de dados", error);
        }
    }
    
}