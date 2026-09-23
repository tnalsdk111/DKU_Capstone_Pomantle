import "./LoadManager.css";
import React, { useEffect, useRef, useState } from "react";
import ApiService from "../../api/ApiService";
import type { DailyPoseData } from "../../models/ApiTypes";
import {
  DEV_FALLBACK_DAILY_POSE,
  SKIP_DAILY_POSE_WHEN_UNAVAILABLE,
} from "../../constants/devConfig";

type Props = {
  onEnterGame: (daily: DailyPoseData) => void;
  onBackHome: () => void;
};

function LoadManager({ onEnterGame, onBackHome }: Props) {
  const onEnterGameRef = useRef(onEnterGame);
  const onBackHomeRef = useRef(onBackHome);
  useEffect(() => {
    onEnterGameRef.current = onEnterGame;
    onBackHomeRef.current = onBackHome;
  }, [onEnterGame, onBackHome]);

  const [phase, setPhase] = useState<"checking_daily" | "requesting_camera">(
    "checking_daily"
  );
  const [dailyFetchFailed, setDailyFetchFailed] = useState(false);
  const [dailyErrorMessage, setDailyErrorMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let daily: DailyPoseData;
      try {
        daily = await ApiService.getInstance().getDailyPose();
      } catch (e) {
        if (cancelled) return;
        if (SKIP_DAILY_POSE_WHEN_UNAVAILABLE) {
          daily = DEV_FALLBACK_DAILY_POSE;
        } else {
          setDailyErrorMessage(
            e instanceof Error
              ? e.message
              : "오늘의 포즈를 불러오지 못했습니다."
          );
          setDailyFetchFailed(true);
          return;
        }
      }

      if (cancelled) return;

      setPhase("requesting_camera");
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch {
        alert("카메라 권한이 필요합니다. 카메라 접근을 허용해 주세요!");
        onBackHomeRef.current();
        return;
      }

      if (cancelled) return;

      window.setTimeout(() => {
        onEnterGameRef.current(daily);
      }, 600);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="loading-container">
      {!dailyFetchFailed ? (
        <div className="loading-card">
          <div className="bounce-emoji">
            {phase === "checking_daily" ? "🔍" : "📸"}
          </div>

          <h2 className="loading-headline">
            {phase === "checking_daily"
              ? "오늘의 포즈 불러오는 중!"
              : "카메라 렌즈 준비 중!"}
          </h2>

          <p className="loading-text">
            {phase === "checking_daily"
              ? "오늘 맞춰야 할 비밀 포즈를 동기화하고 있어요."
              : "웹캠과 AI 관절 트래커를 연결하고 있어요."}
          </p>

          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: phase === "checking_daily" ? "55%" : "95%" }}
            />
          </div>
        </div>
      ) : (
        <div className="load-daily-fail">
          <div className="fail-emoji">😵</div>
          <p className="load-error">{dailyErrorMessage}</p>
          <p className="load-hint">
            오늘 등록된 정답 포즈가 없거나 서버에 연결할 수 없어요.
          </p>
          <button
            id="back-home-btn"
            type="button"
            className="neo-btn home-from-load-btn"
            onClick={() => onBackHomeRef.current()}
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}

export default LoadManager;
