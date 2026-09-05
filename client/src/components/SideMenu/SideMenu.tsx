import React, { useEffect, useState } from 'react';
import './styles.css';
import home from '../../assets/icons/home.svg';
import gamepad from '../../assets/icons/gamepad.svg';
// import heart from '../../assets/icons/heart.svg';
import check from '../../assets/icons/check.svg';
import list from '../../assets/icons/list.svg';
import folder from '../../assets/icons/folder.svg';
import settings from '../../assets/icons/settings.svg';
import homeSelected from '../../assets/icons/home-selected.svg';
import gamepadSelected from '../../assets/icons/gamepad-selected.svg';
// import heartSelected from '../../assets/icons/heart-selected.svg';
import checkSelected from '../../assets/icons/check-selected.svg';
import listSelected from '../../assets/icons/list-selected.svg';
import folderSelected from '../../assets/icons/folder-selected.svg';
import { useNavigate } from 'react-router-dom';
import type { ICollection } from '../../types/collectionsType';
import { useCollection } from '../../hooks/useCollection';

interface SideMenuProps {
    currentPage: string;
}

const SideMenu: React.FC<SideMenuProps> = ({currentPage}) => {
    const { fetchCollections } = useCollection();
    const navigation = useNavigate();
    const [selected, setSelected] = useState('');
    const [collectionsList, setCollectionsList] = useState<ICollection[]>([]);

    useEffect(() => {
        setSelected(currentPage);

        const getCollections = async () => {
            const collections = await fetchCollections();
            if (collections) {
                setCollectionsList(collections);
            }
        }
        
        getCollections();
    }, [])

    return (
        <>
            <div className="side-menu-container">
                <div className="pages-section">
                    <ul className="side-menu-list">
                        <li onClick={() => navigation('/')} className={selected === 'home' ? 'selected' : ''}>
                            <img src={selected == 'home' ? homeSelected : home} alt="casa" />
                            <p>Inicio</p>
                        </li>
                        <li onClick={() => navigation('/allGames')} className={selected === 'allGames' ? 'selected' : ''}>
                            <img src={selected == 'allGames' ? gamepadSelected : gamepad} alt="joystick" />
                            <p>Todos os Jogos</p>
                        </li>
                        {/* <li onClick={() => navigation('/favorites')} className={selected === 'favorites' ? 'selected' : ''}>
                            <img src={selected == 'favorites' ? heartSelected : heart} alt="coração" />
                            <p>Favoritos</p>
                        </li> */}
                        <li onClick={() => navigation('/completed')} className={selected === 'completed' ? 'selected' : ''}>
                            <img src={selected == 'completed' ? checkSelected : check} alt="verificado" />
                            <p>Zerados</p>
                        </li>
                        <li onClick={() => navigation('/backlog')} className={selected === 'backlog' ? 'selected' : ''}>
                            <img src={selected == 'backlog' ? listSelected : list} alt="lista" />
                            <p>Backlog</p>
                        </li>
                    </ul>
                </div>

                <hr/>

                <div className="collection-section">
                    <h1 onClick={() => navigation('/collections')} className={selected === 'collections' ? 'selected' : ''}>Coleções</h1>
                    <ul className="side-menu-list collection-list">
                        {collectionsList.slice(0, 4).map(collection => {
                            const path = `/collection/${collection.id}`;
                            const isSelected = location.pathname === path;

                            return (
                                <li
                                    key={collection.id}
                                    onClick={() => navigation(path)}
                                    className={isSelected ? 'selected' : ''}
                                >
                                    <img src={isSelected ? folderSelected : folder} alt="pasta" />
                                    <p>{collection.title}</p>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <hr/>

                <div className="footer-section">
                    <ul className="side-menu-list">
                        <li onClick={() => navigation('/settings')} className={selected === 'settings' ? 'selected' : ''}>
                            <img src={settings} alt="configurações" />
                            <p>Configurações</p>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default SideMenu;