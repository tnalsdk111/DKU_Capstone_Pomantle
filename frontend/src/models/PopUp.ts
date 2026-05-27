import { PopUpType } from "./PopUpType";

export interface PopUp{
    currentPopUpType: PopUpType

    init(): void;
    open(): void;
    close(): void;
}