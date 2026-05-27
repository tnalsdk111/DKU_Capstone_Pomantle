import React from "react";
import PoseOverlayImage from "../../components/pose/PoseOverlayImage";
import {
  getTopEvaluateRecordsForDaily,
  type StoredEvaluateRecord,
} from "../../utils/gameLocalStorage";

const CONTENT_WIDTH = "clamp(640px, 72vw, 980px)";
const DEV_SIMILARITY_DESCRIPTION = "유사도 설명입니다";

type RecordPageProps = {
  dailyId: number;
  onBack: () => void;
};

function RecordRow({
  record,
  rank,
}: {
  record: StoredEvaluateRecord;
  rank: number;
}) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        listStyle: "none",
        padding: "12px 0",
        borderBottom: "1px solid #E0E0E0",
      }}
    >
      <div
        style={{
          flex: "0 0 42%",
          maxWidth: "320px",
          aspectRatio: "4 / 3",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#DDD",
        }}
      >
        {record.imgSrc ? (
          <PoseOverlayImage
            imgSrc={record.imgSrc}
            overlayData={record.overlay ?? null}
            width="100%"
            alt={`유사도 ${rank}위 촬영 사진`}
            borderRadius="0"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              fontSize: "14px",
            }}
          >
            이미지 없음
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "8px",
          minWidth: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "36px",
            fontWeight: 800,
            color: "#222",
            lineHeight: 1.1,
          }}
        >
          {record.score.toFixed(1)}%
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            color: "#555",
            lineHeight: 1.4,
          }}
        >
          {DEV_SIMILARITY_DESCRIPTION}
        </p>
      </div>
    </li>
  );
}

const RecordPage = ({ dailyId, onBack }: RecordPageProps) => {
  const topRecords = getTopEvaluateRecordsForDaily(dailyId, 5);

  const blurAfterMouseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F0F0F0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "28px",
        paddingBottom: "40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: CONTENT_WIDTH,
          maxWidth: "100%",
          boxSizing: "border-box",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onBack}
            onMouseUp={blurAfterMouseClick}
            aria-label="게임 화면으로 돌아가기"
            style={{
              flexShrink: 0,
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "1px solid #CCC",
              backgroundColor: "#FFF",
              color: "#222",
              fontSize: "22px",
              lineHeight: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            ←
          </button>
          <h1
            style={{
              flex: 1,
              margin: 0,
              textAlign: "center",
              fontSize: "clamp(28px, 3vw, 40px)",
              fontWeight: 800,
              color: "#222",
            }}
          >
            기록 조회 화면
          </h1>
          <div style={{ width: "44px", flexShrink: 0 }} aria-hidden />
        </div>

        <div
          style={{
            backgroundColor: "#FFF",
            borderRadius: "20px",
            padding: "20px 24px",
            boxSizing: "border-box",
            minHeight: "480px",
          }}
        >
          {topRecords.length === 0 ? (
            <div
              style={{
                minHeight: "440px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  textAlign: "center",
                  color: "#666",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                기록이 없습니다
              </p>
            </div>
          ) : (
            <ul style={{ margin: 0, padding: 0 }}>
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
