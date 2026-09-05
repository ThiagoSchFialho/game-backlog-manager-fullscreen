import { Users } from "../../entities/users";

export interface IUserModel {
    createUser(steam_id: number, steam_api_key: string): Promise<Users>;
    getUser(): Promise<Users | undefined>;
    getUserBySteamId(steam_id: number): Promise<Users | undefined>;
    updateApiKey(steam_id: number, steam_api_key: string): Promise<Users | undefined>;
    deleteUser(steam_id: number): Promise<Users | undefined>;
}