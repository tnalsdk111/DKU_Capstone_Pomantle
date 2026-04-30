import React, { useState, useEffect } from 'react'
import { PopUp } from "../../../models/PopUp";
import { Data } from '../../../models/Data';
import { PopUpManager } from '../../../managers/PopUpManager';
import { DBManager } from '../../../managers/DBManager';
import CustomButton from '../../button/CustomButton';
import './CalendarDataPopUp.css'
import { PopUpType } from '../../../models/PopUpType';
import DataView from '../../dataView/DataView';

interface CalendarDataPopUp extends PopUp{
    showData(date:string): void;
}

export const CalendarDataPopUp = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [data, setData] = useState<Data | null>();
    const [selectedDate, setSelectedDate] = useState<string>("");

    const onClick = () => {
        if(data != null){
            const payload = {
                id: data.id,
                originalImage: data.originalImage,
                publicImage: data.publicImage,
                poseName: data.poseName,
            };
            PopUpManager.getInstance().openPopUp(PopUpType.CREATEDATA, payload);
        }
        else{
            PopUpManager.getInstance().openPopUp(PopUpType.CREATEDATA, null);
        }
    }

    const initPopUp: CalendarDataPopUp = {
        currentPopUpType: PopUpType.CALENDARDATA,
        init: () => {},
        open: () => setIsVisible(true),
        close: () => setIsVisible(false),

        showData: (data:any) => {
            setSelectedDate(data.date);
            setData(DBManager.getInstance().getDataByDate(data.date));
            setIsVisible(true);
        }
    };

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
                            <DataView item={data} /> 
                            <CustomButton label="데이터 할당" variant="primary" size="large"/>
                            <CustomButton label="데이터 취소" variant="primary" size="large"/>
                        </div>) 
                        : 
                        (<p>지정된 데이터가 없습니다.</p>)
                    }
                </div>
                
                {!data && (
                    <div className='modal-footer'>
                        <CustomButton label='해당 날짜 데이터 생성' variant='primary' size='large' onClick={onClick}/>
                        
                        <CustomButton label='해당 날짜 데이터 할당' variant='primary' size='large' onClick={onClick}/>
                    </div>)
                }
            </div>
        </div>
    )
}