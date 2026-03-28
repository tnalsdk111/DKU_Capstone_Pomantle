import React from "react";
import CustomButton from "../button/CustomButton";
import { DataItem } from "../../models/DataItem";
import './DataItemCard.css';

interface DataItemCardProps{
    item: DataItem;
}

const DataItemCard = ({item}: DataItemCardProps) => {
    return (
        <div className="data-item-card">
      {/* 좌측 상단 번호 */}
      <span className="item-number">#{item.id}</span>
      
      {/* 중앙 상단 포즈 이름 */}
      <h3 className="item-pose-name">{item.poseName}</h3>

      {/* 이미지 버튼 그룹 */}
      <div className="item-image-group">
        <CustomButton variant="image-btn" size="square">
          <img src={item.originalImage} alt="원본" />
        </CustomButton>
        <CustomButton variant="image-btn" size="square">
          <img src={item.publicImage} alt="비교" />
        </CustomButton>
      </div>
    </div>
  );
}

export default DataItemCard