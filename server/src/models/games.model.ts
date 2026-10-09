import { Games } from "../entities/games";
import {
    BulkPlaytimeEntry,
    BulkRtimeLastPlayedEntry,
    CreateGameInput,
    GameWithGenres,
    IGamesModel,
    UpdateGameInput
} from "./interfaces/games.interface.model";
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
                    personal_rating, beatable, hidden, installed
                )
                VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8, $9, $10, $11, $12)
                RETURNING *;    
                `, [
                input.title,
                input.steam_id,
                input.developer ?? null,
                input.release_date ?? null,
                input.rtime_last_played,
                input.playtime,
                input.status,
                input.cover_square ?? null,
                input.personal_rating ?? null,
                input.beatable ?? true,
                input.hidden ?? false,
                input.installed ?? false
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
                    personal_rating = $10,
                    beatable = $11,
                    hidden = $12,
                    installed = $13
                WHERE id = $1
                RETURNING *;
            `, [
                id,
                input.title,
                input.steam_id,
                input.developer ?? null,
                input.release_date ?? null,
                input.rtime_last_played,
                input.playtime,
                input.status,
                input.cover_square ?? null,
                input.personal_rating ?? null,
                input.beatable ?? true,
                input.hidden ?? false,
                input.installed ?? false
            ]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar jogo.", error);
        }
    }

    public async bulkUpdatePlaytime(
        entries: BulkPlaytimeEntry[]
    ): Promise<{ steam_id: number }[]> {
        if (!entries.length) return [];

        try {
            const steamIds = entries.map((e) => e.steam_id);
            const playtimes = entries.map((e) => e.playtime);

            const result = await pool.query(`
                UPDATE games AS g
                SET playtime = v.playtime
                FROM (
                    SELECT * FROM UNNEST($1::int[], $2::int[]) AS v(steam_id, playtime)
                ) AS v
                WHERE g.steam_id = v.steam_id
                RETURNING g.steam_id;
            `, [steamIds, playtimes]);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar playtime em lote.", error);
        }
    }

    public async bulkUpdateRtimeLastPlayed(
        entries: BulkRtimeLastPlayedEntry[]
    ): Promise<{ steam_id: number }[]> {
        if (!entries.length) return [];

        try {
            const steamIds = entries.map((e) => e.steam_id);
            const rtimes = entries.map((e) => e.rtime_last_played);

            const result = await pool.query(`
                UPDATE games AS g
                SET rtime_last_played = to_timestamp(v.rtime_last_played)
                FROM (
                    SELECT * FROM UNNEST($1::int[], $2::bigint[]) AS v(steam_id, rtime_last_played)
                ) AS v
                WHERE g.steam_id = v.steam_id
                RETURNING g.steam_id;
            `, [steamIds, rtimes]);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar rtime_last_played em lote.", error);
        }
    }

    public async bulkUpdateInstalled(
        installedSteamIds: number[]
    ): Promise<{ steam_id: number; installed: boolean }[]> {
        try {
            const result = await pool.query(`
                UPDATE games
                SET installed = (steam_id = ANY($1::int[]))
                WHERE installed IS DISTINCT FROM (steam_id = ANY($1::int[]))
                RETURNING steam_id, installed;
            `, [installedSteamIds]);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar jogos instalados em lote.", error);
        }
    }

    public async updateGameStatus(id: number, status: string): Promise<Games | undefined> {
        try {
            const result = await pool.query(`
                UPDATE games
                SET status = $2
                WHERE id = $1
                RETURNING *;
            `, [id, status]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar status do jogo.", error);
        }
    }

    public async updateGameHidden(id: number, hidden: boolean): Promise<Games | undefined> {
        try {
            const result = await pool.query(`
                UPDATE games
                SET hidden = $2
                WHERE id = $1
                RETURNING *;
            `, [id, hidden]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar hidden do jogo.", error);
        }
    }

    public async updateGameBeatable(id: number, beatable: boolean): Promise<Games | undefined> {
        try {
            const result = await pool.query(`
                UPDATE games
                SET beatable = $2
                WHERE id = $1
                RETURNING *;
            `, [id, beatable]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar beatable do jogo.", error);
        }
    }

    public async updateGameRtimeLastPlayed(id: number, rtime_last_played: string): Promise<Games | undefined> {
        try {
            const result = await pool.query(`
                UPDATE games
                SET rtime_last_played = $2
                WHERE id = $1
                RETURNING *;
            `, [id, rtime_last_played]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar última sessão do jogo.", error);
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