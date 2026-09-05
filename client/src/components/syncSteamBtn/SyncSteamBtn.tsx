import React from "react";
import { useDb } from "../../hooks/useDb";
import { useSync } from "../../contexts/SyncContext";
import sync from '../../assets/icons/sync.svg';
import './styles.css';

const SyncSteamBtn: React.FC = () => {
    const { syncSteam } = useDb();
    const { isSynchronizing, setIsSynchronizing } = useSync();

    const handleSyncSteam = async () => {
        if (!isSynchronizing) {
            setIsSynchronizing(true);
            const result = await syncSteam();
    
            if (result) {
                setIsSynchronizing(false);
                window.location.reload();
            }
        }
    }

    return (
        <div
            onClick={() => handleSyncSteam()} 
            className={isSynchronizing ? "sync-steam-btn-container-disabled" : "sync-steam-btn-container"}
        >
            <img 
                className={isSynchronizing ? "img-sync-steam-animation" : ""}
                src={sync}
                alt="sincronizar"
            />
            <div className="sync-steam-btn">
                {isSynchronizing ? "Sincronizando..." : "Sincronizar Steam"}
            </div>
        </div>
    )
}

export default SyncSteamBtn;