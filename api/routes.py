from flask import Blueprint, request, jsonify
from database.dbHandler import save_pose_to_db, get_pose_by_id
from services.dataProcessing import json_vector
from services.similarity import cos_sim

# Blueprint 객체 생성
api_bp = Blueprint('api', __name__)

@api_bp.route('/poses', methods=['POST'])
def add_pose():
    data = request.get_json()
    new_pose = save_pose_to_db(data['pose_name'], data['target_vector'])
    return jsonify({"message": "정답 포즈 저장 완료!", "pose_id": new_pose.pose_id}), 201


@api_bp.route('/evaluate', methods=['POST'])
def evaluate_pose():
    data = request.get_json()
    
    pose_id = data.get('pose_id')
    player_landmarks = data.get('landmarks')

    target_pose = get_pose_by_id(pose_id)
    if not target_pose:
        return jsonify({"error": "해당 포즈를 DB에서 찾을 수 없습니다."}), 404

    try:
        answer_landmarks = target_pose.target_vector

        # 각각 벡터로 변환
        answer_vector = json_vector(answer_landmarks)
        player_vector = json_vector(player_landmarks)

        # 코사인 유사도 측정
        similarity_score = cos_sim(answer_vector, player_vector)
        
        percent_score = round(similarity_score * 100, 2)
        is_passed = bool(percent_score >= 85.0) 

        return jsonify({
            "score": percent_score,
            "is_passed": is_passed,
            "message": f"일치도: {percent_score}%"
        }), 200

    except Exception as e:
        return jsonify({"error": "데이터 처리 중 오류 발생", "details": str(e)}), 400