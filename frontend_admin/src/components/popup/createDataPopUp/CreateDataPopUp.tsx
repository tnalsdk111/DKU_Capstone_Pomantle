import React, { useState, useEffect, useCallback } from 'react'
import { PopUp } from "../../../models/PopUp";
import { PopUpManager } from '../../../managers/PopUpManager';
import { PopUpType } from '../../../models/PopUpType';
import {useDropzone} from 'react-dropzone'
import './CreateDataPopUp.css'

export const CreateDataPopUp = () => {
    
    const [isVisible, setIsVisible] = useState(false);

    const initPopUp: PopUp = {
        currentPopUpType: PopUpType.CREATEDATA,
        init: () => {},
        open: () => setIsVisible(true),
        close: () => setIsVisible(false),
    };

    useEffect(() => {
        PopUpManager.getInstance().pushPopUp(initPopUp);
    }, []);

    if (!isVisible) return null;

    return (
        <div className='modal-overlay' onClick={initPopUp.close}>
            
        </div>
    )
}