import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera } from "@mediapipe/camera_utils";
import type { Results } from "@mediapipe/holistic";
import { InitHolistic, drawHolisticResults } from "../../components/holistic/Holistic";
import PhotoPopup, { PhotoPopupMode } from "../../components/popups/PhotoPopUp";
import CameraContainer from "../../components/camera/Camera";
import ApiService from "../../api/ApiService";
import type { DailyPoseData } from "../../models/ApiTypes";
import { API_ORIGIN } from "../../constants/ApiConfig";
import {
  appendEvaluateRecord,
  resolveImageUrl,
} from "../../utils/gameLocalStorage";

/**
 * Holistic.drawHolisticResults와 같은 캔버스 설정(너비·높이=비디오, translate(W,0)·scale(-1,1))일 때
 * drawLandmarks로 찍는 점의 캔버스 픽셀 [가로, 세로].
 * 순서: pose 11~14 → 왼손 전체 → 오른손 전체 (Holistic.tsx drawLandmarks 호출과 동일)
 */
function collectDrawLandmarkCanvasPixels(
  results: Results,
  videoWidth: number,
  videoHeight: number
): [number, number][] {
  const out: [number, number][] = [];
  const push = (lm: { x: number; y: number }) => {
    const ux = lm.x * videoWidth;
    const uy = lm.y * videoHeight;
    out.push([Math.round(videoWidth - ux), Math.round(uy)]);
  };

  const pose = results.poseLandmarks;
  if (pose && pose.length >= 15) {
    for (let i = 11; i <= 14; i++) {
      push(pose[i]);
    }
  }

  if (results.leftHandLandmarks?.length) {
    for (const lm of results.leftHandLandmarks) {
      push(lm);
    }
  }
  if (results.rightHandLandmarks?.length) {
    for (const lm of results.rightHandLandmarks) {
      push(lm);
    }
  }

  return out;
}

type PhotoSheet = {
  imgSrc: string;
  mode: PhotoPopupMode;
  score?: number;
  errorMessage?: string | null;
};

type GamePageProps = {
  dailyPose: DailyPoseData;
  onExitToMain: () => void;
};

const GamePage = ({ dailyPose, onExitToMain }: GamePageProps) => {
  const cameraRef = useRef<{
    takeScreenshot: () => string | null;
    videoElement?: HTMLVideoElement;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const holisticRef = useRef<ReturnType<typeof InitHolistic> | null>(null);
  const lastDrawDotPixelsRef = useRef<[number, number][] | null>(null);
  const expectCaptureRef = useRef(false);
  const attemptCountRef = useRef(0);

  const [timer, setTimer] = useState(0);
  const [selectedTimer, setSelectedTimer] = useState(3);
  const [photoSheet, setPhotoSheet] = useState<PhotoSheet | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const answerImageUrl = dailyPose.publicImage
    ? resolveImageUrl(dailyPose.publicImage, API_ORIGIN)
    : null;

  useEffect(() => {
    if (!holisticRef.current) {
      holisticRef.current = InitHolistic((results) => {
        drawHolisticResults(
          results,
          canvasRef,
          cameraRef.current?.videoElement as HTMLVideoElement
        );
        const video = cameraRef.current?.videoElement as
          | HTMLVideoElement
          | undefined;
        const w = video?.videoWidth ?? 0;
        const h = video?.videoHeight ?? 0;
        lastDrawDotPixelsRef.current =
          w > 0 && h > 0 ? collectDrawLandmarkCanvasPixels(results, w, h) : null;
      });
    }

    let cancelled = false;
    let cameraInstance: Camera | null = null;

    const tryStart = () => {
      const videoElement = cameraRef.current?.videoElement as
        | HTMLVideoElement
        | undefined;
      if (!videoElement || cancelled) return false;

      cameraInstance = new Camera(videoElement, {
        onFrame: async () => {
          if (holisticRef.current && !cancelled) {
            await holisticRef.current.send({ image: videoElement });
          }
        },
        width: 1280,
        height: 720,
      });
      cameraInstance.start();
      return true;
    };

    if (!tryStart()) {
      const id = window.setInterval(() => {
        if (tryStart()) window.clearInterval(id);
      }, 100);
      return () => {
        cancelled = true;
        window.clearInterval(id);
        cameraInstance?.stop();
      };
    }

    return () => {
      cancelled = true;
      cameraInstance?.stop();
    };
  }, []);

  const runEvaluate = useCallback(
    async (image: string, attemptNumber: number) => {
      if (!dailyPose.daily_id) {
        setPhotoSheet({
          imgSrc: image,
          mode: "fail",
          errorMessage: "오늘의 문제 정보가 없습니다. 메인에서 다시 시작해 주세요.",
        });
        return;
      }

      const landmarks = lastDrawDotPixelsRef.current;
      if (!landmarks?.length) {
        setPhotoSheet({
          imgSrc: image,
          mode: "fail",
          errorMessage:
            "화면에 찍는 관절 점 좌표를 아직 만들 수 없습니다. 상체와 손이 잘 보이게 다시 촬영해 주세요.",
        });
        return;
      }

      setPhotoSheet({ imgSrc: image, mode: "evaluating" });

      try {
        const result = await ApiService.getInstance().evaluate(
          dailyPose.daily_id,
          landmarks
        );

        appendEvaluateRecord({
          daily_id: dailyPose.daily_id,
          pose_name: dailyPose.pose_name,
          imgSrc: image,
          score: result.score,
          is_passed: result.is_passed,
          attemptNumber,
          recordedAt: new Date().toISOString(),
        });

        setPhotoSheet({
          imgSrc: image,
          mode: result.is_passed ? "win" : "fail",
          score: result.score,
        });
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "평가 요청 중 오류가 발생했습니다.";
        setPhotoSheet({
          imgSrc: image,
          mode: "fail",
          errorMessage: msg,
        });
      }
    },
    [dailyPose]
  );

  const startTimer = () => {
    if (!dailyPose.daily_id) {
      alert("오늘의 포즈 정보가 없습니다. 처음부터 다시 시작해 주세요.");
      return;
    }
    expectCaptureRef.current = true;
    setTimer(selectedTimer);
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }

    if (timer === 0 && expectCaptureRef.current && cameraRef.current) {
      expectCaptureRef.current = false;
      const image = cameraRef.current.takeScreenshot();
      if (image) {
        attemptCountRef.current += 1;
        const n = attemptCountRef.current;
        setAttemptCount(n);
        void runEvaluate(image, n);
      }
    }
  }, [timer, runEvaluate]);

  const closePhotoPopup = () => {
    setPhotoSheet(null);
  };

  const handleGoHome = () => {
    setPhotoSheet(null);
    onExitToMain();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#F0F0F0",
        gap: "30px",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>
        오늘의 포즈: {dailyPose.pose_name}
      </p>

      <CameraContainer
        ref={cameraRef}
        canvasRef={canvasRef}
        timer={timer}
        selectedTimer={selectedTimer}
        onTimerSelect={setSelectedTimer}
      />

      <button type="button" onClick={startTimer}>
        촬영 시작
      </button>

      {photoSheet && (
        <PhotoPopup
          imgSrc={photoSheet.imgSrc}
          mode={photoSheet.mode}
          attemptCount={attemptCount}
          score={photoSheet.score}
          answerImageUrl={answerImageUrl}
          errorMessage={photoSheet.errorMessage ?? null}
          onClose={closePhotoPopup}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
};

export default GamePage;
