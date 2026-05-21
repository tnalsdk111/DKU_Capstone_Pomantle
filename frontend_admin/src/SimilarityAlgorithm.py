import math
import json

weight = {'POSE' : 20, 'HAND' : 20, 'LEFTELBOW' : 20, 'RIGHTELBOW' : 20} # HAND는 2번 적용됨

pose_index = [
    [3, 1, 0],   # 오른쪽 어깨 
    [1, 0, 2]    # 왼쪽 어깨
]

hand_index = [
    [4, 3, 2],   # 엄지 끝 마디 굽힘
    [3, 2, 1],   # 엄지 중간 마디 굽힘

    # 검지 (Index)
    [8, 7, 6],   # 검지 끝 마디
    [7, 6, 5],   # 검지 중간 마디

    # 중지 (Middle)
    [12, 11, 10], # 중지 끝 마디
    [11, 10, 9],  # 중지 중간 마디

    # 약지 (Ring)
    [16, 15, 14], # 약지 끝 마디
    [15, 14, 13], # 약지 중간 마디

    # 새끼 (Pinky)
    [20, 19, 18], # 새끼 끝 마디
    [19, 18, 17]  # 새끼 중간 마디
]

elbow_index = [ # hand부터
    [0, 3, 1],    # 오른쪽 팔꿈치
    [0, 2, 0]     # 왼쪽 팔꿈치
]

def CaculateAngle(p1, p2, p3): # 여기서 p는 좌표 하나임, 배열이 아님 [x, y]
    # p2를 원점으로 두고 이동시킨 두 개의 벡터
    v1 = [p1[0] - p2[0], p1[1] - p2[1]]
    v2 = [p3[0] - p2[0], p3[1] - p2[1]]

    # 두 벡터의 내적
    dot = v1[0]*v2[0] + v1[1]*v2[1]
    
    # 벡터의 크기
    mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
    mag2 = math.sqrt(v2[0]**2 + v2[1]**2)

    # 분모가 0이 될 수도 있으니 예외처리 해주기
    if mag1 == 0 or mag2 == 0: return 0
    
    # 코사인값만 남음
    #  1.0 : 완전히 겹친다
    #  0.0 : 직각을 이룬다
    # -1.0 : 완전히 반대다
    return dot / (mag1 * mag2)

def PoseSimilarity(user_pose, answer_pose):
    total_similarity = 0

    for index in pose_index:
        u_p1, u_p2, u_p3 = user_pose[index[0]], user_pose[index[1]], user_pose[index[2]]
        user = CaculateAngle(u_p1, u_p2, u_p3) # 유저의 각도

        a_p1, a_p2, a_p3 = answer_pose[index[0]], answer_pose[index[1]], answer_pose[index[2]]
        answer = CaculateAngle(a_p1, a_p2, a_p3) # 정답의 각도

        diff = abs(user - answer) / 2 # 둘의 각도가 같으면 0, 다르면 1

        total_similarity += (1 - diff) # 같으면 1이 더해지고 다르면 0이 더해짐

    # 평균 유사도 (0 ~ 1)
    avg_similarity = total_similarity / len(pose_index)

    # 가중치 적용
    return avg_similarity * weight['POSE']

def HandSimilarity(user_hand, answer_hand):
    total_similarity = 0

    for index in hand_index:
        u_p1, u_p2, u_p3 = user_hand[index[0]], user_hand[index[1]], user_hand[index[2]]
        user = CaculateAngle(u_p1, u_p2, u_p3) # 유저의 각도

        a_p1, a_p2, a_p3 = answer_hand[index[0]], answer_hand[index[1]], answer_hand[index[2]]
        answer = CaculateAngle(a_p1, a_p2, a_p3) # 정답의 각도

        diff = abs(user - answer) / 2 # 둘의 각도가 같으면 0, 다르면 1

        total_similarity += (1 - diff) # 같으면 1이 더해지고 다르면 0이 더해짐

    # 평균 유사도 (0 ~ 1)
    avg_similarity = total_similarity / len(hand_index)

    # 가중치 적용
    return avg_similarity * weight['HAND']

def LeftElbowSimilarity(user_pose, answer_pose, user_hand, answer_hand):
    total_similarity = 0

    u_p1, u_p2, u_p3 = user_hand[elbow_index[0][0]], user_pose[elbow_index[0][1]], user_pose[elbow_index[0][2]]
    user = CaculateAngle(u_p1, u_p2, u_p3) # 유저의 각도

    a_p1, a_p2, a_p3 = answer_hand[elbow_index[0][0]], answer_pose[elbow_index[0][1]], answer_pose[elbow_index[0][2]]
    answer = CaculateAngle(a_p1, a_p2, a_p3) # 정답의 각도

    diff = abs(user - answer) / 2 # 둘의 각도가 같으면 0, 다르면 1
    total_similarity += (1 - diff)

    return total_similarity * weight['LEFTELBOW']

def RightElbowSimilarity(user_pose, answer_pose, user_hand, answer_hand):
    total_similarity = 0

    u_p1, u_p2, u_p3 = user_hand[elbow_index[1][0]], user_pose[elbow_index[1][1]], user_pose[elbow_index[1][2]]
    user = CaculateAngle(u_p1, u_p2, u_p3) # 유저의 각도

    a_p1, a_p2, a_p3 = answer_hand[elbow_index[1][0]], answer_pose[elbow_index[1][1]], answer_pose[elbow_index[1][2]]
    answer = CaculateAngle(a_p1, a_p2, a_p3) # 정답의 각도

    diff = abs(user - answer) / 2 # 둘의 각도가 같으면 0, 다르면 1
    total_similarity += (1 - diff)

    return total_similarity * weight['RIGHTELBOW']

def AngularSimilarityAlgorithm(user, answer): # json파일 형태로 온다 가정
    with open(f'{user}.json', 'r', encoding='utf-8') as f:
        user_vector = json.load(f)
    with open(f'{answer}.json', 'r', encoding='utf-8') as f:
        answer_vector = json.load(f)

    user_pose = user_vector.get('pose')
    user_leftHand = user_vector.get('leftHand')
    user_rightHand = user_vector.get('rightHand')
    
    answer_pose = answer_vector.get('pose')
    answer_leftHand = answer_vector.get('leftHand')
    answer_rightHand = answer_vector.get('rightHand')

    total_score = 0
    total_weight = 0

    if user_pose and answer_pose: 
        total_score += PoseSimilarity(user_pose, answer_pose)
        total_weight += weight['POSE']

    if user_leftHand and answer_leftHand: 
        total_score += HandSimilarity(user_leftHand, answer_leftHand)
        total_weight += weight['HAND']

    if user_rightHand and answer_rightHand: 
        total_score += HandSimilarity(user_rightHand, answer_rightHand)
        total_weight += weight['HAND']

    if user_pose and answer_pose and user_leftHand and answer_leftHand: 
        total_score += LeftElbowSimilarity(user_pose, answer_pose, user_leftHand, answer_leftHand)
        total_weight += weight['LEFTELBOW']

    if user_pose and answer_pose and user_rightHand and answer_rightHand: 
        total_score += RightElbowSimilarity(user_pose, answer_pose, user_rightHand, answer_rightHand)
        total_weight += weight['RIGHTELBOW']

    if total_weight > 0:
        final_result = (total_score / total_weight) * 100
    else:
        final_result = 0

    return final_result