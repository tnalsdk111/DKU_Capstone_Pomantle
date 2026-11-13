import React from "react";
import PoseOverlayImage from "../../components/pose/PoseOverlayImage";
import {
  getTopEvaluateRecordsForDaily,
  type StoredEvaluateRecord,
} from "../../utils/gameLocalStorage";
import "./RecordPage.css";

type RecordPageProps = {
  dailyId: number;
  onBack: () => void;
};

function formatTimestamp(isoString: string) {
  try {
    const d = new Date(isoString);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  } catch {
    return "";
  }
}

function RecordRow({
  record,
  rank,
}: {
  record: StoredEvaluateRecord;
  rank: number;
}) {
  const getMedal = (r: number) => {
    switch (r) {
      case 1:
        return "👑";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${r}`;
    }
  };

  const isTopThree = rank <= 3;

  return (
    <li className={`record-card rank-${rank}`}>
      {/* Rank Medal */}
      <div className="rank-badge">
        {isTopThree ? (
          <span className="rank-medal">{getMedal(rank)}</span>
        ) : (
          <span className="rank-text">#{rank}</span>
        )}
      </div>

      {/* Snapshot Thumbnail */}
      <div className="record-thumbnail-wrap">
        {record.imgSrc ? (
          <PoseOverlayImage
            imgSrc={record.imgSrc}
            overlayData={record.overlay ?? null}
            width="100%"
            alt={`Rank ${rank} snapshot`}
            borderRadius="0"
          />
        ) : (
          <span className="no-thumbnail">사진 없음</span>
        )}
      </div>

      {/* Score and Stats */}
      <div className="record-content">
        <div className="score-row">
          <span className="score-num">{record.score.toFixed(1)}%</span>
          <span
            className={`pass-tag ${record.is_passed ? "cleared" : "unreached"}`}
          >
            {record.is_passed ? "클리어 성공! 🎉" : "미달"}
          </span>
        </div>

        {/* Mini progress gauge */}
        <div className="mini-gauge">
          <div
            className="mini-gauge-fill"
            style={{ width: `${Math.min(100, Math.max(0, record.score))}%` }}
          />
        </div>

        <div className="record-meta">
          {record.attemptNumber}번째 시도 • 기록 시각: {formatTimestamp(record.recordedAt)}
        </div>
      </div>
    </li>
  );
}

const RecordPage = ({ dailyId, onBack }: RecordPageProps) => {
  const topRecords = getTopEvaluateRecordsForDaily(dailyId, 5);

  return (
    <div className="records-screen">
      <div className="records-container">
        {/* Header */}
        <div className="records-header">
          <button
            id="back-to-game-btn"
            type="button"
            className="neo-btn back-btn"
            onClick={onBack}
            aria-label="게임 화면으로 돌아가기"
          >
            <span>← 뒤로가기</span>
          </button>

          <div className="records-title-group">
            <h1 className="records-title">
              <span>🏆</span>
              <span>명예의 전당</span>
            </h1>
            <p className="records-subtitle">오늘의 문제 #{dailyId} 최고 기록 Top 5</p>
          </div>

          <div style={{ width: "95px" }} aria-hidden />
        </div>

        {/* Leaderboard Board */}
        <div className="leaderboard-board">
          {topRecords.length === 0 ? (
            <div className="records-empty">
              <span className="empty-icon">📸</span>
              <h3 className="empty-title">아직 기록이 없어요!</h3>
              <p className="empty-desc">
                오늘 시도한 포즈 사진이 없습니다. 지금 바로 첫 번째 포즈를 찍어보세요!
              </p>
            </div>
          ) : (
            <ul className="records-list">
              {topRecords.map((record, index) => (
                <RecordRow
                  key={`${record.recordedAt}-${index}`}
                  record={record}
                  rank={index + 1}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordPage;
