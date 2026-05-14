export interface ApiSuccessEnvelope<T> {
  status: "success";
  message?: string;
  data: T;
}

export interface ApiErrorEnvelope {
  status: "error";
  message: string;
}

// --- getPoses ---
export interface PoseListItem {
  id: number;
  poseName: string;
  originalImage: string;
  publicImage: string;
  createdAt: string;
  usedAt: string;
}

// --- createPose ---
export interface VectorPoint {
  x: number;
  y: number;
  z: number;
}

export interface CreatePoseRequest {
  poseName: string;
  target_vector: VectorPoint[];
  originalImage: string; // 이미지 경로나 Base64 문자열
  publicImage: string;
}