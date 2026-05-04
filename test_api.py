import requests
from datetime import date
import json

BASE_URL = "http://127.0.0.1:5000/api/v1"

# 임의의 21개 랜드마크 데이터 (MediaPipe 형식 모방)
dummy_vector = [{"x": 0.1, "y": 0.2, "z": 0.3} for _ in range(21)]

def print_response(title, response):
    print(f"\n--- {title} ---")
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print(response.text)

def run_tests():
    print("🚀 API 테스트를 시작합니다...")

    # ==========================================
    # [어드민] 1. 새로운 포즈 등록
    # ==========================================
    pose_payload = {
        "poseName": "테스트 나무자세",
        "target_vector": dummy_vector,
        "originalImage": "/images/original_tree.png",
        "publicImage": "/images/public_tree.png"
    }
    res_create_pose = requests.post(f"{BASE_URL}/admin/poses", json=pose_payload)
    print_response("1. 포즈 등록 API (Admin)", res_create_pose)

    # 방금 등록된 포즈들의 목록을 조회해서 방금 만든 포즈의 ID를 가져옵니다.
    res_get_poses = requests.get(f"{BASE_URL}/admin/poses")
    poses = res_get_poses.json().get('data', [])
    if not poses:
        print("❌ 포즈가 등록되지 않아 이후 테스트를 중단합니다.")
        return
    latest_pose_id = poses[0]['id']

    # ==========================================
    # [어드민] 2. 오늘의 포즈 지정 (오늘 날짜로)
    # ==========================================
    today_str = date.today().strftime("%Y-%m-%d")
    daily_payload = {
        "date": today_str,
        "pose_id": latest_pose_id
    }
    res_set_daily = requests.post(f"{BASE_URL}/admin/daily-poses", json=daily_payload)
    print_response("2. 오늘의 포즈 지정 API (Admin)", res_set_daily)

    # ==========================================
    # [사용자] 3. 오늘의 포즈 조회
    # ==========================================
    res_get_daily = requests.get(f"{BASE_URL}/daily-pose")
    print_response("3. 오늘의 포즈 조회 API (User)", res_get_daily)
    
    daily_data = res_get_daily.json().get('data')
    if not daily_data:
        print("❌ 오늘의 포즈를 불러오지 못해 평가 테스트를 중단합니다.")
        return
    daily_id = daily_data['daily_id']

    # ==========================================
    # [사용자] 4. 포즈 유사도 평가
    # ==========================================
    evaluate_payload = {
        "daily_id": daily_id,
        "landmarks": dummy_vector # 정답과 완전히 똑같은 데이터를 보내서 100점이 나오는지 확인
    }
    res_evaluate = requests.post(f"{BASE_URL}/evaluate", json=evaluate_payload)
    print_response("4. 유사도 평가 API (User)", res_evaluate)

if __name__ == "__main__":
    run_tests()