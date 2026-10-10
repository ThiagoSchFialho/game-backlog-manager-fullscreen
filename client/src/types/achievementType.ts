export interface Achievement {
    id: number;
    api_name: string;
    display_name: string | null;
    description: string | null;
    icon: string | null;
    icon_gray: string | null;
    unlocked: boolean;
    unlocked_at: string | null;
    global_percent: number;
}