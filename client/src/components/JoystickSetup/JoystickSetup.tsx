import React, { useEffect, useRef, useState } from "react";

interface JoystickSetupProps {
    command: (newCommand: string) => void;
}

const HOLD_THRESHOLD_MS = 400;
const REPEAT_INTERVAL_MS = 200;

const JoystickSetup: React.FC<JoystickSetupProps> = ({ command }) => {
    const [lastDir, setLastDir] = useState('');

    const [aBtnPressed, setABtnPressed] = useState(false);
    const [bBtnPressed, setBBtnPressed] = useState(false);
    const [yBtnPressed, setYBtnPressed] = useState(false);
    const [xBtnPressed, setXBtnPressed] = useState(false);

    const [lbBtnPressed, setLbBtnPressed] = useState(false);
    const [rbBtnPressed, setRbBtnPressed] = useState(false);

    const [dpadUpPressed, setDpadUpPressed] = useState(false);
    const [dpadDownPressed, setDpadDownPressed] = useState(false);
    const [dpadLeftPressed, setDpadLeftPressed] = useState(false);
    const [dpadRightPressed, setDpadRightPressed] = useState(false);

    const holdStartRef = useRef<number | null>(null);
    const lastRepeatRef = useRef<number>(0);

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

            const now = Date.now();

            if (newCommand !== 'centro') {
                if (newCommand !== lastDir) {
                    command(newCommand);
                    setLastDir(newCommand);
                    holdStartRef.current = now;
                    lastRepeatRef.current = now;
                } else if (holdStartRef.current !== null) {
                    const heldFor = now - holdStartRef.current;
                    if (heldFor >= HOLD_THRESHOLD_MS) {
                        const sinceLastRepeat = now - lastRepeatRef.current;
                        if (sinceLastRepeat >= REPEAT_INTERVAL_MS) {
                            command(newCommand);
                            lastRepeatRef.current = now;
                        }
                    }
                }
            } else {
                setLastDir('');
                holdStartRef.current = null;
                lastRepeatRef.current = 0;
            }
            // --------------------------------------------------------------------

            // A
            const confirmPressed = controller.buttons[0]?.pressed;
            if (confirmPressed && !aBtnPressed) {
                command('A');
            }
            setABtnPressed(!!confirmPressed);

            // B
            const bPressed = controller.buttons[1]?.pressed;
            if (bPressed && !bBtnPressed) {
                command('B');
            }
            setBBtnPressed(!!bPressed);

            // X
            const xPressed = controller.buttons[2]?.pressed;
            if (xPressed && !xBtnPressed) {
                command('X');
            }
            setXBtnPressed(!!xPressed);

            // Y
            const yPressed = controller.buttons[3]?.pressed;
            if (yPressed && !yBtnPressed) {
                command('Y');
            }
            setYBtnPressed(!!yPressed);

            // LB
            const lbPressed = controller.buttons[4]?.pressed;
            if (lbPressed && !lbBtnPressed) {
                command('LB');
            }
            setLbBtnPressed(!!lbPressed);

            // RB
            const rbPressed = controller.buttons[5]?.pressed;
            if (rbPressed && !rbBtnPressed) {
                command('RB');
            }
            setRbBtnPressed(!!rbPressed);

            // d-pad: cima
            const dpadUp = controller.buttons[12]?.pressed;
            if (dpadUp && !dpadUpPressed) {
                command('dpad_cima');
            }
            setDpadUpPressed(!!dpadUp);

            // d-pad: baixo
            const dpadDown = controller.buttons[13]?.pressed;
            if (dpadDown && !dpadDownPressed) {
                command('dpad_baixo');
            }
            setDpadDownPressed(!!dpadDown);

            // d-pad: esquerda
            const dpadLeft = controller.buttons[14]?.pressed;
            if (dpadLeft && !dpadLeftPressed) {
                command('dpad_esquerda');
            }
            setDpadLeftPressed(!!dpadLeft);

            // d-pad: direita
            const dpadRight = controller.buttons[15]?.pressed;
            if (dpadRight && !dpadRightPressed) {
                command('dpad_direita');
            }
            setDpadRightPressed(!!dpadRight);

        }, 50);

        return () => clearInterval(interval);
    }, [
        lastDir, aBtnPressed, bBtnPressed, yBtnPressed, xBtnPressed, lbBtnPressed, rbBtnPressed,
        dpadUpPressed, dpadDownPressed, dpadLeftPressed, dpadRightPressed,
    ]);

    return null;
};

export default JoystickSetup;