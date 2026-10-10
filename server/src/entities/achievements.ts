import { IAchievements } from "./interfaces/achievements.interface";

export class Achievements implements IAchievements {
    id?: number;
    game_id!: number;
    api_name!: string;
    display_name!: string | null;
    description!: string | null;
    icon!: string | null;
    icon_gray!: string | null;
    unlocked!: boolean;
    unlocked_at!: string | null;
    global_percent!: number | null;

    constructor(data: IAchievements) {
        Object.assign(this, data);
    }
}