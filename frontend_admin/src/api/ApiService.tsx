import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../constants/ApiConfig";
import type {
  ApiErrorEnvelope,
  ApiSuccessEnvelope,
  CreatePoseRequest,
  PoseListItem,
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
    if (!ApiService.instance) ApiService.instance = new ApiService();
    
    return ApiService.instance;
  }

  async getPoses(): Promise<PoseListItem[]> { // 모든 데이터 가져오기
    try{ // /poses에 접근
        const response = await axios.get<ApiSuccessEnvelope<PoseListItem[]> | ApiErrorEnvelope>(`${API_BASE_URL}/poses`);
        const body = response.data; // 접근해서 받아온 데이터

        if(body.status === "success") return body.data; // 성공이면 그대로 반환
        throw new Error(
            isApiErrorBody(body) ? body.message : "포즈 목록을 불러오지 못했습니다." // 에러처리
        );
    } catch(e){
        if(axios.isAxiosError(e)){
            const msg = e.response?.data?.message;
            throw new Error(msg || "서버 문제로 포즈 목록 불러오기 실패");
        }
        throw e;
    }
  }

  async createPose(poseData: CreatePoseRequest): Promise<void> { // 데이터 생성
    try{
        const response = await axios.post<ApiSuccessEnvelope<null> | ApiErrorEnvelope>( // 데이터 보내기
            `${API_BASE_URL}/poses`,
            poseData
        );

        const body = response.data; // 데이터 보내고나서 온 응답

        if(body.status === 'success'){ // 성공
            console.log("포즈 등록 성공");
            return;
        }
        
        throw new Error(
            isApiErrorBody(body) ? body.message : "포즈 등록에 실패했습니다."
        );
    } catch (e){
        if(axios.isAxiosError(e)){
            const serverMessage = e.response?.data?.message;
            throw new Error(serverMessage || "서버 통신 중 오류가 발생했습니다.");
        }
        throw e;
    }
  }

  async deletePose(poseId: number): Promise<void>{ // 데이터 삭제
    try{
        const response = await axios.delete<ApiSuccessEnvelope<null> | ApiErrorEnvelope>(
            `${API_BASE_URL}/poses/${poseId}`
        );
        const body = response.data;

        if (body.status === "success"){
            console.log(`포즈(ID: ${poseId}) 삭제 성공`);
            return;
        }

        throw new Error(
            isApiErrorBody(body) ? body.message : "포즈 삭제에 실패했습니다."
        );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const serverMessage = e.response?.data?.message;
        throw new Error(serverMessage || "서버 통신 중 오류가 발생했습니다.");
      }
      throw e;
    }
  }

  async getDailyPoseByData(date: string): Promise<PoseListItem> { // 특정 날짜의 데이터 가져오기
    try{
        const response = await axios.get<ApiSuccessEnvelope<PoseListItem> | ApiErrorEnvelope>(
            `${API_BASE_URL}/daily-poses`,
            { params: { date } } // ?date=yyyy-mm-dd 형태로 전달
        );
        const body = response.data;

        if (body.status === "success") {
            return body.data; // 포즈 배열 반환
        }

        throw new Error(
            isApiErrorBody(body) ? body.message : "날짜별 포즈를 불러오지 못했습니다."
        );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const serverMessage = e.response?.data?.message;
        throw new Error(serverMessage || "서버 통신 중 오류가 발생했습니다.");
      }
      throw e;
    }
  }

  async assignPoseToDate(date: string, poseId: number): Promise<string> { // 특정 날짜에 데이터 할당
    try {
      const response = await axios.post<ApiSuccessEnvelope<null> | ApiErrorEnvelope>(
        `${API_BASE_URL}/daily-poses`,
        {
          date: date,
          pose_id: poseId
        }
      );

      const body = response.data;

      if (body.status === "success") {
        return body.message || "해당 날짜의 포즈가 수정되었습니다.";
      }

      throw new Error(
        isApiErrorBody(body) ? body.message : "포즈 지정에 실패했습니다."
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const serverMessage = e.response?.data?.message;
        throw new Error(serverMessage || "서버 통신 중 오류가 발생했습니다.");
      }
      throw e;
    }
  }

  async unassignPoseFromDate(date: string): Promise<void> { // 특정 날짜 데이터 할당 취소
    try {
      const response = await axios.delete<ApiSuccessEnvelope<null> | ApiErrorEnvelope>(
        `${API_BASE_URL}/daily-poses/${date}`
      );

      const body = response.data;

      if (body.status === "success") {
        console.log(`${date} 포즈 지정 취소 성공`);
        return;
      }

      throw new Error(
        isApiErrorBody(body) ? body.message : "지정 취소에 실패했습니다."
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const serverMessage = e.response?.data?.message;
        throw new Error(serverMessage || "서버 통신 중 오류가 발생했습니다.");
      }
      throw e;
    }
  }
}

export default ApiService;
