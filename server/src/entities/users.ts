import { IUser } from "./interfaces/users.interface";

export class Users implements IUser {
    id?: number;
    steam_id: number;
    steam_api_key: string;

    constructor(steam_id: number, steam_api_key: string) {
        this.steam_id = steam_id
        this.steam_api_key = steam_api_key
    }
}