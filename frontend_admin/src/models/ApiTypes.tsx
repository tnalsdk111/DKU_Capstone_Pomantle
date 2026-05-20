export interface ApiSuccessEnvelope<T> {
  status: "success";
  message?: string;
  data: T;
}

export interface ApiErrorEnvelope {
  status: "error";
  message: string;
}

// --- createPose ---
export interface VectorPoint {
  x: number;
  y: number;
  z: number;
}

export interface PoseData {
  id: number;
  poseName: string;
  originalImage: string;
  publicImage: string;
  target_vector: VectorPoint[]; // get에서 이 부분은 비워져있음
  createdAt: string;
  usedAt: string;
}