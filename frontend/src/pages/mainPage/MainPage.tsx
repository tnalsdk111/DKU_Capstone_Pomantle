import React from "react";
import "./MainPage.css";

type Props = {
  onStart: () => void;
};

function MainPage({ onStart }: Props) {
  return (
    <div className="main-lobby">
      <div className="lobby-content">
        <div className="daily-sticker">
          <span className="flame-icon">🔥</span>
          <span>TODAY'S POSE CHALLENGE</span>
        </div>

        <div className="game-title-wrap">
          <h1 className="game-title">POMANTLE</h1>
        </div>
        <p className="subtitle">온몸으로 추리하는 오늘의 시크릿 포즈!</p>

        <div className="start-button-wrapper">
          <button
            id="start-game-btn"
            className="arcade-go-btn"
            onClick={onStart}
            aria-label="게임 시작"
          >
            <span>GO!</span>
            <span className="btn-caption">Start Game</span>
          </button>
        </div>

        <div className="lobby-features">
          <div className="feature-sticker">
            <div className="sticker-icon icon-yellow">🎯</div>
            <div className="sticker-text">
              <p className="sticker-title">비밀 포즈 상상하기</p>
              <p className="sticker-desc">오늘의 정답 포즈는 무엇일까요?</p>
            </div>
          </div>

          <div className="feature-sticker">
            <div className="sticker-icon icon-purple">⚡</div>
            <div className="sticker-text">
              <p className="sticker-title">AI 카메라 찰칵</p>
              <p className="sticker-desc">실시간으로 내 관절 각도를 분석해요</p>
            </div>
          </div>

          <div className="feature-sticker">
            <div className="sticker-icon icon-green">🏆</div>
            <div className="sticker-text">
              <p className="sticker-title">85% 넘으면 클리어!</p>
              <p className="sticker-desc">높은 싱크로율로 1등을 노려보세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;