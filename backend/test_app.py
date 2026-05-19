import unittest
import json

# ⚠️ 주의: 프로젝트의 실제 구조에 맞게 import 경로를 수정해 주세요.
# 예: app.py 파일에 Flask 앱 객체(app)와 SQLAlchemy 객체(db)가 있다고 가정
from app import app, db 
from services.dataProcessing import parse_pixel_landmarks

class PoseGameTestCase(unittest.TestCase):
    def setUp(self):
        """테스트가 실행되기 전, 가상의 메모리 DB와 테스트 클라이언트를 세팅합니다."""
        app.config['TESTING'] = True
        # 실제 DB를 건드리지 않도록 가상의 메모리 DB 사용
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' 
        self.client = app.test_client()
        
        with app.app_context():
            db.create_all()
            
    def tearDown(self):
        """테스트가 끝난 후 DB를 정리합니다."""
        with app.app_context():
            db.session.remove()
            db.drop_all()

    # ==========================================
    # 1. 단위 테스트 (Unit Test): 파싱 및 동적 매칭 로직 검증
    # ==========================================
    def test_parse_pixel_landmarks_dynamic_matching(self):
        """null 값인 부위는 안전하게 제외하고 딕셔너리를 반환하는지 테스트"""
        raw_data = {
            "pose": [[120.0, 240.0], [125.0, 245.0]],
            "leftHand": None,  # 감지 안 됨
            "rightHand": [[10.0, 20.0]],
            "lips": None
        }
        
        result = parse_pixel_landmarks(raw_data)
        
        # 1. 결과가 정상적으로 나왔는가?
        self.assertIsNotNone(result)
        # 2. 존재하는 부위(pose, rightHand)는 딕셔너리에 들어있는가?
        self.assertIn("pose", result)
        self.assertIn("rightHand", result)
        # 3. null이었던 부위(leftHand, lips)는 깔끔하게 무시되었는가? (동적 매칭 핵심!)
        self.assertNotIn("leftHand", result)
        self.assertNotIn("lips", result)
        # 4. 데이터 갯수는 유지되었는가?
        self.assertEqual(len(result["pose"]), 2)

    # ==========================================
    # 2. 통합 테스트 (Integration Test): API 엔드포인트 검증
    # ==========================================
    def test_pose_registration_and_evaluation(self):
        """어드민 포즈 등록 -> 일일 지정 -> 유저 평가 API 흐름 테스트"""
        
        # [STEP A] 어드민: 신규 포즈 등록 (POST /api/v1/admin/poses)
        admin_payload = {
            "poseName": "테스트 나무자세",
            "target_vector": {
                "pose": [[0.1, 0.2], [0.15, 0.25]],
                "leftHand": [[0.05, 0.1]], 
                "rightHand": None,
                "lips": None
            },
            "originalImage": "data:image/png;base64,test",
            "publicImage": "data:image/jpeg;base64,test"
        }
        
        post_res = self.client.post('/api/v1/admin/poses', json=admin_payload)
        self.assertEqual(post_res.status_code, 201)
        
        # 🌟 [STEP B] 일일 포즈 지정 (POST /api/v1/admin/daily-poses)
        # 방금 등록한 포즈(pose_id=1)를 오늘 날짜의 문제(daily_pose)로 지정합니다.
        daily_payload = {
            "date": "2026-05-19",
            "pose_id": 1
        }
        daily_res = self.client.post('/api/v1/admin/daily-poses', json=daily_payload)
        self.assertEqual(daily_res.status_code, 200) # 달력 지정 성공 확인
        
        # [STEP C] 유저: 포즈 유사도 평가 (POST /api/v1/evaluate)
        # 이제 daily_id: 1 이 정상적으로 존재하므로 404가 뜨지 않습니다!
        user_payload = {
            "daily_id": 1, 
            "landmarks": {
                "pose": [[0.11, 0.21], [0.14, 0.26]],
                "leftHand": None, # 🚨 유저는 왼손 인식을 실패함 (동적 매칭 테스트)
                "rightHand": None,
                "lips": None
            }
        }
        
        eval_res = self.client.post('/api/v1/evaluate', json=user_payload)
        
        # 404가 아닌 200 OK가 제대로 떨어지는지 확인
        self.assertEqual(eval_res.status_code, 200)
        eval_data = eval_res.get_json()
        self.assertEqual(eval_data['status'], 'success')
        
        # 응답 데이터 검증
        self.assertIn('score', eval_data['data'])
        self.assertIn('is_passed', eval_data['data'])

if __name__ == '__main__':
    unittest.main()