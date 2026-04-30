import React from "react";
import { Data } from "../../models/Data";
import CustomButton from "../button/CustomButton";
import './DataView.css';
import { PopUpManager } from "../../managers/PopUpManager";
import { DBManager } from "../../managers/DBManager";
import { PopUpType } from "../../models/PopUpType";

interface DataCardProps{
    item: Data;
    onCreate?: (id: number) => void;
}

const DataView = ({item, onCreate}: DataCardProps) => {
    const isValidImage = (imgString: string) => {
        if (imgString === "..." || !imgString) return false;
        
        return imgString.startsWith("data:image/") || imgString.startsWith("http");
    };

    const dataEdit = () => {
        const payload = {
            id: item.id,
            originalImage: item.originalImage,
            publicImage: item.publicImage,
            poseName: item.poseName,
        }
        PopUpManager.getInstance().openPopUp(PopUpType.CREATEDATA, payload);
    };

    const dataDelete = () => {
      DBManager.getInstance().deleteData(item.id);
    }

    return (
      <div className="data-item-card">
        <div className="card-header">
          <span className="item-number">#{item.id}</span>
          <h3 className="item-pose-name" style={{ fontSize: '1.5rem' }}>{item.poseName}</h3>
        </div>

        <div className="item-image-group">
          <div className="image-box">
              {isValidImage(item.originalImage) ? <img src={`${item.originalImage}`} alt="원본" /> : <img src="..." alt="원본"/>}
              <span className="label">원본</span>
          </div>
          <div className="image-box">
              {isValidImage(item.publicImage) ? <img src={`${item.publicImage}`} alt="공개" /> : <img src="..." alt="공개"/>}
              <span className="label">공개용</span>
          </div>
        </div>

        <div className="card-footer">
          <CustomButton label="데이터 수정" variant="primary" size="large" onClick={dataEdit}/>
          <CustomButton label="데이터 삭제" variant="primary" size="large" onClick={dataDelete}/>
        </div>
      </div>
  );
}

export default DataView