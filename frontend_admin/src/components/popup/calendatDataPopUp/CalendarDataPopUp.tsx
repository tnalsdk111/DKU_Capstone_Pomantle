import React, { useState, useEffect } from 'react'
import { PopUp } from "../../../models/PopUp";
import { Data } from '../../../models/Data';
import { PopUpManager } from '../../../managers/PopUpManager';
import CustomButton from '../../button/CustomButton';
import './CalendarDataPopUp.css'
import { PopUpType } from '../../../models/PopUpType';

interface CalendarDataPopUp extends PopUp{
    showData(data: Data): void;
}

export const CalendarDataPopUp = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [data, setData] = useState<Data | null>(null);

    const initPopUp: CalendarDataPopUp = {
        currentPopUpType: PopUpType.CALENDARDATA,
        init: () => {},
        open: () => setIsVisible(true),
        close: () => setIsVisible(false),

        showData: (data: Data) => {
            setData(data);
            setIsVisible(true);
        }
    }

    useEffect(() => {
        PopUpManager.getInstance().pushPopUp(initPopUp);
    }, []);

    if (!isVisible) return null;

    return (
        <div className='modal-overlay' onClick={initPopUp.close}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h2>{data? data.poseName : "데이터 없음"}</h2>
                    <button className="close-btn" onClick={initPopUp.close}>&times;</button>
                </div>
                <div className='modal-body'>
                    <div className='modal-button-group'>
                        <CustomButton variant='image-btn' size='square'>
                            <img alt="원본 이미지" />
                        </CustomButton>
                        <CustomButton variant='image-btn' size='square'>
                            <img alt="공개용 이미지" />
                        </CustomButton>
                    </div>
                </div>
            </div>
        </div>
    )
}