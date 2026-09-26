import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './styles.css';
import GameList from '../../components/GameList/GameList';
import { useCollection } from '../../hooks/useCollection';
import type { ICollection } from '../../types/collectionsType';


const Collection: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getCollectionWithGames } = useCollection();
    const [collection, setCollection] = useState<ICollection>();
    const navigation = useNavigate();

    const getCollection = async () => {
        if (!id) return;
        const collection = await getCollectionWithGames(id);
        if (collection) {
            setCollection(collection);
        }
    }
    useEffect(() => {
        getCollection();
    }, []);

    return (
        <>
            <GameList list={collection?.games ?? []} onReloadList={getCollection} title={collection?.title}  onBack={() => navigation(-1)}/>
        </>
    )
}
export default Collection;