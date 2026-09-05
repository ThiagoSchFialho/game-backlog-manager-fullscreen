import { ICollectionGames } from "./interfaces/collectionGames.interface";

export class CollectionGames implements ICollectionGames {
    collection_id: number;
    game_id: number;

    constructor(collection_id: number, game_id: number) {
        this.collection_id = collection_id;
        this.game_id = game_id;
    }
}