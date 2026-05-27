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

// const LIP_LANDMARK_INDICES = [
//   61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
//   78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308,
//   191, 80, 81, 82, 13, 312, 311, 310, 415,
// ];

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

/** 평가 API용 부위별 랜드마크. 해당 부위 인식 실패 시 null */
function collectEvaluateLandmarks(
  results: Results,
  videoWidth: number,
  videoHeight: number
): EvaluateLandmarksPayload {
  const toPixel = (lm: { x: number; y: number }) =>
    toMirroredCanvasPixel(lm, videoWidth, videoHeight);

  const posePoints = POSE_LANDMARK_INDICES.map((idx) => {
    const lm = results.poseLandmarks?.[idx];
    return lm ? toPixel(lm) : null;
  });
  const pose =
    posePoints.every((p): p is [number, number] => p !== null)
      ? posePoints
      : null;

  const collectHand = (
    hand: Results["leftHandLandmarks"]
  ): [number, number][] | null => {
    if (!hand?.length) return null;
    const points = Array.from({ length: HAND_LANDMARK_COUNT }, (_, i) => {
      const lm = hand[i];
      return lm ? toPixel(lm) : null;
    });
    return points.every((p): p is [number, number] => p !== null)
      ? points
      : null;
  };

  // const lipPoints = LIP_LANDMARK_INDICES.map((idx) => {
  //   const lm = results.faceLandmarks?.[idx];
  //   return lm ? toPixel(lm) : null;
  // });
  // const lips =
  //   lipPoints.every((p): p is [number, number] => p !== null)
  //     ? lipPoints
  //     : null;

  return {
    pose,
    leftHand: collectHand(results.leftHandLandmarks),
    rightHand: collectHand(results.rightHandLandmarks),
    // lips,
  };
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
};

function hasEvaluableLandmarks(landmarks: EvaluateLandmarksPayload | null): boolean {
  if (!landmarks) return false;
  return (
    landmarks.pose !== null ||
    landmarks.leftHand !== null ||
    landmarks.rightHand !== null 
    // landmarks.lips !== null
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
    // lips: LIP_LANDMARK_INDICES.flatMap((idx) => {
    //   const lm = results.faceLandmarks?.[idx];
    //   return lm ? [{ idx, point: toPixel(lm) }] : [];
    // }),
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
            "인식된 관절이 없습니다. 상체와 손이 잘 보이게 다시 촬영해 주세요.",
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

  const blurAfterMouseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
  };

  // if (view === "records") {
  //   return (
  //     <RecordPage
  //       dailyId={dailyPose.daily_id}
  //       onBack={() => setView("game")}
  //     />
  //   );
  // }

  return (
    <>
      <div
        style={{
          display: view === "game" ? "flex" : "none",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#F0F0F0",
          gap: "24px",
          paddingTop: "28px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <button
            type="button"
            onClick={() => setPhotoSheet({ imgSrc: "", mode: "tutorial" })}
            onMouseUp={blurAfterMouseClick}
            style={{
              position: "absolute",
              right: "100%",
              top: "12px",
              marginRight: "16px",
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            튜토리얼
          </button>
          <button
            type="button"
            onClick={() => setView("records")}
            onMouseUp={blurAfterMouseClick}
            style={{
              position: "absolute",
              left: "100%",
              top: "12px",
              marginLeft: "16px",
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            기록
          </button>
          <CameraContainer
            ref={cameraRef}
            canvasRef={canvasRef}
            timer={timer}
            selectedTimer={selectedTimer}
            onTimerSelect={setSelectedTimer}
          />
        </div>

        <button
          type="button"
          onClick={startTimer}
          onMouseUp={blurAfterMouseClick}
          style={{ padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}
        >
          촬영 시작
        </button>

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
      {/* ─── [RECORDS VIEW] ─── */}
      {/* 기록 페이지도 DOM에 항상 유지하되, view가 records일 때만 보이도록 합니다 */}
      <div style={{ display: view === "records" ? "block" : "none" }}>
        <RecordPage
          dailyId={dailyPose.daily_id}
          onBack={() => setView("game")} // 다시 게임으로 복귀
        />
      </div>
    </>
    
  );
};

export default GamePage;
