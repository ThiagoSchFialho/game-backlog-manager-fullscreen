import { ICollections } from "./interfaces/collections.interface";

export class Collections implements ICollections {
    id?: number;
    title!: string;

    constructor(data: ICollections) {
        Object.assign(this, data);
    }
}