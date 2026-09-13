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
import JoystickSetup from '../JoystickSetup/JoystickSetup';

interface SideMenuProps {
    currentPage: string;
}

interface SideMenuItems {
    url: string;
    name: string;
    icon: string;
    iconSelected: string;
    label: string;
    alt: string;
}

const SideMenu: React.FC<SideMenuProps> = ({currentPage}) => {
    const navigation = useNavigate();
    const [selected, setSelected] = useState('');

    useEffect(() => {
        setSelected(currentPage);
    }, []);

    const sideMenuItems: SideMenuItems[] = [
        {
            url: '/',
            name: 'home',
            icon: home,
            iconSelected: homeSelected,
            label: 'Inicio',
            alt: 'casa'
        },
        {
            url: '/library',
            name: 'library',
            icon: gamepad,
            iconSelected: gamepadSelected,
            label: 'Biblioteca',
            alt: 'joystick'
        },
        {
            url: '/collections',
            name: 'collections',
            icon: folder,
            iconSelected: folderSelected,
            label: 'Coleções',
            alt: 'pasta'
        },
        {
            url: '/completed',
            name: 'completed',
            icon: check,
            iconSelected: checkSelected,
            label: 'Zerados',
            alt: 'verificado'
        },
        {
            url: '/backlog',
            name: 'backlog',
            icon: list,
            iconSelected: listSelected,
            label: 'Backlog',
            alt: 'lista'
        }
    ];

    const joystickNavigation = (command: string) => {
        const currentPageIndex = sideMenuItems.findIndex(item => item.name === currentPage);

        if (command === 'dpad_cima' && currentPageIndex !== 0) {
            navigation(sideMenuItems[currentPageIndex - 1].url);
        }
        if (command === 'dpad_baixo' && currentPageIndex !== sideMenuItems.length - 1) {
            navigation(sideMenuItems[currentPageIndex + 1].url);
        }
    };

    return (
        <>
            <JoystickSetup command={joystickNavigation} />
            <div className="side-menu-container">
                <div className="pages-section">
                    <ul className="side-menu-list">
                        {sideMenuItems.map(item => (
                            <li key={item.name} onClick={() => navigation(item.url)} className={selected === item.name ? 'selected' : ''}>
                                <img src={selected == item.name ? item.iconSelected : item.icon} alt={item.alt} />
                                <p>{item.label}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default SideMenu;