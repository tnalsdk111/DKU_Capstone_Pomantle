from flask import Blueprint, request, jsonify
from database.dbHandler import get_pose_by_id
from services.dataProcessing import json_vector
from services.similarity import cos_sim
from database.dbTable import DailyPose
from datetime import date

api_v1_bp = Blueprint('api_v1', __name__)

#오늘의 포즈 조회 API
@api_v1_bp.route('/daily-pose', methods=['GET'])
def get_daily_pose():
    # 오늘 날짜에 해당하는 포즈 찾기
    today_pose = DailyPose.query.filter_by(target_date=date.today()).first()
    
    if not today_pose:
        return jsonify({"status": "error", "message": "오늘의 포즈가 아직 설정되지 않았습니다."}), 404
    
    pose_info = get_pose_by_id(today_pose.pose_id)
    return jsonify({
        "status": "success",
        "data": {
            "daily_id": today_pose.daily_id,
            "pose_id": pose_info.pose_id,
            "pose_name": pose_info.pose_name
        }
    }), 200

#유사도 평가 API
@api_v1_bp.route('/evaluate', methods=['POST'])
def evaluate_pose():
    data = request.get_json()
    daily_id = data.get('daily_id') 
    player_landmarks = data.get('landmarks')

    # 데이터 누락 방어
    if not daily_id or not player_landmarks:
        return jsonify({"status": "error", "message": "필수 데이터가 누락되었습니다."}), 400

    daily_pose = DailyPose.query.get(daily_id)
    if not daily_pose:
        return jsonify({"status": "error", "message": "유효하지 않은 문제 ID입니다."}), 404
    
    target_pose = get_pose_by_id(daily_pose.pose_id)

    try:
        # 유사도 계산
        answer_vector = json_vector(target_pose.target_vector)
        player_vector = json_vector(player_landmarks)
        similarity_score = cos_sim(answer_vector, player_vector)
        
        percent_score = round(similarity_score * 100, 2)

        #응답
        return jsonify({
            "status": "success",
            "data": {
                "score": percent_score,
                "is_passed": bool(percent_score >= 85.0)
            }
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500