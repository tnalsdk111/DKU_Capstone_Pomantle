import React, { useState } from "react";

export type PhotoPopupMode = "evaluating" | "fail" | "win";

interface PhotoPopupProps {
  imgSrc: string;
  mode: PhotoPopupMode;
  attemptCount: number;
  score?: number;
  answerImageUrl: string | null;
  errorMessage?: string | null;
  onClose: () => void;
  onGoHome: () => void;
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
  width: "min(420px, 92vw)",
  maxHeight: "90vh",
  overflow: "auto",
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
  answerImageUrl,
  errorMessage,
  onClose,
  onGoHome,
}: PhotoPopupProps) => {
  const [showAnswerFull, setShowAnswerFull] = useState(false);

  const renderWinBody = () => (
    <div
      style={{
        ...modalBase,
        backgroundColor: "#E4D4F7",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h1
        style={{
          margin: 0,
          textAlign: "center",
          fontSize: "42px",
          fontWeight: 900,
          letterSpacing: "0.06em",
          color: "#111",
        }}
      >
        WIN
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "14px",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            flex: "0 0 42%",
            minHeight: "120px",
            backgroundColor: "#B8B8C0",
            borderRadius: "10px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={imgSrc}
            alt="촬영한 사진"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            fontSize: "15px",
            lineHeight: 1.5,
            color: "#111",
            fontWeight: 600,
          }}
        >
          {attemptCount}번째 시도만에 성공하셨습니다.
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        {answerImageUrl ? (
          <button
            type="button"
            style={btnMuted}
            onClick={() => setShowAnswerFull(true)}
          >
            정답 사진 확인
          </button>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        <button type="button" style={btnMuted} onClick={onGoHome}>
          처음으로
        </button>
      </div>
    </div>
  );

  const renderEvaluating = () => (
    <div
      style={{
        ...modalBase,
        backgroundColor: "#fff",
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: "0 0 12px", color: "#333" }}>평가 중…</h2>
      <p style={{ color: "#666", marginBottom: "16px" }}>
        서버에서 포즈 유사도를 계산하고 있습니다.
      </p>
      {imgSrc && (
        <img
          src={imgSrc}
          alt="촬영 미리보기"
          style={{
            width: "100%",
            maxHeight: "200px",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      )}
    </div>
  );

  const renderFail = () => (
    <div
      style={{
        ...modalBase,
        backgroundColor: "#fff",
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: "0 0 8px", color: "#333" }}>아쉽습니다</h2>
      <p style={{ color: "#555", marginBottom: "12px" }}>
        {errorMessage ??
          (typeof score === "number"
            ? `유사도 ${score.toFixed(1)}% — 기준(85%)에 도달하지 못했습니다.`
            : "평가를 완료하지 못했습니다.")}
      </p>
      <button
        type="button"
        onClick={onClose}
        style={{
          ...btnMuted,
          flex: "none",
          width: "100%",
          backgroundColor: "#007AFF",
          color: "#fff",
        }}
      >
        확인
      </button>
    </div>
  );

  return (
    <>
      <div style={overlay}>
        {mode === "evaluating" && renderEvaluating()}
        {mode === "fail" && renderFail()}
        {mode === "win" && renderWinBody()}
      </div>

      {showAnswerFull && answerImageUrl && (
        <div
          style={{
            ...overlay,
            zIndex: 110,
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              maxWidth: "min(520px, 94vw)",
              maxHeight: "80vh",
              background: "#111",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <img
              src={answerImageUrl}
              alt="정답 포즈"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowAnswerFull(false)}
            style={{
              ...btnMuted,
              maxWidth: "200px",
              margin: "0 auto",
            }}
          >
            닫기
          </button>
        </div>
      )}
    </>
  );
};

export default PhotoPopup;
