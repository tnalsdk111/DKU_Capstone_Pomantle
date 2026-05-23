"""
부위별 랜드마크 JSON(dict) 기준 유사도.
{ "pose": [[u,v],...], "leftHand": ..., "rightHand": ..., "lips": ... }
"""

from __future__ import annotations

import math
from typing import Dict, List, Mapping, Sequence, Tuple

PASS_THRESHOLD = 85.0

LandmarkGroups = Dict[str, List[List[float]]]

weight = {'POSE' : 10, 'HAND' : 35, 'LEFTELBOW' : 10, 'RIGHTELBOW' : 10} # HAND는 2번 적용됨

pose_index = [
    [1, 0, 2],   # 왼쪽 어깨 각도 (오른쪽어깨 -> 왼쪽어깨 -> 왼쪽팔꿈치)
    [0, 1, 3]    # 오른쪽 어깨 각도 (왼쪽어깨 -> 오른쪽어깨 -> 오른쪽팔꿈치)
]

hand_index = [
    [4, 3, 2], [3, 2, 1],        # 엄지
    [8, 7, 6], [7, 6, 5],        # 검지
    [12, 11, 10], [11, 10, 9],   # 중지
    [16, 15, 14], [15, 14, 13],  # 약지
    [20, 19, 18], [19, 18, 17]   # 새끼
]

elbow_index = [ 
    [0, 2, 0],    # 왼쪽 팔꿈치:   [왼손목(hand[0]), 왼팔꿈치(pose[2] - 꼭짓점), 왼어깨(pose[0])]
    [0, 3, 1]     # 오른쪽 팔꿈치: [오손목(hand[0]), 오팔꿈치(pose[3] - 꼭짓점), 오어깨(pose[1])]
]

def CalculateWristRotationScore(user_hand, answer_hand) -> float:
    """[트랙 1] 손목 회전 (Roll) 검사"""
    u_v = [user_hand[9][0] - user_hand[0][0], user_hand[9][1] - user_hand[0][1]]
    a_v = [answer_hand[9][0] - answer_hand[0][0], answer_hand[9][1] - answer_hand[0][1]]
    
    dot = u_v[0]*a_v[0] + u_v[1]*a_v[1]
    mag_u = math.sqrt(u_v[0]**2 + u_v[1]**2)
    mag_a = math.sqrt(a_v[0]**2 + a_v[1]**2)
    
    if mag_u == 0 or mag_a == 0: return 0.0
    
    cosine_val = max(-1.0, min(1.0, dot / (mag_u * mag_a)))
    angle_diff = math.degrees(math.acos(cosine_val))
    return 1.0 - (angle_diff / 180.0)

def CalculateHandPlaneScore(user_hand, answer_hand) -> float:
    """[트랙 2] 손바닥 평면 상태 스펙트럼 (Yaw) 검사"""
    def get_signed_angle(hand):
        p0, p5, p17 = hand[0], hand[5], hand[17]
        v1 = [p5[0] - p0[0], p5[1] - p0[1]]
        v2 = [p17[0] - p0[0], p17[1] - p0[1]]
        
        # 내적(dot)과 외적(cross)을 atan2에 넣으면 부호가 있는 정확한 사잇각이 나옵니다.
        dot = v1[0]*v2[0] + v1[1]*v2[1]
        cross = v1[0]*v2[1] - v1[1]*v2[0]
        
        # -180도 ~ 180도 사이의 값이 반환됨
        return math.degrees(math.atan2(cross, dot))

    u_angle = get_signed_angle(user_hand)
    a_angle = get_signed_angle(answer_hand)
    
    # 두 손의 회전 각도 차이 계산
    # 예: 정답이 손바닥(+25도)인데 유저가 손날(0도)을 하면 25도 차이
    # 예: 정답이 손바닥(+25도)인데 유저가 손등(-25도)을 하면 50도 차이
    diff = abs(u_angle - a_angle)
    
    # 허용 오차(Tolerance) 설정 (디버깅하며 조절 가능)
    # 40도 이상 차이가 나면 손바닥/손날/손등 상태가 완전히 틀렸다고 보고 0점 처리
    max_tolerance = 40.0 
    
    score = 1.0 - (diff / max_tolerance)
    
    # 점수가 음수가 되지 않도록 0.0 ~ 1.0 사이로 클램핑
    return max(0.0, min(1.0, score))

def CaculateAngle(p1, p2, p3): # 여기서 p는 좌표 하나임 [x, y]
    v1 = [p1[0] - p2[0], p1[1] - p2[1]]
    v2 = [p3[0] - p2[0], p3[1] - p2[1]]

    dot = v1[0]*v2[0] + v1[1]*v2[1]
    mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
    mag2 = math.sqrt(v2[0]**2 + v2[1]**2)

    if mag1 == 0 or mag2 == 0: return 0.0, 0.0
    
    cosine_val = max(-1.0, min(1.0, dot / (mag1 * mag2)))
    angle = math.degrees(math.acos(cosine_val))

    cross_product = v1[0] * v2[1] - v1[1] * v2[0]
    direction = 1.0 if cross_product >= 0 else -1.0
    
    return angle, direction

def IsShoulderSlopeMismatched(user_pose, answer_pose) -> bool:
    """
    [포즈 가드레일] 어깨의 좌우 높낮이(기울기 방향) 불일치 검사
    MediaPipe Y축은 아래로 갈수록 커지므로 (Y가 작음 = 어깨가 올라감)을 의미합니다.
    """
    # 0번: 왼쪽 어깨, 1번: 오른쪽 어깨
    # 정답 어깨의 Y축 차이 (오른쪽 - 왼쪽)
    # 값이 양수(+)면 오른쪽 어깨가 더 내려간 상태, 음수(-)면 오른쪽 어깨가 더 올라간 상태
    answer_slope = answer_pose[1][1] - answer_pose[0][1]
    
    # 유저 어깨의 Y축 차이 (오른쪽 - 왼쪽)
    user_slope = user_pose[1][1] - user_pose[0][1]
    
    # 두 기울기의 곱이 음수(-)라는 것은 한쪽은 오른쪽이 올라갔고, 한쪽은 왼쪽이 올라갔다는 뜻!
    # 미세한 노이즈(오차 범위 약 3~5픽셀)를 감안하여 -5.0보다 작을 때만 차단합니다.
    if answer_slope * user_slope < -5.0:
        return True
    return False

def PoseSimilarity(user_pose, answer_pose):
    total_similarity = 0
    for index in pose_index:
        u_p1, u_p2, u_p3 = user_pose[index[0]], user_pose[index[1]], user_pose[index[2]]
        user, _ = CaculateAngle(u_p1, u_p2, u_p3)

        a_p1, a_p2, a_p3 = answer_pose[index[0]], answer_pose[index[1]], answer_pose[index[2]]
        answer, _ = CaculateAngle(a_p1, a_p2, a_p3)

        diff = abs(user - answer) / 180.0
        total_similarity += (1 - diff)

    avg_similarity = total_similarity / len(pose_index)
    return avg_similarity * weight['POSE']

def HandSimilarity(user_hand, answer_hand, user_elbow=None, answer_elbow=None):
    """
    [마스터 교정본] 손 유사도 판정 메인 엔진
    """
    wrist_rot_score = CalculateWristRotationScore(user_hand, answer_hand)
    hand_plane_score = CalculateHandPlaneScore(user_hand, answer_hand)
    
    print("정답 검지 X:", answer_hand[5][0], "새끼 X:", answer_hand[17][0])
    print("유저 검지 X:", user_hand[5][0], "새끼 X:", user_hand[17][0])
    
    # 🎯 [글로벌 대칭/뒤집힘 가드 설치]
    # 마디별로 부호를 검사하면 판정이 뒤집히거나 노이즈가 튑니다.
    # 대신, 위에서 완벽하게 정렬한 hand_plane_score(0.0 ~ 1.0)를 기준으로 
    # 손이 뒤집혔거나(손바닥 대 손등) 대칭이 깨지면(왼손 대 오른손) 단칼에 0점 컷을 때립니다.
    if wrist_rot_score < 0.6 or hand_plane_score < 0.55:
        print("⚠️ [방향/대칭 불일치 예외 차단] 손바닥/손등 또는 좌우 대칭이 정답과 다릅니다.")
        return 0.0

    # 손가락 개별 마디 사잇각 계산 (이제 부호 검사 없이 사잇각만 순수하게 비교)
    total_finger_similarity = 0
    for index in hand_index:
        u_p1, u_p2, u_p3 = user_hand[index[0]], user_hand[index[1]], user_hand[index[2]]
        user, _ = CaculateAngle(u_p1, u_p2, u_p3) # 💡 부호(_), 사용 안 함

        a_p1, a_p2, a_p3 = answer_hand[index[0]], answer_hand[index[1]], answer_hand[index[2]]
        answer, _ = CaculateAngle(a_p1, a_p2, a_p3)

        diff = abs(user - answer) / 180.0
        total_finger_similarity += (1 - diff)
        
    avg_finger_score = total_finger_similarity / len(hand_index)

    # 손목 자체의 스냅 꺾임 계산
    wrist_snap_score = 1.0
    if user_elbow is not None and answer_elbow is not None:
         u_snap, _ = CaculateAngle(user_elbow, user_hand[0], user_hand[9])
         a_snap, _ = CaculateAngle(answer_elbow, answer_hand[0], answer_hand[9])
         wrist_snap_score = 1.0 - (abs(u_snap - a_snap) / 180.0)

    # 최종 가중치 결합 (회전 30% + 평면성 30% + 마디 및 스냅 40%)
    final_hand_ratio = (wrist_rot_score * 0.30) + (hand_plane_score * 0.30) + (avg_finger_score * wrist_snap_score * 0.40)
    return final_hand_ratio * weight['HAND']

def LeftElbowSimilarity(user_pose, answer_pose, user_hand, answer_hand):
    total_similarity = 0
    u_p1, u_p2, u_p3 = user_hand[elbow_index[0][0]], user_pose[elbow_index[0][1]], user_pose[elbow_index[0][2]]
    user, _ = CaculateAngle(u_p1, u_p2, u_p3)

    a_p1, a_p2, a_p3 = answer_hand[elbow_index[0][0]], answer_pose[elbow_index[0][1]], answer_pose[elbow_index[0][2]]
    answer, _ = CaculateAngle(a_p1, a_p2, a_p3)

    diff = abs(user - answer) / 180.0
    total_similarity += (1 - diff)
    return total_similarity * weight['LEFTELBOW']

def RightElbowSimilarity(user_pose, answer_pose, user_hand, answer_hand):
    total_similarity = 0
    u_p1, u_p2, u_p3 = user_hand[elbow_index[1][0]], user_pose[elbow_index[1][1]], user_pose[elbow_index[1][2]]
    user, _ = CaculateAngle(u_p1, u_p2, u_p3)

    a_p1, a_p2, a_p3 = answer_hand[elbow_index[1][0]], answer_pose[elbow_index[1][1]], answer_pose[elbow_index[1][2]]
    answer, _ = CaculateAngle(a_p1, a_p2, a_p3)

    diff = abs(user - answer) / 180.0
    total_similarity += (1 - diff)
    return total_similarity * weight['RIGHTELBOW']

def score_landmark_groups(
    user: Mapping[str, Sequence[Sequence[float]]],
    reference: Mapping[str, Sequence[Sequence[float]]],
) -> float:
    user_pose = user.get('pose')
    user_leftHand = user.get('leftHand')
    user_rightHand = user.get('rightHand')
    
    answer_pose = reference.get('pose')
    answer_leftHand = reference.get('rightHand')
    answer_rightHand = reference.get('leftHand')

    total_score = 0
    total_weight = 0

    if answer_pose:
        total_weight += weight['POSE']
        if user_pose: 
            if IsShoulderSlopeMismatched(user_pose, answer_pose):
                print("⚠️ [포즈 불일치 차단] 어깨의 기울기(높낮이) 방향이 정답과 반대입니다.")
            else:
                total_score += PoseSimilarity(user_pose, answer_pose)

    if answer_leftHand:
        total_weight += weight['HAND']
        if user_leftHand: 
            u_elbow = user_pose[2] if user_pose else None
            a_elbow = answer_pose[2]
            total_score += HandSimilarity(user_leftHand, answer_leftHand, u_elbow, a_elbow)

    if answer_rightHand:
        total_weight += weight['HAND']
        if user_rightHand: 
            u_elbow = user_pose[3] if user_pose else None
            a_elbow = answer_pose[3]
            total_score += HandSimilarity(user_rightHand, answer_rightHand, u_elbow, a_elbow)

    if answer_pose and answer_leftHand:
        total_weight += weight['LEFTELBOW']
        if user_pose and user_leftHand: 
            total_score += LeftElbowSimilarity(user_pose, answer_pose, user_leftHand, answer_leftHand)

    if answer_pose and answer_rightHand:
        total_weight += weight['RIGHTELBOW']
        if user_pose and user_rightHand: 
            total_score += RightElbowSimilarity(user_pose, answer_pose, user_rightHand, answer_rightHand)

    print("==== [양손 매핑 검증 덤프] ====")
    print("정답에 왼손 데이터가 있는가?:", answer_leftHand is not None)
    print("정답에 오른손 데이터가 있는가?:", answer_rightHand is not None)
    print("유저에 왼손 데이터가 있는가?:", user_leftHand is not None)
    print("유저에 오른손 데이터가 있는가?:", user_rightHand is not None)
    print("=================================")

    if total_weight > 0:
        final_result = (total_score / total_weight) * 100
    else:
        final_result = 0

    return final_result

def evaluate_against_reference(
    user: LandmarkGroups,
    reference: LandmarkGroups,
) -> Tuple[float, bool]:
    score = score_landmark_groups(user, reference)
    passed = score >= PASS_THRESHOLD
    return score, passed