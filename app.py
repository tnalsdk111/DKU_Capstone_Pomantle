from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
import numpy as np

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1772580@localhost:1772/pomantle_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- 데이터베이스 모델 ---
class Pose(db.Model):
    __tablename__ = 'poses'
    pose_id = db.Column(db.BigInteger, primary_key=True)
    pose_name = db.Column(db.String(100), nullable=False)
    target_vector = db.Column(JSONB, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DailyPose(db.Model):
    __tablename__ = 'daily_poses'
    daily_id = db.Column(db.BigInteger, primary_key=True)
    target_date = db.Column(db.Date, unique=True, nullable=False)
    pose_id = db.Column(db.BigInteger, db.ForeignKey('poses.pose_id', ondelete='CASCADE'))

with app.app_context():
    db.create_all()

# --- 코사인 유사도 계산 ---
finger_path = [[0,1,2,3,4], [0,5,6,7,8], [0,9,10,11,12], [0,13,14,15,16], [0,17,18,19,20]]

def cos_sim(a, b):
    # 길이가 0인 벡터로 인한 0 나누기 에러 방지
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return np.dot(a, b) / (norm_a * norm_b)

def json_vector(json_data):
    vector = []
    for path in finger_path:
        for i in range(0, len(path)-1):
            start = path[i]
            end = path[i+1]

            dx = json_data[end]['x'] - json_data[start]['x']
            dy = json_data[end]['y'] - json_data[start]['y']
            dz = json_data[end]['z'] - json_data[start]['z']

            vector.append([dx, dy, dz])

    return np.array(vector).flatten()


# --- API ---

# 포즈 저장(DB에 정답 데이터를 x,y,z로 저장)
@app.route('/api/poses', methods=['POST'])
def add_pose():
    data = request.get_json()
    new_pose = Pose(
        pose_name=data['pose_name'],
        target_vector=data['target_vector'] # 여기서 21개의 x,y,z 리스트를 통째로 저장합니다.
    )
    db.session.add(new_pose)
    db.session.commit()
    return jsonify({"message": "정답 포즈 저장 완료!", "pose_id": new_pose.pose_id}), 201


# 유사도 측정
@app.route('/api/evaluate', methods=['POST'])
def evaluate_pose():
    data = request.get_json()
    
    pose_id = data.get('pose_id') # 비교할 대상 포즈의 ID
    player_landmarks = data.get('landmarks') # 프론트엔드가 보낸 관절 좌표 리스트

    # DB에서 정답 포즈 꺼내기
    target_pose = Pose.query.get(pose_id)
    if not target_pose:
        return jsonify({"error": "해당 포즈를 DB에서 찾을 수 없습니다."}), 404

    try:
        # DB에 저장된 정답 좌표 데이터
        answer_landmarks = target_pose.target_vector

        # 각각 벡터로 변환
        answer_vector = json_vector(answer_landmarks)
        player_vector = json_vector(player_landmarks)

        # 코사인 유사도 측정
        similarity_score = cos_sim(answer_vector, player_vector)
        
        # 퍼센트(%)로 변환 후 소수점 2자리까지만 자르기
        percent_score = round(similarity_score * 100, 2)

        # 결과 돌려주기
        is_passed = bool(percent_score >= 85.0) 

        return jsonify({
            "score": percent_score,
            "is_passed": is_passed,
            "message": f"일치도: {percent_score}%"
        }), 200

    except Exception as e:
        return jsonify({"error": "데이터 처리 중 오류 발생", "details": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
