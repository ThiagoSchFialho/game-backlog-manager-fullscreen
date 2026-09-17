import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

import SideMenu from '../../components/SideMenu/SideMenu';
import CollectionFolder from '../../components/CollectionFolder/CollectionFolder';
import JoystickSetup from '../../components/JoystickSetup/JoystickSetup';

import { useCollection } from '../../hooks/useCollection';
import closeIcon from '../../assets/icons/close.svg';
import plus from '../../assets/icons/plus.svg';
import type { ICollection } from '../../types/collectionsType';

const BUTTON_INDEX = 0;

const Collections: React.FC = () => {
    const navigation = useNavigate();
    const { fetchCollections, createCollection } = useCollection();
    const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
    const [currentPage] = useState('collections');
    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);
    const [collectionTitle, setCollectionTitle] = useState<string | undefined>('');
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [commandCoolDown, setCommandCoolDown] = useState(false);

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

    const handleCloseForm = () => {
        setCommandCoolDown(true);
        setIsCollectionFormOpen(false);
        setTimeout(() => {
            setCommandCoolDown(false);
        }, 50);
    }

    // --- Refs para evitar stale closure no joystickNavigation -------------
    const selectedIndexRef = useRef(selectedIndex);
    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    const itemsLengthRef = useRef(collectionsList.length);
    useEffect(() => {
        itemsLengthRef.current = collectionsList.length;
    }, [collectionsList.length]);
    // ------------------------------------------------------------------

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    // --- Scroll setup -----------------------------------------------------
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    const getColumnsCount = () => {
        const refs = cardRefs.current;
        if (!refs[0]) return 1;
        const firstTop = refs[0]!.offsetTop;
        let count = 0;
        for (const el of refs) {
            if (!el || el.offsetTop !== firstTop) break;
            count++;
        }
        return count || 1;
    };

    const getRowHeight = (columns: number) => {
        const refs = cardRefs.current;
        if (!refs[0] || !refs[columns]) return 0;
        return refs[columns]!.offsetTop - refs[0]!.offsetTop;
    };

    const joystickNavigation = (command: string) => {
        const currentIndex = selectedIndexRef.current;
        const length = itemsLengthRef.current;
        const rowStart = 1;
        const rowEnd = length;
        const onButton = currentIndex === BUTTON_INDEX;
        const columns = getColumnsCount();

        if (onButton) {
            if (command === 'baixo' && length > 0) {
                setSelectedIndex(rowStart);
            } else if (command === 'A') {
                if (commandCoolDown) return;
                setIsCollectionFormOpen(true);
            }
            return;
        }

        if (command === 'esquerda') {
            setSelectedIndex(prev => clamp(prev - 1, rowStart, rowEnd));
        } else if (command === 'direita') {
            setSelectedIndex(prev => clamp(prev + 1, rowStart, rowEnd));
        } else if (command === 'cima') {
            if (currentIndex - rowStart < columns) {
                setSelectedIndex(BUTTON_INDEX);
            } else {
                setSelectedIndex(prev => clamp(prev - columns, rowStart, rowEnd));
            }
        } else if (command === 'baixo') {
            setSelectedIndex(prev => clamp(prev + columns, rowStart, rowEnd));
        } else if (command === 'A') {
            if (commandCoolDown) return;
            const collection = collectionsList[currentIndex - rowStart];
            if (collection) {
                navigation(`/collection/${collection.id}`);
            }
        } else if (command === 'Y') {
            if (commandCoolDown) return;
            setIsCollectionFormOpen(true);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || cardRefs.current.length === 0) return;

        if (selectedIndex === BUTTON_INDEX) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const columns = getColumnsCount();
        const row = Math.floor((selectedIndex - 1) / columns);
        const rowHeight = getRowHeight(columns);

        if (!rowHeight) return;

        const targetScrollTop = row < 2 ? 0 : (row - 1) * rowHeight;

        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }, [selectedIndex, collectionsList.length]);
    // --- End scroll setup -------------------------------------------------

    return (
        <>
            {!isCollectionFormOpen && <JoystickSetup command={joystickNavigation} />}
            <SideMenu currentPage={currentPage} />
            <div className="main-content">
                <div className="create-collection-container">
                    <div
                        onClick={() => setIsCollectionFormOpen(true)}
                        className={selectedIndex === BUTTON_INDEX ? 'focused create-collection-container-btn' : 'create-collection-container-btn'}
                    >
                        <img src={plus} />
                        <p>Criar coleção</p>
                    </div>
                </div>
                <div className="collection-folders-container" ref={scrollContainerRef}>
                    {collectionsList.map((collection, index) => (
                        <div key={collection.id} ref={(el) => { cardRefs.current[index] = el; }}>
                            <CollectionFolder
                                collection={collection}
                                isFocused={selectedIndex === index + 1}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {isCollectionFormOpen && (
                <div className="collection-title-form-container">
                    <img onClick={handleCloseForm} src={closeIcon} />
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