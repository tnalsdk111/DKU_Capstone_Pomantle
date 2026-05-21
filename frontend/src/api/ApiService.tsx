import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../constants/ApiConfig";
import type {
  ApiErrorEnvelope,
  ApiSuccessEnvelope,
  DailyPoseData,
  EvaluateLandmarksPayload,
  EvaluateResultData,
} from "../models/ApiTypes";

function isApiErrorBody(x: unknown): x is ApiErrorEnvelope {
  return (
    typeof x === "object" &&
    x !== null &&
    (x as ApiErrorEnvelope).status === "error" &&
    typeof (x as ApiErrorEnvelope).message === "string"
  );
}

class ApiService {
  private static instance: ApiService;

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async getDailyPose(): Promise<DailyPoseData> {
    const response = await axios.get<ApiSuccessEnvelope<DailyPoseData> | ApiErrorEnvelope>(
      `${API_BASE_URL}/daily-pose`
    );
    const body = response.data;
    if (body.status === "success") {
      return body.data;
    }
    throw new Error(isApiErrorBody(body) ? body.message : "오늘의 포즈를 불러오지 못했습니다.");
  }

  async evaluate(
    dailyId: number,
    landmarks: EvaluateLandmarksPayload
  ): Promise<EvaluateResultData> {
    console.log("API 요청 - dailyId:", dailyId, "landmarks:", landmarks);
    try {
      const response = await axios.post<
        ApiSuccessEnvelope<EvaluateResultData> | ApiErrorEnvelope
      >(`${API_BASE_URL}/evaluate`, {
        daily_id: dailyId,
        landmarks,
      });
      const body = response.data;
      if (body.status === "success") {
        return body.data;
      }
      throw new Error(isApiErrorBody(body) ? body.message : "평가에 실패했습니다.");
    } catch (e) {
      const ax = e as AxiosError<ApiErrorEnvelope>;
      const msg = ax.response?.data?.message;
      if (msg) throw new Error(msg);
      throw e;
    }
  }

  /** 기존 코드 호환 (서버에 저장하는 용도가 있다면 유지) */
  async saveRecord(record: unknown) {
    try {
      const response = await axios.post(`${API_BASE_URL}/save-record`, record);
      return response.data;
    } catch (error) {
      console.error("서버 저장 실패: ", error);
      throw error;
    }
  }
}

export default ApiService;
