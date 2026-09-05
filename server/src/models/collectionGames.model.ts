import { CollectionGames } from "../entities/collectionGames";
import { ICollectionGamesModel } from "./interfaces/collectionGames.interface.model";
import pool from "../config/db.config";

function dbError(context: string, error: unknown): Error {
    return new Error(`${context}\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`);
}

export class CollectionGamesModel implements ICollectionGamesModel {
        
    public async createCollectionGames(collection_id: number, game_id: number): Promise<CollectionGames> {
        try {
            const result = await pool.query(`
                INSERT INTO collection_games (collection_id, game_id)
                VALUES ($1, $2)
                RETURNING *;
            `, [collection_id, game_id]);
            
            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao adicionar jogo à coleção.", error);
        }
    }
        
    public async getAllCollectionGames(): Promise<CollectionGames[]> {
        try {
            const result = await pool.query(`
                SELECT * FROM collection_games;
            `);
            
            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar jogos das coleções.", error);
        }
    }
            
    public async getCollectionGames(id: number): Promise<CollectionGames | undefined> {
        try {
            const result = await pool.query(`
                SELECT * FROM collection_games
                WHERE id = $1;
            `, [id]);
            
            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar jogo da coleção.", error);
        }
    }
                
    public async getCollectionGamesByGameId(game_id: number): Promise<CollectionGames | undefined> {
        try {
            const result = await pool.query(`
                SELECT * FROM collection_games
                WHERE game_id = $1;
            `, [game_id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar jogo da coleção.", error);
        }
    }

    public async updateCollectionGames(id: number, collection_id: number, game_id: number): Promise<CollectionGames | undefined> {
        try {
            const result = await pool.query(`
                UPDATE collection_games
                SET collection_id = $2, game_id = $3
                WHERE id = $1
                RETURNING *;
            `, [id, collection_id, game_id]);
            
            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar jogo da coleção.", error);
        }
    }
                    
    public async deleteCollectionGames(id: number): Promise<CollectionGames | undefined> {
        try {
            const result = await pool.query(`
                DELETE FROM collection_games
                WHERE id = $1
                RETURNING *;
            `, [id]);
                
            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao deletar jogo da coleção.", error);
        }
    }

    public async deleteCollectionGamesByRelation(game_id: number, collection_id: number): Promise<CollectionGames | undefined> {
        try {
            const result = await pool.query(`
                DELETE FROM collection_games
                WHERE game_id = $1 AND collection_id = $2
                RETURNING *;
            `, [game_id, collection_id]);
                
            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao deletar jogo da coleção.", error);
        }
    }
}