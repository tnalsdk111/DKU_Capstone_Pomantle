import type { DailyPoseData } from "../models/ApiTypes";

/**
 * 백엔드가 없거나 오늘의 포즈가 없을 때도 로딩을 통과시키려면 true(기본).
 * 실서버·통합 테스트에서는 `.env`에
 * `REACT_APP_SKIP_DAILY_POSE_WHEN_UNAVAILABLE=false` 를 넣어 검증하세요.
 */
export const SKIP_DAILY_POSE_WHEN_UNAVAILABLE =
  process.env.REACT_APP_SKIP_DAILY_POSE_WHEN_UNAVAILABLE == "false";

/**
 * 개발 중 evaluate API가 실패해도 임의 점수로 결과를 보고 싶으면 true(기본).
 * 실서버 검증에서는 `.env`에
 * `REACT_APP_MOCK_EVALUATE_WHEN_UNAVAILABLE=false` 를 넣어 끄세요.
 */
export const MOCK_EVALUATE_WHEN_UNAVAILABLE =
  process.env.REACT_APP_MOCK_EVALUATE_WHEN_UNAVAILABLE == "false";

/** SKIP 시 evaluate 등에 쓰는 목업 daily (백엔드 없이 개발용) */
export const DEV_FALLBACK_DAILY_POSE: DailyPoseData = {
  daily_id: 1,
  pose_id: 1,
  pose_name: "(개발 모드) 포즈 API 없음",
  originalImage: "/images/original_tree.png",
  publicImage: "/images/public_tree.png",
};
