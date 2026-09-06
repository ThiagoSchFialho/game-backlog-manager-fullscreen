import React, { useEffect, useState } from 'react';
import './styles.css';
import home from '../../assets/icons/home.svg';
import gamepad from '../../assets/icons/gamepad.svg';
import check from '../../assets/icons/check.svg';
import list from '../../assets/icons/list.svg';
import folder from '../../assets/icons/folder.svg';
import homeSelected from '../../assets/icons/home-selected.svg';
import gamepadSelected from '../../assets/icons/gamepad-selected.svg';
import checkSelected from '../../assets/icons/check-selected.svg';
import listSelected from '../../assets/icons/list-selected.svg';
import folderSelected from '../../assets/icons/folder-selected.svg';
import { useNavigate } from 'react-router-dom';

interface SideMenuProps {
    currentPage: string;
}

const SideMenu: React.FC<SideMenuProps> = ({currentPage}) => {
    const navigation = useNavigate();
    const [selected, setSelected] = useState('');

    useEffect(() => {
        setSelected(currentPage);
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
                            <p>Biblioteca</p>
                        </li>
                        <li onClick={() => navigation('/collections')} className={selected === 'collections' ? 'selected' : ''}>
                            <img src={selected == 'collections' ? folderSelected : folder} alt="pasta" />
                            <p>Coleções</p>
                        </li>
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
            </div>
        </>
    )
}

export default SideMenu;