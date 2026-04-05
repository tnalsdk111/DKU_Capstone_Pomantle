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
        PopUpManager.getInstance().openPopUp(PopUpType.CREATEDATA);
    }

    const initPopUp: CalendarDataPopUp = {
        currentPopUpType: PopUpType.CALENDARDATA,
        init: () => {},
        open: () => setIsVisible(true),
        close: () => setIsVisible(false),

        showData: (date:string) => {
            setSelectedDate(date);
            setData(DBManager.getInstance().getDataByDate(date));
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
                    {data ? ( <DataView item={data} />) : (<p>지정된 데이터가 없습니다.</p>)}
                </div>
                {!data && (
                    <div className='modal-footer'>
                        <CustomButton label='해당 날짜 데이터 생성' variant='primary' size='large' onClick={onClick}/>
                    </div>)
                }
            </div>
        </div>
    )
}