import React, { useState, useEffect } from 'react';
import { PopUp } from '../../../models/PopUp';
import { PopUpType } from '../../../models/PopUpType';
import { GameRecord } from '../../../models/GameRecord';
import { PopUpManager } from '../../../managers/PopUpManager';

interface IResultPopUp extends PopUp{
    showRecords(record: GameRecord): void;
}

export const ResultPopUp = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [record, setRecord] = useState<GameRecord | null>(null);

    const initPopUp: IResultPopUp = {
        currentPopUpType: PopUpType.RESULT,
        init: () => {},
        open: () => setIsVisible(true),
        close: () => setIsVisible(false),

        showRecords: (data: GameRecord) => {
            setRecord(data);
            setIsVisible(true);
        }
    }

    useEffect(() => {
        PopUpManager.getInstance().pushPopUp(initPopUp);
    }, []);

    if (!isVisible) return null;

    return (
        <div>
            <h1>plus</h1>
        </div>
    )
}