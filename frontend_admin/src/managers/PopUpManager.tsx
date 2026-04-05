import { PopUp } from "../models/PopUp";
import { PopUpType } from "../models/PopUpType";

export class PopUpManager{
    private static instance: PopUpManager
    private popUpMap: Map<PopUpType, PopUp> = new Map();

    private constructor() {};

    public static getInstance(): PopUpManager{
        if (!PopUpManager.instance) {
            PopUpManager.instance = new PopUpManager();
        }
        return PopUpManager.instance;
    }

    public initPopUp(): void{
        
    }

    public pushPopUp(popUp: PopUp): void{
        console.log("asdf");
        this.popUpMap.set(popUp.currentPopUpType, popUp);
    }

    public openPopUp(popUpType: PopUpType, data?: any): void{
        const popUp = this.popUpMap.get(popUpType);
        //console.log(data);
        if(popUp) {
            if(data) (popUp as any).showData(data.date);
            popUp.open();
        }
        else{
            console.error(`${popUpType} 팝업을 찾을 수 없습니다.`);
        }
    }

    public closePopUp(popUpType: PopUpType): void{
        const popUp = this.popUpMap.get(popUpType);
    }
}