import React from "react";
import PoseOverlayImage from "../pose/PoseOverlayImage";
import type { PoseOverlayData } from "../../models/PoseOverlay";

export type PhotoPopupMode = "tutorial" | "evaluating" | "fail" | "win";

interface PhotoPopupProps {
  imgSrc: string;
  mode: PhotoPopupMode;
  attemptCount: number;
  score?: number;
  overlayData?: PoseOverlayData | null;
  errorMessage?: string | null;
  onClose: () => void;
}

const overlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.75)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 100,
  padding: "16px",
  boxSizing: "border-box",
};

const modalBase: React.CSSProperties = {
  width: "clamp(520px, 60vw, 760px)",
  maxWidth: "92vw",
  aspectRatio: "4 / 3",
  maxHeight: "84vh",
  overflow: "hidden",
  borderRadius: "20px",
  padding: "24px 20px 20px",
  boxSizing: "border-box",
};

const btnMuted: React.CSSProperties = {
  flex: 1,
  padding: "12px 10px",
  fontSize: "14px",
  backgroundColor: "#D8D8E0",
  color: "#222",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 600,
};

const PhotoPopup = ({
  imgSrc,
  mode,
  attemptCount,
  score,
  overlayData,
  errorMessage,
  onClose,
}: PhotoPopupProps) => {
  const blurAfterMouseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
  };

  const renderPoseOverlayImage = (width: string, maxWidth: string) => (
    <PoseOverlayImage
      imgSrc={imgSrc}
      overlayData={overlayData}
      width={width}
      maxWidth={maxWidth}
      alt="촬영 미리보기"
    />
  );

  const renderWinBody = () => (
    <div
      style={{
        ...modalBase,
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <h1
        style={{
          margin: 0,
          textAlign: "center",
          fontSize: "35px",
          fontWeight: 900,
          letterSpacing: "0.06em",
          color: "#333",
        }}
      >
        WIN
      </h1>
      <p style={{ color: "#555", margin: 0, fontSize: "20px", lineHeight: 1.25 }}>
        {attemptCount}번째 시도만에 성공하셨습니다.
      </p>
      {imgSrc && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {renderPoseOverlayImage("70%", "500px")}
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        onMouseUp={blurAfterMouseClick}
        style={{
          ...btnMuted,
          flex: "none",
          width: "min(460px, 92%)",
          backgroundColor: "#007AFF",
          color: "#fff",
        }}
      >
        확인
      </button>
    </div>
  );

  const renderEvaluating = () => (
    <div
      style={{
        ...modalBase,
        backgroundColor: "#fff",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        alignItems: "center",
      }}
    >
      <h2 style={{ margin: 0, color: "#333", fontSize: "35px", lineHeight: 1.1 }}>
        평가 중…
      </h2>
      <p style={{ color: "#666", margin: 0, fontSize: "20px", lineHeight: 1.25 }}>
        서버에서 포즈 유사도를 계산하고 있습니다.
      </p>
      {imgSrc && (
        <div
          style={{
            width: "100%",
            flex: 1,
            minHeight: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {renderPoseOverlayImage("75%", "540px")}
        </div>
      )}
    </div>
  );

  const renderFail = () => (
    <div
      style={{
        ...modalBase,
        backgroundColor: "#fff",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <h2 style={{ margin: 0, color: "#333", fontSize: "35px", lineHeight: 1.1 }}>
        아쉽습니다
      </h2>
      <p style={{ color: "#555", margin: 0, fontSize: "20px", lineHeight: 1.25 }}>
        {errorMessage ??
          (typeof score === "number"
            ? `유사도 ${score.toFixed(1)}% — 기준(85%)에 도달하지 못했습니다.`
            : "평가를 완료하지 못했습니다.")}
      </p>
      {imgSrc && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {renderPoseOverlayImage("70%", "500px")}
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        onMouseUp={blurAfterMouseClick}
        style={{
          ...btnMuted,
          flex: "none",
          width: "min(460px, 92%)",
          backgroundColor: "#007AFF",
          color: "#fff",
        }}
      >
        확인
      </button>
    </div>
  );

  const renderTutorial = () => (
    <div
      style={{
        ...modalBase,
        backgroundColor: "#fff",
        textAlign: "left",
      }}
    >
      <h3 style={{ margin: "0 0 10px", fontSize: "22px" }}>튜토리얼</h3>
      <p style={{ margin: "0 0 6px", fontSize: "14px", lineHeight: 1.5 }}>
        1) 카메라 프레임에 상체와 손이 모두 보이게 서 주세요.
      </p>
      <p style={{ margin: "0 0 6px", fontSize: "14px", lineHeight: 1.5 }}>
        2) 타이머(3초/5초)를 고른 뒤 촬영을 시작하세요.
      </p>
      <p style={{ margin: "0 0 14px", fontSize: "14px", lineHeight: 1.5 }}>
        3) 촬영 후 유사도 평가 결과를 팝업에서 확인할 수 있습니다.
      </p>
      <button
        type="button"
        onClick={onClose}
        onMouseUp={blurAfterMouseClick}
        style={{
          ...btnMuted,
          flex: "none",
          width: "100%",
          backgroundColor: "#2F6BFF",
          color: "#fff",
        }}
      >
        닫기
      </button>
    </div>
  );

  return (
    <>
      <div style={overlay}>
        {mode === "tutorial" && renderTutorial()}
        {mode === "evaluating" && renderEvaluating()}
        {mode === "fail" && renderFail()}
        {mode === "win" && renderWinBody()}
      </div>
    </>
  );
};

export default PhotoPopup;
