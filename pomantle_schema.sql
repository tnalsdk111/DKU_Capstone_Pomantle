--포즈 데이터 테이블
CREATE TABLE poses (
    pose_id BIGSERIAL PRIMARY KEY,
    pose_name VARCHAR(100) NOT NULL,
    target_vector JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--오늘의 정답 포즈 테이블
CREATE TABLE daily_poses (
    daily_id BIGSERIAL PRIMARY KEY,
    target_date DATE UNIQUE NOT NULL,
    pose_id BIGINT REFERENCES poses(pose_id) ON DELETE CASCADE
);
