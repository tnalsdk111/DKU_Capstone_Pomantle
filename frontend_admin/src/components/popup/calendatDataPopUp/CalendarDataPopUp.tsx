import React, { useState, useEffect } from 'react'
import { PopUp } from "../../../models/PopUp";
import { Data } from '../../../models/Data';
import { PopUpManager } from '../../../managers/PopUpManager';
import { DBManager } from '../../../managers/DBManager';
import CustomButton from '../../button/CustomButton';
import './CalendarDataPopUp.css'
import { PopUpType } from '../../../models/PopUpType';
import DataView from '../../dataView/DataView';
import { PoseListItem } from '../../../models/ApiTypes';

interface CalendarDataPopUp extends PopUp{
    showData(date:string): void;
}

export const CalendarDataPopUp = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [data, setData] = useState<PoseListItem | null>();
    const [selectedDate, setSelectedDate] = useState<string>("");

    const CreateData = () => {
        if(data != null){
            PopUpManager.getInstance().openPopUp(PopUpType.CREATEDATA, data);
        }
        else{
            const payload = {
                today: selectedDate
            }
            PopUpManager.getInstance().openPopUp(PopUpType.CREATEDATA, payload);
        }
    }

    const SelectData = () => {
        PopUpManager.getInstance().openPopUp(PopUpType.SELECTDATA, { date: selectedDate });
    }

    const CancelData = () => {
        if(!data) return;
        const dataSave:PoseListItem = {
            ...data,
            usedAt: "",
        }
        DBManager.getInstance().updateData(dataSave);
    }

    const initPopUp: CalendarDataPopUp = {
        currentPopUpType: PopUpType.CALENDARDATA,
        init: () => {},
        open: () => setIsVisible(true),
        close: () => setIsVisible(false),

        showData: (data:any) => {
            setSelectedDate(data.date);
            const freshData = DBManager.getInstance().getDataByDate(data.date);
            setData(freshData);
            setIsVisible(true);
        }
    };

    useEffect(() => {
        const updateCurrentData = () => {
            if (selectedDate) {
                const freshData = DBManager.getInstance().getDataByDate(selectedDate);
                setData(freshData);
            }
        };

        const db = DBManager.getInstance();
        db.subscribe(updateCurrentData);

        return () => db.unsubscribe(updateCurrentData);
    }, [selectedDate]);

    useEffect(() => {
        PopUpManager.getInstance().pushPopUp(initPopUp);
    }, []);

    if (!isVisible) return null;

    return (
        <div className='modal-overlay' onClick={initPopUp.close}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h2>{data? `${selectedDate} 데이터` : `${selectedDate} 데이터 없음`}</h2>
                    <button className="close-btn" onClick={initPopUp.close}>&times;</button>
                </div>
                <div className='modal-body'>
                    {data ? ( 
                        <div className='modal-footer'> 
                            <DataView data={data} /> 
                            <CustomButton label="데이터 할당" variant="primary" size="large" onClick={SelectData}/>
                            <CustomButton label="데이터 취소" variant="primary" size="large" onClick={CancelData}/>
                        </div>) 
                        : 
                        (<p>지정된 데이터가 없습니다.</p>)
                    }
                </div>
                
                {!data && (
                    <div className='modal-footer'>
                        <CustomButton label='데이터 생성' variant='primary' size='large' onClick={CreateData}/>
                        
                        <CustomButton label='데이터 할당' variant='primary' size='large' onClick={SelectData}/>
                    </div>)
                }
            </div>
        </div>
    )
}