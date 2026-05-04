import React from "react";

interface PhotoPopupProps {
  imgSrc: string | null;
  onClose: () => void;
}

const PhotoPopup = ({ imgSrc, onClose }: PhotoPopupProps) => {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center",
      alignItems: "center", zIndex: 100
    }}>
      <div style={{
        backgroundColor: "white", padding: "20px", borderRadius: "15px",
        textAlign: "center", width: "70%"
      }}>
        <h1 style={{ color: "#333" }}>📸 촬영 완료!</h1>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          gap:"3%" 
          }}>
          {imgSrc && <img src={imgSrc} alt="Captured" style={{ width: "60%", borderRadius: "8px", marginBottom: "20px" }} />}
          <p style={{ fontSize: "25px", width: "30%" }}>사진이 성공적으로 촬영되었습니다! &nbsp; 전송받은 유사도 점수: 95%</p>
        </div>
        <button 
          onClick={onClose}
          style={{
            padding: "10px 30px", fontSize: "18px", backgroundColor: "#007AFF",
            color: "white", border: "none", borderRadius: "5px", cursor: "pointer"
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default PhotoPopup;