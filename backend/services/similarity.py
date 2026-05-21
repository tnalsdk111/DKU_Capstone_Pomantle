"""
부위별 랜드마크 JSON(dict) 기준 유사도.
{ "pose": [[u,v],...], "leftHand": ..., "rightHand": ..., "lips": ... }
"""

from __future__ import annotations

import math
from typing import Dict, List, Mapping, Sequence, Tuple

PASS_THRESHOLD = 85.0

LANDMARK_KEYS = ("pose", "leftHand", "rightHand")
LandmarkGroups = Dict[str, List[List[float]]]


def _normalize_points(pts: Sequence[Sequence[float]]) -> List[List[float]]:
    """
    - 위치 보정 (중심 맞추기): 모든 좌표의 평균값(무게중심 cx, cy)을 구해 각 좌표에서 뺀다.
      이렇게 하면 유저가 화면 왼쪽에서 포즈를 취하든 오른쪽에서 취하든, 모든 포즈의 중심이 (0, 0)으로 이동합니다.

    - 크기 보정 (스케일 맞추기): 중심이 맞춰진 좌표들의 거리 총합(벡터의 크기)을 구해 전체 좌표를 그 크기로 나눈다.
      이 과정을 거치면 유저가 카메라에 가까이 서서 스켈레톤이 크게 나오든, 멀리 서서 작게 나오든 동일한 크기로 변환된다.

    - + 1e-9는 분모가 0이 되어 프로그램이 멈추는 것(ZeroDivisionError)을 방지하는 안전장치이다.
    """
    n = len(pts)
    if n < 2:
        return []
    cx = sum(p[0] for p in pts) / n
    cy = sum(p[1] for p in pts) / n
    centered = [[p[0] - cx, p[1] - cy] for p in pts]
    s = math.sqrt(sum(t[0] * t[0] + t[1] * t[1] for t in centered)) + 1e-9
    return [[t[0] / s, t[1] / s] for t in centered]


def _score_point_lists(
    user: Sequence[Sequence[float]],
    reference: Sequence[Sequence[float]],
) -> float:
    """
    데이터 개수 맞추기: 유저와 정답의 랜드마크 개수 중 더 적은 쪽(min)에 맞춰 유효한 범위만큼만 비교한다.

    정규화 적용: 위에서 설명한 _normalize_points를 거쳐 두 포즈의 위치와 크기를 완벽히 일치시킨다다.

    오차 계산 (RMSE): 정규화된 유저 좌표와 정답 좌표 사이의 거리 오차 제곱합(SSE)을 구한 뒤 평균을 내고 루트를 씌워 평균 오차(RMSE)를 구합니다.
    """
    n = min(len(user), len(reference))
    if n < 2:
        return 0.0
    u = _normalize_points([user[i] for i in range(n)])
    r = _normalize_points([reference[i] for i in range(n)])
    sse = sum((u[i][0] - r[i][0]) ** 2 + (u[i][1] - r[i][1]) ** 2 for i in range(n))
    rmse = math.sqrt(sse / n)
    raw = max(0.0, 100.0 - rmse * 120.0) # 오차가 0.125면 85점
    return min(100.0, round(raw, 1))


def score_landmark_groups(
    user: Mapping[str, Sequence[Sequence[float]]],
    reference: Mapping[str, Sequence[Sequence[float]]],
) -> float:
    """
    양쪽에 모두 존재하는 부위만 비교해 평균 점수를 반환한다.
    한쪽에만 있는 부위(null로 빠진 부위)는 건너뛴다.
    """
    part_scores: List[float] = []
    for key in LANDMARK_KEYS:
        user_pts = user.get(key)
        ref_pts = reference.get(key)
        if not user_pts or not ref_pts:
            continue
        part_scores.append(_score_point_lists(user_pts, ref_pts))

    if not part_scores:
        return 0.0
    return min(100.0, round(sum(part_scores) / len(LANDMARK_KEYS), 1))


def evaluate_against_reference(
    user: LandmarkGroups,
    reference: LandmarkGroups,
) -> Tuple[float, bool]:
    score = score_landmark_groups(user, reference)
    passed = score >= PASS_THRESHOLD
    return score, passed