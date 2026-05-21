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

type RecordsBucket = {
  /** 로컬(브라우저) 기준 YYYY-MM-DD — 이 날짜가 바뀌면 records 초기화 */
  storageDate: string;
  records: StoredEvaluateRecord[];
};

function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isRecordFromLocalDay(record: StoredEvaluateRecord, dateKey: string): boolean {
  const parsed = new Date(record.recordedAt);
  if (Number.isNaN(parsed.getTime())) return false;
  return getLocalDateKey(parsed) === dateKey;
}

function loadRecordsBucket(): RecordsBucket {
  const today = getLocalDateKey();

  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) {
      return { storageDate: today, records: [] };
    }

    const parsed: unknown = JSON.parse(raw);

    // 예전 형식: 배열만 저장되어 있던 경우
    if (Array.isArray(parsed)) {
      const records = parsed.filter(
        (item): item is StoredEvaluateRecord =>
          typeof item === "object" &&
          item !== null &&
          isRecordFromLocalDay(item as StoredEvaluateRecord, today)
      );
      const bucket = { storageDate: today, records };
      saveRecordsBucket(bucket);
      return bucket;
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "storageDate" in parsed &&
      "records" in parsed &&
      Array.isArray((parsed as RecordsBucket).records)
    ) {
      const bucket = parsed as RecordsBucket;
      if (bucket.storageDate !== today) {
        const empty = { storageDate: today, records: [] };
        saveRecordsBucket(empty);
        return empty;
      }
      return { storageDate: today, records: bucket.records };
    }
  } catch (e) {
    console.warn("로컬 기록 로드 실패", e);
  }

  const empty = { storageDate: today, records: [] };
  saveRecordsBucket(empty);
  return empty;
}

function saveRecordsBucket(bucket: RecordsBucket): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(bucket));
}

export function appendEvaluateRecord(payload: StoredEvaluateRecord): void {
  try {
    const bucket = loadRecordsBucket();
    bucket.records.push(payload);
    saveRecordsBucket(bucket);
  } catch (e) {
    console.warn("로컬 기록 저장 실패", e);
  }
}

export function getEvaluateRecordsForDaily(dailyId: number): StoredEvaluateRecord[] {
  try {
    const bucket = loadRecordsBucket();
    return bucket.records.filter((record) => record.daily_id === dailyId);
  } catch (e) {
    console.warn("로컬 기록 조회 실패", e);
    return [];
  }
}

/** 유사도 점수 기준 상위 N개 (동점이면 최근 촬영 순) */
export function getTopEvaluateRecordsForDaily(
  dailyId: number,
  limit = 5
): StoredEvaluateRecord[] {
  return getEvaluateRecordsForDaily(dailyId)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );
    })
    .slice(0, limit);
}


