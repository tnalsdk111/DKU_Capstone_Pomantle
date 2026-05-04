import numpy as np

#코사인 유사도 방식
def cos_sim(a, b):
    # 길이 0인 벡터로 인한 0 나누기 에러 방지
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    # Numpy 데이터 타입을 Python 기본 float으로
    return float(np.dot(a, b) / (norm_a * norm_b))