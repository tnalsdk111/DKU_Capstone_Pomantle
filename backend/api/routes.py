"""
/api/v1 — 프론트 계약
- GET  /daily-pose     (DB: 오늘 날짜 DailyPose + Pose)
- POST /evaluate       body: { "daily_id": int, "landmarks": [[u,v], ...] }
- POST /save-record

정답 랜드마크는 poses.target_vector(JSONB)에 캔버스 픽셀 쌍 [[u,v], ...] 로 저장해야 합니다.
"""

from __future__ import annotations

from datetime import date

from flask import Blueprint, jsonify, request

from database.dbHandler import get_pose_by_id
from database.dbTable import DailyPose
from services import dataProcessing, similarity

api_v1_bp = Blueprint("api_v1", __name__)


@api_v1_bp.route("/daily-pose", methods=["GET"])
def get_daily_pose():
    today_pose = DailyPose.query.filter_by(target_date=date.today()).first()

    if not today_pose:
        return (
            jsonify(
                status="error",
                message="오늘의 포즈가 아직 설정되지 않았습니다.",
            ),
            404,
        )

    pose_info = get_pose_by_id(today_pose.pose_id)
    if not pose_info:
        return (
            jsonify(
                status="error",
                message="오늘의 포즈가 아직 설정되지 않았습니다.",
            ),
            404,
        )

    return (
        jsonify(
            status="success",
            data={
                "daily_id": today_pose.daily_id,
                "pose_id": pose_info.pose_id,
                "pose_name": pose_info.pose_name,
                "originalImage": pose_info.original_image,
                "publicImage": pose_info.public_image,
            },
        ),
        200,
    )


@api_v1_bp.route("/evaluate", methods=["POST"])
def evaluate_pose():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return (
            jsonify(status="error", message="필수 데이터가 누락되었습니다."),
            400,
        )

    daily_id = data.get("daily_id")
    player_landmarks = data.get("landmarks")

    if daily_id is None or player_landmarks is None:
        return (
            jsonify(status="error", message="필수 데이터가 누락되었습니다."),
            400,
        )

    try:
        daily_id_int = int(daily_id)
    except (TypeError, ValueError):
        return (
            jsonify(status="error", message="필수 데이터가 누락되었습니다."),
            400,
        )

    daily_pose = DailyPose.query.get(daily_id_int)
    if not daily_pose:
        return (
            jsonify(status="error", message="유효하지 않은 문제 ID입니다."),
            404,
        )

    target_pose = get_pose_by_id(daily_pose.pose_id)
    if not target_pose:
        return (
            jsonify(status="error", message="유효하지 않은 문제 ID입니다."),
            404,
        )

    landmarks = dataProcessing.parse_pixel_landmarks(player_landmarks)
    if landmarks is None:
        return (
            jsonify(status="error", message="필수 데이터가 누락되었습니다."),
            400,
        )

    ref = dataProcessing.parse_pixel_landmarks(target_pose.target_vector)
    if ref is None:
        return (
            jsonify(
                status="error",
                message="유사도 계산 중 문제가 발생하였습니다.",
            ),
            500,
        )

    try:
        score, is_passed = similarity.evaluate_against_reference(landmarks, ref)
    except Exception:
        return (
            jsonify(
                status="error",
                message="유사도 계산 중 문제가 발생하였습니다.",
            ),
            500,
        )

    return (
        jsonify(
            status="success",
            data={"score": score, "is_passed": is_passed},
        ),
        200,
    )


@api_v1_bp.route("/save-record", methods=["POST"])
def save_record():
    record_data = request.get_json(silent=True)
    print(f"받은 데이터: {record_data}")
    return (
        jsonify(
            status="success",
            message="데이터가 무사히 서버에 도착했습니다.",
        ),
        200,
    )
