/** GET /daily-pose 성공 시 data 필드 */
export interface DailyPoseData {
  daily_id: number;
  pose_id: number;
  pose_name: string;
  originalImage: string;
  publicImage: string;
}

/** POST /evaluate 성공 시 data 필드 */
export interface EvaluateResultData {
  score: number;
  is_passed: boolean;
}

export interface ApiSuccessEnvelope<T> {
  status: "success";
  data: T;
}

export interface ApiErrorEnvelope {
  status: "error";
  message: string;
}
