import React, { useEffect, useState } from "react";

interface JoystickSetupProps {
    command: (newCommand: string) => void;
}

const JoystickSetup: React.FC<JoystickSetupProps> = ({ command }) => {
    const [lastDir, setLastDir] = useState('');
    const [buttonPressed, setButtonPressed] = useState(false);
    const [backButtonPressed, setBackButtonPressed] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const controllerList = navigator.getGamepads();
            const controller = Array.from(controllerList).find((c): c is Gamepad => c !== null);
            if (!controller) return;

            const axisX = controller.axes[0];
            const axisY = controller.axes[1];

            let newCommand = 'centro';
            if (axisX > 0.4) newCommand = 'direita';
            else if (axisX < -0.4) newCommand = 'esquerda';
            else if (axisY > 0.4) newCommand = 'baixo';
            else if (axisY < -0.4) newCommand = 'cima';

            if (newCommand !== lastDir && newCommand !== 'centro') {
                command(newCommand);
                setLastDir(newCommand);
            } else if (newCommand === 'centro') {
                setLastDir('');
            }

            const confirmPressed = controller.buttons[0]?.pressed;
            if (confirmPressed && !buttonPressed) {
                command('confirmar');
            }
            setButtonPressed(!!confirmPressed);

            const backPressed = controller.buttons[1]?.pressed;
            if (backPressed && !backButtonPressed) {
                command('voltar');
            }
            setBackButtonPressed(!!backPressed);

        }, 100);

        return () => clearInterval(interval);
    }, [lastDir, buttonPressed, backButtonPressed]);

    return null;
};

export default JoystickSetup;