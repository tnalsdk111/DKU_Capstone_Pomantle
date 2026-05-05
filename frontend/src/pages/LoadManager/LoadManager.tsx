import "./LoadManager.css";
import React, { useEffect, useRef, useState } from "react";
import ApiService from "../../api/ApiService";
import type { DailyPoseData } from "../../models/ApiTypes";
import {
  DEV_FALLBACK_DAILY_POSE,
  SKIP_DAILY_POSE_WHEN_UNAVAILABLE,
} from "../../constants/devConfig";

type Props = {
  /** 일일 포즈 확인·카메라 허용까지 성공했을 때 */
  onEnterGame: (daily: DailyPoseData) => void;
  /** 오늘의 포즈가 없거나 불러오기 실패 시 메인으로 */
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
        alert("카메라 권한이 필요합니다.");
        return;
      }

      if (cancelled) return;

      window.setTimeout(() => {
        onEnterGameRef.current(daily);
      }, 800);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="loading-container">
      {!dailyFetchFailed && (
        <>
          <div className="spinner" />
          <p className="loading-text">
            {phase === "checking_daily"
              ? "오늘의 포즈를 확인하는 중…"
              : "카메라 권한을 요청하는 중…"}
          </p>
        </>
      )}

      {dailyFetchFailed && (
        <div className="load-daily-fail">
          <p className="load-error">{dailyErrorMessage}</p>
          <p className="load-hint">오늘 등록된 정답 포즈가 없거나 서버에 연결할 수 없습니다.</p>
          <button
            type="button"
            className="home-from-load-btn"
            onClick={() => onBackHomeRef.current()}
          >
            홈으로
          </button>
        </div>
      )}
    </div>
  );
}

export default LoadManager;
