import React, { useState, useEffect } from 'react';
import { PopUp } from '../../../models/PopUp';
import { Data } from '../../../models/Data';
import { PopUpManager } from '../../../managers/PopUpManager';
import { DBManager } from '../../../managers/DBManager';
import { PopUpType } from '../../../models/PopUpType';
import DataView from '../../dataView/DataView';
import './SelectDataPopUp.css';
import { CreatePoseRequest, PoseListItem } from '../../../models/ApiTypes';

interface SelectDataPopUp extends PopUp {
    showData(payload: { date: string }): void;
}

export const SelectDataPopUp = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [allData, setAllData] = useState<PoseListItem[]>([]);
    const [targetDate, setTargetDate] = useState<string>("");

    const handleSelect = (selectedItem: PoseListItem) => {
        if (!targetDate) return;
        const existData = DBManager.getInstance().getDataByDate(targetDate);
        if(existData && existData.id !== selectedItem.id){
            const newData:CreatePoseRequest = {
                ...existData,
                target_vector: [],
            };
            DBManager.getInstance().updateData(newData);
        }

        const updatedData: CreatePoseRequest = {
            ...selectedItem,
            target_vector: [],
        };
        console.log(updatedData);

        DBManager.getInstance().updateData(updatedData);
        
        initPopUp.close();
    };

    const initPopUp: SelectDataPopUp = {
        currentPopUpType: PopUpType.SELECTDATA,
        init: () => {},
        open: () => setIsVisible(true),
        close: () => setIsVisible(false),
        showData: (payload: any) => {
            setTargetDate(payload.date);
            const all = DBManager.getInstance().getAllData(); 
            setAllData(all);
            setIsVisible(true);
        }
    };

    useEffect(() => {
        PopUpManager.getInstance().pushPopUp(initPopUp);
    }, []);

    if (!isVisible) return null;

    return (
        <div className='modal-overlay' onClick={initPopUp.close}>
            <div className='modal-content select-data-modal' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h2>{targetDate}에 할당할 데이터 선택</h2>
                    <button className="close-btn" onClick={initPopUp.close}>&times;</button>
                </div>
                
                <div className='modal-body grid-scroll-container'>
                    {allData.length > 0 ? (
                        <div className="data-grid">
                            {allData.map((item) => (
                                <DataView 
                                    key={item.id} 
                                    data={item} 
                                    isSelectMode={true} 
                                    onSelect={handleSelect} 
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="no-data-text">선택할 수 있는 데이터가 없습니다. 먼저 데이터를 생성해주세요.</p>
                    )}
                </div>
            </div>
        </div>
    );
};