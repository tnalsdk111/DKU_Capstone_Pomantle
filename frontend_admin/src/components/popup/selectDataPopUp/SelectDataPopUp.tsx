import React, { useState, useEffect } from 'react';
import { PopUp } from '../../../models/PopUp';
import { Data } from '../../../models/Data';
import { PopUpManager } from '../../../managers/PopUpManager';
import { DBManager } from '../../../managers/DBManager';
import { PopUpType } from '../../../models/PopUpType';
import DataView from '../../dataView/DataView';
import './SelectDataPopUp.css';
import { PoseData } from '../../../models/ApiTypes';

interface SelectDataPopUp extends PopUp {
    showData(payload: { date: string }): void;
}

export const SelectDataPopUp = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [allData, setAllData] = useState<PoseData[]>([]);
    const [targetDate, setTargetDate] = useState<string>("");

    const handleSelect = async (selectedItem: PoseData) => {
        if (!targetDate) return;

        try{
            const existData = await DBManager.getInstance().getDataByDate(targetDate);
            console.log(existData);
            if(existData) await DBManager.getInstance().unassignPose(existData.usedAt);

            await DBManager.getInstance().assignPose(targetDate, selectedItem?.id);

            const freshAllData = await DBManager.getInstance().getAllData();
            setAllData(freshAllData);
            
            initPopUp.close();
        } catch(error){
            console.log("팝업 데이터 배정 중 오류 발생: ", error);
        }
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