import React, { forwardRef, useImperativeHandle, useRef } from "react";
import Webcam from "react-webcam";

interface CameraContainerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  timer: number;
  selectedTimer: number;
  onTimerSelect: (sec: number) => void;
}

// 부모 컴포넌트(GamePage)에서 이 컴포넌트의 메서드(캡처 등)를 호출할 수 있게 forwardRef 사용
const CameraContainer = forwardRef(({ canvasRef, timer, selectedTimer, onTimerSelect }: CameraContainerProps, ref) => {
  const webcamRef = useRef<Webcam>(null);

  // 부모에서 호출할 수 있는 함수 등록
  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      return webcamRef.current?.getScreenshot();
    },
    videoElement: webcamRef.current?.video
  }));

  return (
    <div style={{ 
      position: "relative", 
      width: "65%",
      minWidth: "960px",
      minHeight: "540px", 
      aspectRatio: "16/9",
      backgroundColor: "#FFF", 
      borderRadius: "20px", 
      overflow: "hidden",
      display:"block" }}>
      <Webcam ref={webcamRef} mirrored={true} screenshotFormat="image/jpeg" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover"}} />
      <canvas ref={canvasRef} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />

      {/* 타이머 설정 UI */}
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 20 }}>
        <div style={{ display: "flex", gap: "10px", background: "rgba(0,0,0,0.5)", padding: "5px", borderRadius: "20px" }}>
          {[3, 5].map(sec => (
            <button 
              key={sec}
              onClick={() => onTimerSelect(sec)}
              style={{
                background: selectedTimer === sec ? "white" : "transparent",
                color: selectedTimer === sec ? "black" : "white",
                border: "none", borderRadius: "15px", padding: "5px 15px", cursor: "pointer"
              }}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* 카운트다운 숫자 */}
      {timer > 0 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          fontSize: "120px", color: "white", fontWeight: "bold", zIndex: 30
        }}>
          {timer}
        </div>
      )}
    </div>
  );
});

export default CameraContainer;