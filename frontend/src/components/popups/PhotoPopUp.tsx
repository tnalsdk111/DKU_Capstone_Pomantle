import React from "react";
import PoseOverlayImage from "../pose/PoseOverlayImage";
import type { PoseOverlayData } from "../../models/PoseOverlay";
import "./PhotoPopUp.css";

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

const PhotoPopup = ({
  imgSrc,
  mode,
  attemptCount,
  score,
  overlayData,
  errorMessage,
  onClose,
}: PhotoPopupProps) => {
  const renderPoseOverlay = () => {
    if (!imgSrc) return null;
    return (
      <div className="preview-container">
        <PoseOverlayImage
          imgSrc={imgSrc}
          overlayData={overlayData}
          width="100%"
          alt="Pose Capture"
        />
      </div>
    );
  };

  const renderWinBody = () => (
    <div className="popup-card win-card">
      <div className="popup-badge badge-win">
        <span>🎉</span>
        <span>미션 성공!</span>
      </div>
      <h1 className="popup-title">정답입니다!</h1>
      <p className="popup-subtitle">
        {attemptCount}번째 시도만에 <strong>{score?.toFixed(1) ?? "90+"}%</strong> 싱크로율로 정답 포즈를 맞췄어요!
      </p>

      {renderPoseOverlay()}

      <button
        id="win-confirm-btn"
        type="button"
        className="neo-btn popup-btn btn-yellow"
        onClick={onClose}
      >
        확인하고 기록 보기
      </button>
    </div>
  );

  const renderEvaluating = () => (
    <div className="popup-card">
      <div className="popup-badge badge-eval">
        <span>🔍</span>
        <span>AI 관절 분석 중</span>
      </div>
      <h2 className="popup-title">점수를 매기는 중…</h2>
      <p className="popup-subtitle">
        정답 포즈와 내 관절 각도가 얼마나 일치하는지 비교하고 있어요!
      </p>

      {renderPoseOverlay()}
    </div>
  );

  const renderFail = () => {
    const numericScore = typeof score === "number" ? score : 0;
    return (
      <div className="popup-card">
        <div className="popup-badge badge-fail">
          <span>😅</span>
          <span>아쉬워요!</span>
        </div>
        <h2 className="popup-title">조금 더 비슷하게!</h2>
        <p className="popup-subtitle">
          {errorMessage ??
            `유사도 ${numericScore.toFixed(1)}% — 클리어 기준(85%)까지 조금 남았어요!`}
        </p>

        {/* Score comparison gauge bar */}
        {!errorMessage && typeof score === "number" && (
          <div className="score-gauge-wrap">
            <div className="score-labels">
              <span className="my-score-label">내 점수: {numericScore.toFixed(1)}%</span>
              <span className="target-score-label">목표: 85.0%</span>
            </div>
            <div className="gauge-track">
              <div
                className="gauge-fill"
                style={{ width: `${Math.min(100, Math.max(0, numericScore))}%` }}
              />
              <div className="gauge-target-line" />
            </div>
          </div>
        )}

        {renderPoseOverlay()}

        <button
          id="fail-retry-btn"
          type="button"
          className="neo-btn popup-btn btn-orange"
          onClick={onClose}
        >
          한 번 더 도전하기! 🔁
        </button>
      </div>
    );
  };

  const renderTutorial = () => (
    <div className="popup-card">
      <div className="popup-badge badge-eval">
        <span>💡</span>
        <span>게임 룰 안내</span>
      </div>
      <h3 className="popup-title">포맨틀 어떻게 하나요?</h3>
      <p className="popup-subtitle">3단계로 즐기는 오늘의 포즈 게임</p>

      <div className="tutorial-grid">
        <div className="tutorial-step">
          <div className="step-num">1</div>
          <div className="step-info">
            <h4>화면에 상체 맞추기</h4>
            <p>어깨, 팔꿈치와 양손이 카메라 안에 쏙 들어오게 서 주세요.</p>
          </div>
        </div>

        <div className="tutorial-step">
          <div className="step-num">2</div>
          <div className="step-info">
            <h4>타이머 누르고 자세 잡기</h4>
            <p>3초 또는 5초를 선택하고 '포즈 촬영하기'를 누른 뒤 자세를 유지하세요.</p>
          </div>
        </div>

        <div className="tutorial-step">
          <div className="step-num">3</div>
          <div className="step-info">
            <h4>85% 넘으면 클리어!</h4>
            <p>매일 자정에 새로운 포즈가 출제됩니다. 높은 점수로 랭킹에 도전해 보세요!</p>
          </div>
        </div>
      </div>

      <button
        id="tutorial-close-btn"
        type="button"
        className="neo-btn popup-btn btn-purple"
        onClick={onClose}
      >
        이해했어요! 👍
      </button>
    </div>
  );

  return (
    <div className="popup-backdrop">
      {mode === "tutorial" && renderTutorial()}
      {mode === "evaluating" && renderEvaluating()}
      {mode === "fail" && renderFail()}
      {mode === "win" && renderWinBody()}
    </div>
  );
};

export default PhotoPopup;
