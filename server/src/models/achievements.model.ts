import pool from "../config/db.config";
import {
    Achievement,
    AchievementSchemaInput,
    AchievementUnlockEntry,
    GameAchievementProgress,
    IAchievementsModel
} from "./interfaces/achievements.interface.model";

function dbError(context: string, error: unknown): Error {
    return new Error(`${context}\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`);
}

export class AchievementsModel implements IAchievementsModel {
    public async hasSchema(gameId: number): Promise<boolean> {
        try {
            const result = await pool.query(`
                SELECT 1 FROM achievements WHERE game_id = $1 LIMIT 1;
            `, [gameId]);

            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao verificar schema de conquistas.", error);
        }
    }

    public async upsertSchema(gameId: number, items: AchievementSchemaInput[]): Promise<void> {
        if (!items.length) return;

        try {
            const gameIds = items.map(() => gameId);
            const apiNames = items.map((i) => i.api_name);
            const displayNames = items.map((i) => i.display_name);
            const descriptions = items.map((i) => i.description);
            const icons = items.map((i) => i.icon);
            const iconGrays = items.map((i) => i.icon_gray);

            await pool.query(`
                INSERT INTO achievements (game_id, api_name, display_name, description, icon, icon_gray)
                SELECT * FROM UNNEST(
                    $1::int[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[]
                )
                ON CONFLICT (game_id, api_name) DO UPDATE
                SET display_name = EXCLUDED.display_name,
                    description = EXCLUDED.description,
                    icon = EXCLUDED.icon,
                    icon_gray = EXCLUDED.icon_gray;
            `, [gameIds, apiNames, displayNames, descriptions, icons, iconGrays]);
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao salvar schema de conquistas.", error);
        }
    }

    public async bulkUpdateUnlocked(
        gameId: number,
        entries: AchievementUnlockEntry[]
    ): Promise<{ api_name: string }[]> {
        if (!entries.length) return [];

        try {
            const apiNames = entries.map((e) => e.api_name);
            const unlocked = entries.map((e) => e.unlocked);
            const unlockedAt = entries.map((e) => e.unlocked_at);

            const result = await pool.query(`
                UPDATE achievements AS a
                SET unlocked = v.unlocked,
                    unlocked_at = CASE WHEN v.unlocked_at IS NULL THEN NULL ELSE to_timestamp(v.unlocked_at) END
                FROM (
                    SELECT * FROM UNNEST($2::text[], $3::boolean[], $4::bigint[])
                ) AS v(api_name, unlocked, unlocked_at)
                WHERE a.game_id = $1 AND a.api_name = v.api_name
                RETURNING a.api_name;
            `, [gameId, apiNames, unlocked, unlockedAt]);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao atualizar conquistas desbloqueadas.", error);
        }
    }

    public async getByGameId(gameId: number): Promise<Achievement[]> {
        try {
            const result = await pool.query(`
                SELECT * FROM achievements
                WHERE game_id = $1
                ORDER BY unlocked DESC, display_name ASC;
            `, [gameId]);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar conquistas do jogo.", error);
        }
    }

    public async getProgressByGameId(gameId: number): Promise<GameAchievementProgress | undefined> {
        try {
            const result = await pool.query(`
                SELECT
                    game_id,
                    COUNT(*) FILTER (WHERE unlocked)::int AS unlocked,
                    COUNT(*)::int AS total
                FROM achievements
                WHERE game_id = $1
                GROUP BY game_id;
            `, [gameId]);

            return result.rows[0];
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar progresso de conquistas.", error);
        }
    }

    public async getProgressForAllGames(): Promise<GameAchievementProgress[]> {
        try {
            const result = await pool.query(`
                SELECT
                    game_id,
                    COUNT(*) FILTER (WHERE unlocked)::int AS unlocked,
                    COUNT(*)::int AS total
                FROM achievements
                GROUP BY game_id;
            `);

            return result.rows;
        } catch (error) {
            console.error(error);
            throw dbError("Erro ao buscar progresso de conquistas de todos os jogos.", error);
        }
    }
}
