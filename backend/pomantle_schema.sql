-- 1. Pose 테이블 생성 (정답 포즈 데이터 저장)
CREATE TABLE poses (
    pose_id BIGSERIAL PRIMARY KEY,           -- 자동 증가하는 큰 정수형 ID
    pose_name VARCHAR(100) NOT NULL,        -- 포즈 이름
    target_vector JSONB NOT NULL,           -- 평가용: 캔버스 픽셀 [[u,v], ...] JSON 배열
    original_image VARCHAR(255),            -- 어드민 원본 이미지 경로
    public_image VARCHAR(255),              -- 사용자용 공개 이미지 경로
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') -- 생성 시간
);

-- 2. DailyPose 테이블 생성 (날짜별 오늘의 포즈 지정)
CREATE TABLE daily_poses (
    daily_id BIGSERIAL PRIMARY KEY,         -- 오늘의 포즈 고유 ID
    target_date DATE UNIQUE NOT NULL,       -- 날짜 (하루에 하나의 포즈만 가능하므로 UNIQUE)
    pose_id BIGINT,                         -- poses 테이블을 참조하는 외래키
    
    -- 외래키 제약 조건: 원본 포즈가 삭제되면 연결된 데일리 포즈도 함께 삭제됨
    CONSTRAINT fk_pose 
        FOREIGN KEY(pose_id) 
        REFERENCES poses(pose_id) 
        ON DELETE CASCADE
);
