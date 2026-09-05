import { Collections } from "../entities/collections";
import { ICollectionsModel } from "./interfaces/collections.interface.model";
import pool from "../config/db.config";

export interface CollectionWithGames extends Collections {
    games: any[];
}

function dbError(context: string, error: unknown): Error {
    return new Error(`${context}\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`);
}

export class CollectionsModel implements ICollectionsModel {
    public async createCollection(title: string): Promise<Collections> {
        try {
            const result = await pool.query(`
                INSERT INTO collections (title)
                VALUES ($1)
                RETURNING *;
            `, [title]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao adicionar coleção ao banco de dados.", error);
        }
    }

    public async getAllCollections(): Promise<Collections[]> {
        try {
            const result = await pool.query(`
                SELECT * FROM collections;
            `);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar coleções.", error);
        }
    }

    public async getAllCollectionsWithGames(): Promise<CollectionWithGames[]> {
        try {
            const result = await pool.query(`
                SELECT
                    c.id,
                    c.title,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', g.id,
                                'title', g.title,
                                'steam_id', g.steam_id,
                                'cover_square', g.cover_square,
                                'cover_hero', g.cover_hero,
                                'cover_grid', g.cover_grid,
                                'developer', g.developer,
                                'release_date', g.release_date,
                                'personal_rating', g.personal_rating,
                                'playtime', g.playtime,
                                'status', g.status
                            ) ORDER BY g.title
                        ) FILTER (WHERE g.id IS NOT NULL),
                        '[]'
                    ) AS games
                FROM collections c
                LEFT JOIN collection_games cg ON cg.collection_id = c.id
                LEFT JOIN games g ON g.id = cg.game_id
                GROUP BY c.id, c.title
                ORDER BY c.id;
            `);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar coleções com jogos.", error);
        }
    }

    public async getCollection(id: number): Promise<Collections | undefined> {
        try {
            const result = await pool.query(`
                SELECT * FROM collections
                WHERE id = $1;
            `, [id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar coleção.", error);
        }
    }

    public async updateCollection(id: number, title: string): Promise<Collections | undefined> {
        try {
            const result = await pool.query(`
                UPDATE collections
                SET title = $2
                WHERE id = $1
                RETURNING *;
            `, [id, title]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar coleção.", error);
        }
    }

    public async deleteCollection(id: number): Promise<Collections | undefined> {
        try {
            const result = await pool.query(`
                DELETE FROM collections
                WHERE id = $1
                RETURNING *;
            `, [id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao deletar coleção.", error);
        }
    }
}