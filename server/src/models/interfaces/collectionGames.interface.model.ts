import { CollectionGames } from "../../entities/collectionGames";

export interface ICollectionGamesModel {
    createCollectionGames(collection_id: number, game_id: number): Promise<CollectionGames>;
    getAllCollectionGames(): Promise<CollectionGames[]>;
    getCollectionGames(id: number): Promise<CollectionGames | undefined>;
    getCollectionGamesByGameId(game_id: number): Promise<CollectionGames | undefined>;
    updateCollectionGames(id: number, collection_id: number, game_id: number): Promise<CollectionGames | undefined>;
    deleteCollectionGames(id: number): Promise<CollectionGames | undefined>;
    deleteCollectionGamesByRelation(game_id: number, collection_id: number): Promise<CollectionGames | undefined>;
}