import { Achievements } from "../../entities/achievements";

export interface AchievementSchemaInput {
    api_name: string;
    display_name: string | null;
    description: string | null;
    icon: string | null;
    icon_gray: string | null;
}

export interface AchievementUnlockEntry {
    api_name: string;
    unlocked: boolean;
    unlocked_at: number | null; // unix seconds, null se nunca foi desbloqueada
}

export interface GameAchievementProgress {
    game_id: number;
    unlocked: number;
    total: number;
}

export interface AchievementGlobalPercentEntry {
    api_name: string;
    global_percent: number;
}

export interface IAchievementsModel {
    hasSchema(gameId: number): Promise<boolean>;
    upsertSchema(gameId: number, items: AchievementSchemaInput[]): Promise<void>;
    bulkUpdateUnlocked(gameId: number, entries: AchievementUnlockEntry[]): Promise<{ api_name: string }[]>;
    getByGameId(gameId: number): Promise<Achievements[]>;
    getProgressByGameId(gameId: number): Promise<GameAchievementProgress | undefined>;
    getProgressForAllGames(): Promise<GameAchievementProgress[]>;
    needsGlobalPercent(gameId: number): Promise<boolean>;
    bulkUpdateGlobalPercent(gameId: number, entries: AchievementGlobalPercentEntry[]): Promise<{ api_name: string }[]>;
}