import React from "react";
import { Data } from "../../models/Data";
import CustomButton from "../button/CustomButton";
import './DataView.css';

interface DataCardProps{
    item: Data;
    onCreate?: (id: number) => void;
}

const DataView = ({item, onCreate}: DataCardProps) => {
    const isValidImage = (imgString: string) => {
        // 1. "..." 같은 더미 텍스트는 제외
        if (imgString === "..." || !imgString) return false;
        
        // 2. Base64 형식(data:image/...)이거나 일반적인 URL(http...)인지 확인
        return imgString.startsWith("data:image/") || imgString.startsWith("http");
    };

    return (
      <div className="data-item-card">
        <div className="card-header">
          <span className="item-number">#{item.id}</span>
          <h3 className="item-pose-name" style={{ fontSize: '1.5rem' }}>{item.poseName}</h3>
        </div>

        <div className="item-image-group">
          <div className="image-box">
              {isValidImage(item.originalImage) ? <img src={`data:image/png;base64,${item.originalImage}`} alt="원본" /> : <img src="..." alt="원본"/>}
              <span className="label">원본</span>
          </div>
          <div className="image-box">
              {isValidImage(item.publicImage) ? <img src={`data:image/png;base64,${item.publicImage}`} alt="공개" /> : <img src="..." alt="공개"/>}
              <span className="label">공개용</span>
          </div>
        </div>

        <div className="card-footer">
          <CustomButton variant="primary" size="large"> {/* 사이즈를 large로 키우면 더 잘 어울려요 */}
            데이터 수정
          </CustomButton>
        </div>
      </div>
  );
}

export default DataView