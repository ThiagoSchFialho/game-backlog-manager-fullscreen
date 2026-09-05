import React, { useEffect, useState } from 'react';
import './styles.css';
import Header from '../../components/Header/Header';
import SideMenu from '../../components/SideMenu/SideMenu';
import CollectionFolder from '../../components/CollectionFolder/CollectionFolder';
import type { ICollection } from '../../types/collectionsType';
import { useCollection } from '../../hooks/useCollection';
import closeIcon from '../../assets/icons/close.svg';

const Collections: React.FC = () => {
    const { fetchCollections, createCollection } = useCollection();
    const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
    const [steamApiConnected, setSteamApiConnected] = useState(false);
    const [currentPage] = useState('collections');
    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);
    const [collectionTitle, setCollectionTitle] = useState<string | undefined>('');

    useEffect(() => {
        const getCollections = async () => {
            const collections = await fetchCollections();
            if (collections) {
                setCollectionsList(collections);
                setSteamApiConnected(true);
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
            <Header steamApiConnected={steamApiConnected} />
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
            <div className="main-container">
                <SideMenu currentPage={currentPage} />
                
                <div className="collections-main-content">
                    <div className="page-header">
                        <h1 className="title">Coleções</h1>
                        <div className="create-collection-btn-container">
                            <div
                                onClick={() => setIsCollectionFormOpen(true)}
                                className="create-collection-btn"
                            >
                                    Criar Coleção
                            </div>
                        </div>
                    </div>

                    <div className="collection-folders-container">
                        {collectionsList.map(collection => (
                            <CollectionFolder
                                collection={collection}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </>
    )
}

export default Collections;