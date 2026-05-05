const RECORDS_KEY = "pomantle_evaluate_records";

export type StoredEvaluateRecord = {
  daily_id: number;
  pose_name: string;
  imgSrc: string;
  score: number;
  is_passed: boolean;
  attemptNumber: number;
  recordedAt: string;
};

export function appendEvaluateRecord(
  payload: StoredEvaluateRecord
): void {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    const list: StoredEvaluateRecord[] = raw ? JSON.parse(raw) : [];
    list.push(payload);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("로컬 기록 저장 실패", e);
  }
}

export function resolveImageUrl(serverPath: string, origin: string): string {
  if (!serverPath) return "";
  if (serverPath.startsWith("http")) return serverPath;
  const base = origin.replace(/\/$/, "");
  const path = serverPath.startsWith("/") ? serverPath : `/${serverPath}`;
  return `${base}${path}`;
}
