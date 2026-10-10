import { ICollectionGames } from "./interfaces/collectionGames.interface";

export class CollectionGames implements ICollectionGames {
    collection_id!: number;
    game_id!: number;

    constructor(data: ICollectionGames) {
        Object.assign(this, data);
    }
}