import requests
import random

# 가짜 21개 좌표 생성기 (테스트용)
def generate_fake_landmarks(noise=0.0):
    landmarks = []
    for i in range(21):
        landmarks.append({
            "x": (i * 0.05) + random.uniform(-noise, noise),
            "y": (i * 0.05) + random.uniform(-noise, noise),
            "z": (i * 0.01) + random.uniform(-noise, noise)
        })
    return landmarks

base_url = "http://127.0.0.1:5000"

# DB에 정답 포즈 저장
perfect_pose = generate_fake_landmarks()
post_resp = requests.post(f"{base_url}/api/poses", json={
    "pose_name": "테스트 가위바위보",
    "target_vector": perfect_pose
})
pose_id = post_resp.json()['pose_id']
print(f"[저장 완료] DB 포즈 ID: {pose_id}")

# 조금 틀린 유저의 포즈 쏴서 평가받기
player_pose = generate_fake_landmarks(noise=0.02) # noise를 주어 정답과 아주 조금 다르게 만듦
eval_resp = requests.post(f"{base_url}/api/evaluate", json={
    "pose_id": pose_id,
    "landmarks": player_pose
})

print("[평가 결과]")
print(eval_resp.json())
