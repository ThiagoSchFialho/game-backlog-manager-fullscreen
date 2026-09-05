import { Users } from "../entities/users";
import { IUserModel } from "./interfaces/users.interface.model";
import pool from "../config/db.config";

function dbError(context: string, error: unknown): Error {
    return new Error(`${context}\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`);
}

export class UsersModel implements IUserModel {
    
    public async createUser(steam_id: number, steam_api_key: string): Promise<Users> {
        try {
            const result = await pool.query(`
                INSERT INTO users (steam_id, steam_api_key)
                VALUES ($1, $2)
                RETURNING *;
            `, [steam_id, steam_api_key]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao adicionar usuário ao banco de dados.", error);
        }
    }

    
    public async getUser(): Promise<Users | undefined> {
        try {
            const result = await pool.query(`
                SELECT * FROM users LIMIT 1;
            `);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao recuperar usuário do banco de dados.", error);
        }
    }


    public async getUserBySteamId(steam_id: number): Promise<Users | undefined> {
        try {
            const result = await pool.query(`
                SELECT * FROM users
                WHERE steam_id = $1;
            `, [steam_id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao recuperar usuário do banco de dados.", error);
        }
    }


    public async updateApiKey(steam_id: number, steam_api_key: string): Promise<Users | undefined> {
        try {
            const result = await pool.query(`
                UPDATE users
                SET steam_api_key = $1
                WHERE steam_id = $2
                RETURNING *;
            `, [steam_api_key, steam_id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar usuário no banco de dados.", error);
        }
    }


    public async deleteUser(steam_id: number): Promise<Users | undefined> {
        try {
            const result = await pool.query(`
                DELETE FROM users
                WHERE steam_id = $1
                RETURNING *;    
            `, [steam_id]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao excluir usuário do banco de dados.", error);
        }
    }
}