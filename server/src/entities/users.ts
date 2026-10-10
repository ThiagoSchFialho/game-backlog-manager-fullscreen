import { IUser } from "./interfaces/users.interface";

export class Users implements IUser {
    id?: number;
    steam_id!: number;
    steam_api_key!: string;

    constructor(data: IUser) {
        Object.assign(this, data);
    }
}