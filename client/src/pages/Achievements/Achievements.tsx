import React, { useEffect, useState } from "react";
import { useDb } from "../../hooks/useDb";
import type { Achievement } from '../../types/achievementType';

const Achievements: React.FC = () => {
    const { getAchievements } = useDb();
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    const loadAchievements = async () => {
        const data = await getAllAchievements();
        if (data) {
            setAchievements(data);
        }
    }

    useEffect(() => {
        loadAchievements();
    }, []);
        
    return (
        <div className="main-content">
            <p>Conquistas</p>
        </div>
    )
}

export default Achievements;