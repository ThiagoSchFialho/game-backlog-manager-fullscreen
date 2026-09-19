import React, { useEffect, useRef, useState } from 'react';
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
    const readyRef = useRef(false);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

    useEffect(() => {
        setSelected(currentPage);
    }, []);

    useEffect(() => {
        readyRef.current = false;
        const timeout = setTimeout(() => {
            readyRef.current = true;
        }, 100);

        return () => clearTimeout(timeout);
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
            url: '/backlog',
            name: 'backlog',
            icon: list,
            iconSelected: listSelected,
            label: 'Backlog',
            alt: 'lista'
        },
        {
            url: '/completed',
            name: 'completed',
            icon: check,
            iconSelected: checkSelected,
            label: 'Zerados',
            alt: 'verificado'
        },
    ];

    const joystickNavigation = (command: string) => {
        if (command === 'START') {
            setIsHeaderMenuOpen(!isHeaderMenuOpen);
        }

        if (isHeaderMenuOpen) {
            if (command === 'B' || command === 'A') {
                setIsHeaderMenuOpen(false);
            }
        }
        if (!isHeaderMenuOpen) {
            if (!readyRef.current) return;
            const currentPageIndex = sideMenuItems.findIndex(item => item.name === currentPage);
        
            if (command === 'dpad_cima' && currentPageIndex !== 0) {
                navigation(sideMenuItems[currentPageIndex - 1].url);
            }
            if (command === 'dpad_baixo' && currentPageIndex !== sideMenuItems.length - 1) {
                navigation(sideMenuItems[currentPageIndex + 1].url);
            }
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