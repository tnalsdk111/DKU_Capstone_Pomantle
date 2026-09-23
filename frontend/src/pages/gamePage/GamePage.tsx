import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera } from "@mediapipe/camera_utils";
import type { Results } from "@mediapipe/holistic";
import { InitHolistic, drawHolisticResults } from "../../components/holistic/Holistic";
import PhotoPopup, { PhotoPopupMode } from "../../components/popups/PhotoPopUp";
import CameraContainer from "../../components/camera/Camera";
import RecordPage from "../recordPage/RecordPage";
import ApiService from "../../api/ApiService";
import type {
  DailyPoseData,
  EvaluateLandmarksPayload,
} from "../../models/ApiTypes";
import {
  appendEvaluateRecord,
} from "../../utils/gameLocalStorage";
import type { PoseOverlayData } from "../../models/PoseOverlay";
import { MOCK_EVALUATE_WHEN_UNAVAILABLE } from "../../constants/devConfig";
import "./GamePage.css";

const POSE_LANDMARK_INDICES = [11, 12, 13, 14] as const;
const HAND_LANDMARK_COUNT = 21;

function toMirroredCanvasPixel(
  lm: { x: number; y: number },
  videoWidth: number,
  videoHeight: number
): [number, number] {
  const ux = lm.x * videoWidth;
  const uy = lm.y * videoHeight;
  return [Math.round(videoWidth - ux), Math.round(uy)];
}

function ApiAdaptor(
  results: Results,
): EvaluateLandmarksPayload {
  const convertToCoordinatePairs = (landmarks: any[]): [number, number][] | null => {
    if(!landmarks) return null;
    return landmarks.map(point => {
      return [point.x, point.y];
    });
  };
  
  const rawPose = results.poseLandmarks;
  const rawLeftHand = results.leftHandLandmarks;
  const rawRightHand = results.rightHandLandmarks;

  let filteredPose: [number, number][] | null = null;
  if (rawPose) {
    const targetIndices = [11, 12, 13, 14];
    filteredPose = targetIndices.map(idx => {
      const point = rawPose[idx];
      if (!point) return [0, 0];
      return [point.x || 0, point.y || 0] as [number, number];
    });
  }
  return {
    pose: filteredPose || null,
    leftHand: convertToCoordinatePairs(rawLeftHand) || null,
    rightHand: convertToCoordinatePairs(rawRightHand) || null
  };
}

function hasEvaluableLandmarks(landmarks: EvaluateLandmarksPayload | null): boolean {
  if (!landmarks) return false;
  return (
    landmarks.pose !== null ||
    landmarks.leftHand !== null ||
    landmarks.rightHand !== null
  );
}

type PhotoSheet = {
  imgSrc: string;
  mode: PhotoPopupMode;
  score?: number;
  errorMessage?: string | null;
  overlay?: PoseOverlayData | null;
};

function collectPopupOverlayData(
  results: Results,
  videoWidth: number,
  videoHeight: number
) {
  const toPixel = (lm: { x: number; y: number }) =>
    toMirroredCanvasPixel(lm, videoWidth, videoHeight);

  return {
    pose: POSE_LANDMARK_INDICES.map((idx) =>
      results.poseLandmarks?.[idx] ? toPixel(results.poseLandmarks[idx]) : null
    ),
    leftHand: Array.from({ length: HAND_LANDMARK_COUNT }, (_, i) =>
      results.leftHandLandmarks?.[i] ? toPixel(results.leftHandLandmarks[i]) : null
    ),
    rightHand: Array.from({ length: HAND_LANDMARK_COUNT }, (_, i) =>
      results.rightHandLandmarks?.[i] ? toPixel(results.rightHandLandmarks[i]) : null
    ),
    sourceSize: { width: videoWidth, height: videoHeight },
  };
}

type GamePageProps = {
  dailyPose: DailyPoseData;
  onExitToMain: () => void;
};

const GamePage = ({ dailyPose, onExitToMain }: GamePageProps) => {
  const cameraRef = useRef<{
    takeScreenshot: () => string | null;
    videoElement?: HTMLVideoElement;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const holisticRef = useRef<ReturnType<typeof InitHolistic> | null>(null);
  const lastLandmarksRef = useRef<EvaluateLandmarksPayload | null>(null);
  const lastOverlayRef = useRef<PhotoSheet["overlay"]>(null);
  const expectCaptureRef = useRef(false);
  const attemptCountRef = useRef(0);

  const [timer, setTimer] = useState(0);
  const [selectedTimer, setSelectedTimer] = useState(3);
  const [photoSheet, setPhotoSheet] = useState<PhotoSheet | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [view, setView] = useState<"game" | "records">("game");

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
        if (w > 0 && h > 0) {
          lastLandmarksRef.current = ApiAdaptor(results);
          lastOverlayRef.current = collectPopupOverlayData(results, w, h);
        } else {
          lastLandmarksRef.current = null;
          lastOverlayRef.current = null;
        }
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
    async (
      image: string,
      attemptNumber: number,
      capturedOverlay: PoseOverlayData | null
    ) => {
      if (!dailyPose.daily_id) {
        setPhotoSheet({
          imgSrc: image,
          mode: "fail",
          errorMessage: "오늘의 문제 정보가 없습니다. 메인에서 다시 시작해 주세요.",
        });
        return;
      }

      const landmarks = lastLandmarksRef.current;
      const overlay = capturedOverlay ?? lastOverlayRef.current;
      if (!landmarks || !hasEvaluableLandmarks(landmarks)) {
        setPhotoSheet({
          imgSrc: image,
          mode: "fail",
          errorMessage:
            "인식된 관절이 없어요! 상체와 손이 카메라 화면에 잘 보이게 서 주세요.",
          overlay,
        });
        return;
      }

      setPhotoSheet({
        imgSrc: image,
        mode: "evaluating",
        overlay,
      });

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
          overlay,
        });

        setPhotoSheet({
          imgSrc: image,
          mode: result.is_passed ? "win" : "fail",
          score: result.score,
          overlay,
        });
      } catch (e) {
        if (MOCK_EVALUATE_WHEN_UNAVAILABLE) {
          const mockScore = Number((Math.random() * 60 + 40).toFixed(1)); // 40.0 ~ 100.0
          const mockPassed = mockScore >= 85;

          appendEvaluateRecord({
            daily_id: dailyPose.daily_id,
            pose_name: dailyPose.pose_name,
            imgSrc: image,
            score: mockScore,
            is_passed: mockPassed,
            attemptNumber,
            recordedAt: new Date().toISOString(),
            overlay,
          });

          setPhotoSheet({
            imgSrc: image,
            mode: mockPassed ? "win" : "fail",
            score: mockScore,
            overlay,
          });
          return;
        }

        const msg =
          e instanceof Error ? e.message : "평가 요청 중 오류가 발생했습니다.";
        setPhotoSheet({
          imgSrc: image,
          mode: "fail",
          errorMessage: msg,
          overlay,
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
    if (timer > 0) return;
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
        const capturedOverlay = lastOverlayRef.current
          ? structuredClone(lastOverlayRef.current)
          : null;
        setAttemptCount(n);
        void runEvaluate(image, n, capturedOverlay);
      }
    }
  }, [timer, runEvaluate]);

  const closePhotoPopup = () => {
    setPhotoSheet(null);
  };

  return (
    <>
      <div className="game-screen" style={{ display: view === "game" ? "flex" : "none" }}>
        {/* Top Header */}
        <header className="game-header">
          <div className="hud-left">
            <button
              id="exit-game-btn"
              type="button"
              className="neo-btn hud-btn"
              onClick={onExitToMain}
            >
              <span>← 나가기</span>
            </button>
          </div>

          <div className="hud-center">
            <div className="mission-sticker">
              <span>🎯</span>
              <span>오늘의 문제 #{dailyPose.daily_id}</span>
            </div>
          </div>

          <div className="hud-right">
            <button
              id="tutorial-btn"
              type="button"
              className="neo-btn hud-btn"
              onClick={() => setPhotoSheet({ imgSrc: "", mode: "tutorial" })}
            >
              <span>💡 룰 보기</span>
            </button>
            <button
              id="records-btn"
              type="button"
              className="neo-btn hud-btn records-btn"
              onClick={() => setView("records")}
            >
              <span>🏆 랭킹</span>
            </button>
          </div>
        </header>

        {/* Camera Viewport Area */}
        <div className="viewport-wrapper">
          <CameraContainer
            ref={cameraRef}
            canvasRef={canvasRef}
            timer={timer}
            selectedTimer={selectedTimer}
            onTimerSelect={setSelectedTimer}
          />
        </div>

        {/* Bottom Controls */}
        <div className="game-controls">
          <button
            id="capture-shutter-btn"
            type="button"
            className="neo-btn shutter-btn"
            onClick={startTimer}
            disabled={timer > 0}
          >
            <span className="shutter-icon">📸</span>
            <span>{timer > 0 ? `준비... ${timer}초` : "포즈 촬영하기"}</span>
          </button>

          {attemptCount > 0 && (
            <span className="attempt-badge">
              총 {attemptCount}번째 시도 중 🎯
            </span>
          )}
        </div>

        {/* Modal Popups */}
        {photoSheet && (
          <PhotoPopup
            imgSrc={photoSheet.imgSrc}
            mode={photoSheet.mode}
            attemptCount={attemptCount}
            score={photoSheet.score}
            overlayData={photoSheet.overlay ?? null}
            errorMessage={photoSheet.errorMessage ?? null}
            onClose={closePhotoPopup}
          />
        )}
      </div>

      {/* Records View Screen */}
      <div style={{ display: view === "records" ? "block" : "none" }}>
        <RecordPage
          dailyId={dailyPose.daily_id}
          onBack={() => setView("game")}
        />
      </div>
    </>
  );
};

export default GamePage;
