import React, { useEffect, useState } from "react";
import './styles.css';
import JoystickSetup from "../JoystickSetup/JoystickSetup";
import { useSound } from "../../hooks/useSound";
import caps from "../../assets/icons/caps.svg";
import space from "../../assets/icons/space.svg";
import backspace from "../../assets/icons/backspace.svg";

interface Keys {
    lowerCase: string,
    upperCase: string
}

const KEYS: Keys[] = [
    { lowerCase: '1', upperCase: '1' },
    { lowerCase: '2', upperCase: '2' },
    { lowerCase: '3', upperCase: '3' },
    { lowerCase: '4', upperCase: '4' },
    { lowerCase: '5', upperCase: '5' },
    { lowerCase: '6', upperCase: '6' },
    { lowerCase: '7', upperCase: '7' },
    { lowerCase: '8', upperCase: '8' },
    { lowerCase: '9', upperCase: '9' },
    { lowerCase: '0', upperCase: '0' },
    { lowerCase: '@', upperCase: '@' },

    { lowerCase: 'q', upperCase: 'Q' },
    { lowerCase: 'w', upperCase: 'W' },
    { lowerCase: 'e', upperCase: 'E' },
    { lowerCase: 'r', upperCase: 'R' },
    { lowerCase: 't', upperCase: 'T' },
    { lowerCase: 'y', upperCase: 'Y' },
    { lowerCase: 'u', upperCase: 'U' },
    { lowerCase: 'i', upperCase: 'I' },
    { lowerCase: 'o', upperCase: 'O' },
    { lowerCase: 'p', upperCase: 'P' },
    { lowerCase: '#', upperCase: '#' },

    { lowerCase: 'a', upperCase: 'A' },
    { lowerCase: 's', upperCase: 'S' },
    { lowerCase: 'd', upperCase: 'D' },
    { lowerCase: 'f', upperCase: 'F' },
    { lowerCase: 'g', upperCase: 'G' },
    { lowerCase: 'h', upperCase: 'H' },
    { lowerCase: 'j', upperCase: 'J' },
    { lowerCase: 'k', upperCase: 'K' },
    { lowerCase: 'l', upperCase: 'L' },
    { lowerCase: 'ç', upperCase: 'Ç' },
    { lowerCase: '/', upperCase: '/' },

    { lowerCase: 'z', upperCase: 'Z' },
    { lowerCase: 'x', upperCase: 'X' },
    { lowerCase: 'c', upperCase: 'C' },
    { lowerCase: 'v', upperCase: 'V' },
    { lowerCase: 'b', upperCase: 'B' },
    { lowerCase: 'n', upperCase: 'N' },
    { lowerCase: 'm', upperCase: 'M' },
    { lowerCase: '-', upperCase: '-' },
    { lowerCase: '_', upperCase: '_' },
    { lowerCase: '.', upperCase: '.' },
    { lowerCase: '?', upperCase: '?' },

    { lowerCase: '', upperCase: '' },
    { lowerCase: ' ', upperCase: ' ' },
    { lowerCase: 'backspace', upperCase: '' },
    { lowerCase: '', upperCase: '' }
];

interface KeyboardProps {
    onKeyPressed: (phrase: string) => void;
    onDone: (phrase: string) => void;
    onClose: () => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPressed, onDone, onClose }) => {
    const { playSelectSound, playConfirm2Sound, playBackSound } = useSound();
    const [selectedKey, setSelectedKey] = useState(0);
    const [isCapslockOn, setIsCapslockOn] = useState(false);
    const [phrase, setPhrase] = useState('');
    const [commandCoolDown, setCommandCoolDown] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setCommandCoolDown(false);
        }, 50);
    }, []);

    const joystickNavigation = (command: string) => {
        const startRow = [0, 11, 22, 33];
        const finalRow = [10, 21, 32, 43];

        if (command === 'esquerda') {
            playSelectSound();
            if (startRow.includes(selectedKey)){
                setSelectedKey(selectedKey + 10);
            } else {
                setSelectedKey(selectedKey - 1);
            }
        } else if (command === 'direita') {
            if (selectedKey === 47) return;
            playSelectSound();
            if (finalRow.includes(selectedKey)){
                setSelectedKey(selectedKey - 10);
            } else {
                setSelectedKey(selectedKey + 1);
            }
        } else if (command === 'cima') {
            if (selectedKey < 11) return;

            playSelectSound();
            if (selectedKey === 44) {
                setSelectedKey(34);
            } else if (selectedKey === 45) {
                setSelectedKey(37);
            } else if (selectedKey === 46) {
                setSelectedKey(40);
            } else if (selectedKey === 47) {
                setSelectedKey(42);
            } else {
                setSelectedKey(selectedKey - 11);
            }
        } else if (command === 'baixo') {
            if (selectedKey > 43 ) return;

            playSelectSound();
            if ([33, 34].includes(selectedKey)) {
                setSelectedKey(44);
            } else if ([35, 36, 37, 38, 39].includes(selectedKey)) {
                setSelectedKey(45);
            } else if ([40, 41].includes(selectedKey)) {
                setSelectedKey(46);
            } else if ([42, 43].includes(selectedKey)) {
                setSelectedKey(47);
            } else {
                setSelectedKey(selectedKey + 11);
            }
        } else if (command === 'A') {
            if (commandCoolDown) return;
            if (selectedKey === 44) {
                playConfirm2Sound();
                setIsCapslockOn(!isCapslockOn);
            } else if (selectedKey === 46) {
                playConfirm2Sound();
                setPhrase(phrase.slice(0, -1));
                onKeyPressed(phrase.slice(0, -1));
            } else if (selectedKey === 47) {
                onDone(phrase);
            } else {
                playConfirm2Sound();
                if (isCapslockOn) {
                    setPhrase(phrase + KEYS[selectedKey].upperCase);
                    onKeyPressed(phrase + KEYS[selectedKey].upperCase);
                } else {
                    setPhrase(phrase + KEYS[selectedKey].lowerCase);
                    onKeyPressed(phrase + KEYS[selectedKey].lowerCase);
                }
            }
        } else if (command === 'X') {
            if (phrase.length > 0) {
                playBackSound();
                setPhrase(phrase.slice(0, -1));
                onKeyPressed(phrase.slice(0, -1));
            }
        } else if (command === 'Y') {
            playConfirm2Sound();
            setPhrase(phrase + ' ');
            onKeyPressed(phrase + ' ');
        } else if (command === 'B') {
            setPhrase('');
            onKeyPressed('');
            onClose();
        } else if (command === 'RT') {
            onDone(phrase);
        } else if (command === 'LT') {
            playConfirm2Sound();
            setIsCapslockOn(!isCapslockOn);
        }
    };

    return (
        <>
            <JoystickSetup command={joystickNavigation} />
            <div className="keyboard">
                {KEYS.slice(0, 44).map(({ lowerCase, upperCase }, index) => (
                    <div className={selectedKey === index ? 'key-selected key' : 'key'} key={lowerCase}>
                        {isCapslockOn ? upperCase : lowerCase}
                    </div>
                ))}

                <div 
                    className={selectedKey === 44 || isCapslockOn ? 'key-selected special-key caps-key' : 'special-key caps-key'} 
                    style={{gridArea: 'caps'}}
                >
                    <img src={caps} />
                </div>
                <div 
                    className={selectedKey === 45 ? 'key-selected special-key space-key' : 'special-key space-key'} 
                    style={{gridArea: 'space'}}
                >
                    <img src={space} />
                </div>
                <div 
                    className={selectedKey === 46 ? 'key-selected special-key backspace-key' : 'special-key backspace-key'} 
                    style={{gridArea: 'backspace'}}
                >
                    <img src={backspace} />
                </div>
                <div 
                    className={selectedKey === 47 ? 'key-selected special-key done-key' : 'special-key done-key'} 
                    style={{gridArea: 'done'}}
                >Pronto</div>
            </div>
        </>
    )
}

export default Keyboard;