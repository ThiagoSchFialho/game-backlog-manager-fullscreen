import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SyncContextType {
    isSynchronizing: boolean;
    setIsSynchronizing: (value: boolean) => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSynchronizing, setIsSynchronizing] = useState(false);

    return (
        <SyncContext.Provider value={{ isSynchronizing, setIsSynchronizing }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error("useSync deve ser usado dentro de um SyncProvider");
    }
    return context;
};