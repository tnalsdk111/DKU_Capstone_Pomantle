import React from "react";
import { Data } from "../../models/Data";
import CustomButton from "../button/CustomButton";
import './DataView.css';
import { PopUpManager } from "../../managers/PopUpManager";
import { DBManager } from "../../managers/DBManager";
import { PopUpType } from "../../models/PopUpType";
import { PoseListItem } from "../../models/ApiTypes";

interface DataCardProps{
    data: PoseListItem;
    onCreate?: (id: number) => void;
    isSelectMode?: boolean; 
    onSelect?: (data: PoseListItem) => void;
}

const DataView = ({data, onCreate, isSelectMode=false, onSelect}: DataCardProps) => {
    const isValidImage = (imgString: string) => {
        if (imgString === "..." || !imgString) return false;
        
        return imgString.startsWith("data:image/") || imgString.startsWith("http");
    };

    const dataEdit = () => {
        PopUpManager.getInstance().openPopUp(PopUpType.CREATEDATA, data);
    };

    const dataDelete = () => {
      DBManager.getInstance().deleteData(data.id);
    }

    return (
      <div className="data-item-card">
        <div className="card-header">
          <span className="item-number">#{data.id}</span>
          <h3 className="item-pose-name" style={{ fontSize: '1.5rem' }}>poseName : {data.poseName}</h3>
          <h3 className="item-pose-name" style={{ fontSize: '1.5rem' }}>createdAt : {data.createdAt}</h3>
          <h3 className="item-pose-name" style={{ fontSize: '1.5rem' }}>usedAt : {data.usedAt}</h3>
        </div>

        <div className="item-image-group">
          <div className="image-box">
              {isValidImage(data.originalImage) ? <img src={`${data.originalImage}`} alt="원본" /> : <img src="..." alt="원본"/>}
              <span className="label">원본</span>
          </div>
          <div className="image-box">
              {isValidImage(data.publicImage) ? <img src={`${data.publicImage}`} alt="공개" /> : <img src="..." alt="공개"/>}
              <span className="label">공개용</span>
          </div>
        </div>

        <div className="card-footer">
          {isSelectMode? (
            <CustomButton label="데이터 할당" variant="primary" size="large" onClick={() => onSelect && onSelect(data)}/>
          ):(
            <>
              <CustomButton label="데이터 수정" variant="primary" size="large" onClick={dataEdit}/>
              <CustomButton label="데이터 삭제" variant="primary" size="large" onClick={dataDelete}/>
            </>
          )}
        </div>
      </div>
  );
}

export default DataView