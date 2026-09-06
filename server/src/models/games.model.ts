import { Games } from "../entities/games";
import { CreateGameInput, GameWithGenres, IGamesModel, UpdateGameInput } from "./interfaces/games.interface.model";
import pool from "../config/db.config";

function dbError(context: string, error: unknown): Error {
    return new Error(`${context}\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`);
}

export class GamesModel implements IGamesModel {
    public async createGame(input: CreateGameInput): Promise<Games> {
        try {
            const result = await pool.query(`
                INSERT INTO games (
                    title, steam_id, developer, release_date,
                    rtime_last_played, playtime, status, cover_square,
                    cover_hero, cover_grid, personal_rating, beatable
                )
                VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8, $9, $10, $11, $12)
                RETURNING *;    
                `, [
                input.title,
                input.steam_id,
                input.developer,
                input.release_date,
                input.rtime_last_played,
                input.playtime,
                input.status,
                input.cover_square ?? null,
                input.cover_hero ?? null,
                input.cover_grid ?? null,
                input.personal_rating ?? null,
                input.beatable ?? true,
            ]);
            
            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao adicionar jogo ao banco de dados.", error);
        }
    }
    
    public async getGameById(id: number): Promise<Games | undefined> {
        try {
            const result = await pool.query(`
                SELECT * FROM games
                WHERE id = $1;
                `, [id]);
                
                return result.rows[0];
            } catch (error) {
                console.error(error);
                throw dbError("Erro ao buscar jogo por id.", error);
            }
    }

    public async getGameByIdWithGenres(id: number): Promise<GameWithGenres | undefined> {
        try {
            const result = await pool.query(`
                SELECT
                    g.*,
                    COALESCE(
                        json_agg(
                            json_build_object('id', gen.id, 'name', gen.name)
                        ) FILTER (WHERE gen.id IS NOT NULL),
                        '[]'
                    ) AS genres
                FROM games g
                LEFT JOIN game_genres gg ON gg.game_id = g.id
                LEFT JOIN genres gen ON gen.id = gg.genre_id
                WHERE g.id = $1
                GROUP BY g.id;
            `, [id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar jogo por id com gêneros.", error);
        }
    }
    
    public async getGameBySteamId(steam_id: number): Promise<Games | undefined> {
        try {
            const result = await pool.query(`
                SELECT * FROM games
                WHERE steam_id = $1;
                `, [steam_id]);
                
                return result.rows[0];
            } catch (error) {
                console.error(error);
            throw dbError("Erro ao buscar jogo por steam_id.", error);
        }
    }
    
    public async getGameBySteamIdWithGenres(steam_id: number): Promise<GameWithGenres | undefined> {
        try {
            const result = await pool.query(`
                SELECT
                    g.*,
                    COALESCE(
                        json_agg(
                            json_build_object('id', gen.id, 'name', gen.name)
                        ) FILTER (WHERE gen.id IS NOT NULL),
                        '[]'
                    ) AS genres
                FROM games g
                LEFT JOIN game_genres gg ON gg.game_id = g.id
                LEFT JOIN genres gen ON gen.id = gg.genre_id
                WHERE g.steam_id = $1
                GROUP BY g.id;
            `, [steam_id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar jogo por steam_id com gêneros.", error);
        }
    }
    
    public async getAllGames(): Promise<Games[]> {
        try {
            const result = await pool.query(`
                SELECT * FROM games;
            `);
            
            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar jogos.", error);
        }
    }
        
    public async getAllGamesWithGenres(): Promise<GameWithGenres[]> {
        try {
            const result = await pool.query(`
                SELECT
                    g.*,
                    COALESCE(
                        json_agg(
                            json_build_object('id', gen.id, 'name', gen.name)
                        ) FILTER (WHERE gen.id IS NOT NULL),
                        '[]'
                    ) AS genres
                FROM games g
                LEFT JOIN game_genres gg ON gg.game_id = g.id
                LEFT JOIN genres gen ON gen.id = gg.genre_id
                GROUP BY g.id;
            `);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar jogos com gêneros.", error);
        }
    }

    public async updateGame(id: number, input: UpdateGameInput): Promise<Games | undefined> {
        try {
            const result = await pool.query(`
                UPDATE games
                SET title = $2,
                    steam_id = $3,
                    developer = $4,
                    release_date = $5,
                    rtime_last_played = to_timestamp($6),
                    playtime = $7,
                    status = $8,
                    cover_square = $9,
                    cover_hero = $10,
                    cover_grid = $11,
                    personal_rating = $12,
                    beatable = $13
                WHERE id = $1
                RETURNING *;
            `, [
                id,
                input.title,
                input.steam_id,
                input.developer,
                input.release_date,
                input.rtime_last_played,
                input.playtime,
                input.status,
                input.cover_square ?? null,
                input.cover_hero ?? null,
                input.cover_grid ?? null,
                input.personal_rating ?? null,
                input.beatable ?? true,
            ]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar jogo.", error);
        }
    }


    public async deleteGame(id: number): Promise<Games | undefined> {
        try {
            const result = await pool.query(`
                DELETE FROM games
                WHERE id = $1
                RETURNING *;
            `, [id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao deletar jogo.", error);
        }
    }
    
}