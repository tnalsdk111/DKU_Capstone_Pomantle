// hooks/useAllData.ts
import { useState, useEffect } from 'react';
import { DBManager } from '../../managers/DBManager';

export const useAllData = () => {
    const [data, setData] = useState(DBManager.getInstance().getAllData());

    useEffect(() => {
        const handleUpdate = () => {
            setData(DBManager.getInstance().getAllData());
        };

        const db = DBManager.getInstance();
        db.subscribe(handleUpdate);
        
        return () => db.unsubscribe(handleUpdate);
    }, []);

    return data;
};