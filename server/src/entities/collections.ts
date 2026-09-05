import { ICollections } from "./interfaces/collections.interface";

export class Collections implements ICollections {
    id?: number;
    title: string;

    constructor(title: string) {
        this.title = title;
    }
}