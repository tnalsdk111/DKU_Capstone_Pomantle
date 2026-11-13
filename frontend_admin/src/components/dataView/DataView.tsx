import React from "react";
import CustomButton from "../button/CustomButton";
import './DataView.css';
import { PopUpManager } from "../../managers/PopUpManager";
import { DBManager } from "../../managers/DBManager";
import { PopUpType } from "../../models/PopUpType";
import { PoseData } from "../../models/ApiTypes";

interface DataCardProps {
  data: PoseData;
  onCreate?: (id: number) => void;
  isSelectMode?: boolean; 
  onSelect?: (data: PoseData) => void;
}

const DataView = ({ data, isSelectMode = false, onSelect }: DataCardProps) => {
  const isValidImage = (imgString: string) => {
    if (imgString === "..." || !imgString) return false;
    return imgString.startsWith("data:image/") || imgString.startsWith("http");
  };

  const dataEdit = () => {
    PopUpManager.getInstance().openPopUp(PopUpType.CREATEDATA, data);
  };

  const dataDelete = () => {
    if (window.confirm(`'${data.poseName}' 포즈 데이터를 정말 삭제하시겠습니까?`)) {
      DBManager.getInstance().deleteData(data.id);
    }
  };

  return (
    <div className="data-item-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="item-number">#{data.id}</span>
          <h3 className="item-pose-name">{data.poseName}</h3>
        </div>
        <div className="card-meta-row">
          <span className="meta-chip">등록: {data.createdAt ? data.createdAt.split('T')[0] : '미등록'}</span>
          {data.usedAt ? (
            <span className="meta-chip used">배정일: {data.usedAt}</span>
          ) : (
            <span className="meta-chip">미배정 포즈</span>
          )}
        </div>
      </div>

      <div className="item-image-group">
        <div className="image-box">
          {isValidImage(data.originalImage) ? (
            <img src={`${data.originalImage}`} alt="원본" />
          ) : (
            <div style={{ color: '#aaa', fontSize: '13px' }}>이미지 없음</div>
          )}
          <span className="label">원본 스냅샷</span>
        </div>
        <div className="image-box">
          {isValidImage(data.publicImage) ? (
            <img src={`${data.publicImage}`} alt="공개" />
          ) : (
            <div style={{ color: '#aaa', fontSize: '13px' }}>이미지 없음</div>
          )}
          <span className="label">공개용 포즈</span>
        </div>
      </div>

      <div className="card-footer">
        {isSelectMode ? (
          <CustomButton
            label="이 데이터 배정하기"
            variant="success"
            size="large"
            onClick={() => onSelect && onSelect(data)}
          />
        ) : (
          <>
            <CustomButton
              label="포즈 수정"
              variant="primary"
              size="medium"
              onClick={dataEdit}
            />
            <CustomButton
              label="삭제"
              variant="danger"
              size="medium"
              onClick={dataDelete}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DataView;