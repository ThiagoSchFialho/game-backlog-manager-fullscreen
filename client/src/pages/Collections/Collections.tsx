import React, { useEffect, useState } from 'react';
import './styles.css';
import SideMenu from '../../components/SideMenu/SideMenu';
import CollectionFolder from '../../components/CollectionFolder/CollectionFolder';
import type { ICollection } from '../../types/collectionsType';
import { useCollection } from '../../hooks/useCollection';
import closeIcon from '../../assets/icons/close.svg';

const Collections: React.FC = () => {
    const { fetchCollections, createCollection } = useCollection();
    const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
    const [currentPage] = useState('collections');
    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);
    const [collectionTitle, setCollectionTitle] = useState<string | undefined>('');

    useEffect(() => {
        const getCollections = async () => {
            const collections = await fetchCollections();
            if (collections) {
                setCollectionsList(collections);
            }
        }
        
        getCollections();
    }, []);

    const handleCreateCollection = async () => {
        if (collectionTitle) {
            const result = await createCollection(collectionTitle);
            if (!result) {
                return;
            }
            window.location.reload();
        }
    }

    return (
        <>
            <SideMenu currentPage={currentPage} />
            <div className="main-content">
                <div className="create-collection-container">
                    <div
                        onClick={() => setIsCollectionFormOpen(true)}
                        className="create-collection-container-btn"
                    >
                        <p>Criar coleção</p>
                    </div>
                </div>
                <div className="collection-folders-container">
                    {collectionsList.map(collection => (
                        <CollectionFolder collection={collection} />
                    ))}
                </div>

            </div>



            {isCollectionFormOpen && (
                <div className="collection-title-form-container">
                    <img onClick={() => setIsCollectionFormOpen(false)} src={closeIcon}/>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <label htmlFor="collection-title">Nome da Coleção</label>
                        <input
                            type="text"
                            name="collection-title"
                            id="collection-title"
                            required
                            value={collectionTitle}
                            onChange={(e) => setCollectionTitle(e.target.value)}
                        />
                        <div onClick={() => handleCreateCollection()}>Criar Coleção</div>
                    </form>
                </div>
            )}
        </>
    )
}

export default Collections;