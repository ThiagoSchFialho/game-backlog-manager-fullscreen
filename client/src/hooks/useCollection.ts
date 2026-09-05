export const useCollection = () => {
    const host = import.meta.env.VITE_BACKEND_HOST;

    const getCollectionsFromGame = async (game_id: string) => {
        try {
            const response = await fetch (`${host}/collections/with-games`);
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao carregar coleções.", data.error);
                return null;
            }

            const collections = data.filter((collection: any) =>
                collection.games.some((game: any) => String(game.id) === String(game_id))
            );

            return collections;
        } catch (error) {
            console.error("Erro ao recuperar coleções do jogo.");
        }
    }

    const fetchCollections = async () => {
        try {
            const response = await fetch (`${host}/collections/with-games`);
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao carregar coleções.", data.error);
                return null;
            }

            return data;

        } catch (error) {
            console.error("Erro ao carregar coleções.", error);
        }
    }

    const deleteFromCollection = async (gameId: number, collectionId: number) => {
        try {
            const checkCollection = await fetch (`${host}/collection-games/game/${gameId}`);
            const collectionData = await checkCollection.json();
            
            if (Number(collectionData.collection_id) !== collectionId) {
                return {error: "Esse jogo não está nessa coleção."};
            }

            const response = await fetch (`${host}/collection-games/relation`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "collection_id": collectionId, "game_id": gameId })
            });
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao excluir jogo da coleção.", data.error);
                return null;
            }

            return data;
        } catch (error) {
            console.error("Erro ao excluir jogo a coleção.", error);
        }
    }

    const addToCollection = async (gameId: number, collectionId: number) => {
        try {
            const checkCollection = await fetch (`${host}/collection-games/game/${gameId}`);
            const collectionData = await checkCollection.json();
            
            if (Number(collectionData.collection_id) === collectionId) {
                return {error: "Esse jogo já está nessa coleção."};
            }

            const response = await fetch (`${host}/collection-games`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "collection_id": collectionId, "game_id": gameId })
            });
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao adicionar jogo a coleção.", data.error);
                return null;
            }

            return data;
        } catch (error) {
            console.error("Erro ao adicionar jogo a coleção.", error);
        }
    }

    const createCollection = async (title: string) => {
        try {
            const response = await fetch(`${host}/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title })
            });
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao criar coleção.", data.error);
                return null;
            }

            return data;
        } catch (error) {
            console.error("Erro ao criar coleção.", error);
        }
    }

    const deleteCollection = async (id: string) => {
        try {
            const response = await fetch (`${host}/collections/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao excluir coleção.", data.error);
                return null;
            }

            return data;
        } catch (error) {
            console.error("Erro ao excluir coleção.", error);
        }
    }

    const updateCollectionTitle = async (id: string, title: string) => {
        try {
            const response = await fetch (`${host}/collections/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title })
            });
            const data = await response.json();

            if (!response.ok) {
                console.error("Erro ao atualizar coleção.", data.error);
                return null;
            }

            return data;
        } catch (error) {
            console.error("Erro ao atualizar coleção.", error);
        }
    }

    return { 
        fetchCollections, 
        addToCollection, 
        createCollection, 
        deleteFromCollection, 
        deleteCollection, 
        updateCollectionTitle, 
        getCollectionsFromGame
    };
}