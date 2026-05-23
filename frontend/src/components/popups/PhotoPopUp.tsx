import React from "react";

export type PhotoPopupMode = "tutorial" | "evaluating" | "fail" | "win";

interface PhotoPopupProps {
  imgSrc: string;
  mode: PhotoPopupMode;
  attemptCount: number;
  score?: number;
  overlayData?: {
    pose: ([number, number] | null)[];
    leftHand: ([number, number] | null)[];
    rightHand: ([number, number] | null)[];
    // lips: { idx: number; point: [number, number] }[];
    sourceSize: {
      width: number;
      height: number;
    };
  } | null;
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

const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

// const LIP_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
//   [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291], [291, 61],
//   [78, 95], [95, 88], [88, 178], [178, 87], [87, 14], [14, 317], [317, 402], [402, 318], [318, 324], [324, 308], [308, 78],
//   [191, 80], [80, 81], [81, 82], [82, 13], [13, 312], [312, 311], [311, 310], [310, 415], [415, 308],
// ];

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
    <div
      style={{
        position: "relative",
        width,
        maxWidth,
        aspectRatio: overlayData
          ? `${overlayData.sourceSize.width} / ${overlayData.sourceSize.height}`
          : "4 / 3",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#ddd",
      }}
    >
      <img
        src={imgSrc}
        alt="촬영 미리보기"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {overlayData ? (
        <svg
          viewBox={`0 0 ${overlayData.sourceSize.width} ${overlayData.sourceSize.height}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {/* pose 11~14를 수집한 순서 기준: 0=11, 1=12, 2=13, 3=14 */}
          {[
            [1, 0], // 12-11
            [1, 3], // 12-14
            [0, 2], // 11-13
          ].map(([a, b]) => {
            const p1 = overlayData.pose[a];
            const p2 = overlayData.pose[b];
            if (!p1 || !p2) return null;
            return (
              <line
                key={`pose-${a}-${b}`}
                x1={p1[0]}
                y1={p1[1]}
                x2={p2[0]}
                y2={p2[1]}
                stroke="#00cc66"
                strokeWidth={3}
              />
            );
          })}

          {/* 왼손(인덱스 4~24), 오른손(인덱스 25~45) 선 */}
          {[overlayData.leftHand, overlayData.rightHand].map((hand, handIdx) =>
            HAND_CONNECTIONS.map(([a, b]) => {
              const p1 = hand[a];
              const p2 = hand[b];
              if (!p1 || !p2) return null;
              return (
                <line
                  key={`hand-${handIdx}-${a}-${b}`}
                  x1={p1[0]}
                  y1={p1[1]}
                  x2={p2[0]}
                  y2={p2[1]}
                  stroke="#00cc66"
                  strokeWidth={2.5}
                />
              );
            })
          )}

          {/* 팔꿈치와 손목(손 0번) 연결 */}
          {[
            [overlayData.pose[2], overlayData.leftHand[0]],
            [overlayData.pose[3], overlayData.rightHand[0]],
          ].map(([a, b]) => {
            const p1 = a;
            const p2 = b;
            if (!p1 || !p2) return null;
            return (
              <line
                key={`bridge-${a}-${b}`}
                x1={p1[0]}
                y1={p1[1]}
                x2={p2[0]}
                y2={p2[1]}
                stroke="#00cc66"
                strokeWidth={2.5}
              />
            );
          })}

          {/* 입술 선 */}
          {/*
            {(() => {
            const lipMap = new Map<number, readonly [number, number]>();
            overlayData.lips.forEach(({ idx, point }) => {
              lipMap.set(idx, point);
            });

            return LIP_CONNECTIONS.map(([a, b]) => {
              const p1 = lipMap.get(a);
              const p2 = lipMap.get(b);
              if (!p1 || !p2) return null;
              return (
                <line
                  key={`lip-${a}-${b}`}
                  x1={p1[0]}
                  y1={p1[1]}
                  x2={p2[0]}
                  y2={p2[1]}
                  stroke="#00cc66"
                  strokeWidth={2}
                />
              );
            });
          })()}
          */}
          

          {[...overlayData.pose, ...overlayData.leftHand, ...overlayData.rightHand].map((p, i) =>
            p ? <circle key={`${i}-${p[0]}-${p[1]}`} cx={p[0]} cy={p[1]} r={3} fill="#ff3b30" /> : null
          )}
        </svg>
      ) : null}
    </div>
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
