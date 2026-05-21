"""
캔버스 픽셀 좌표 [[u, v], ...] 기준 유사도.
정답 템플릿은 플레이스홀더(추후 DB·관리자 입력으로 교체 가능).
"""

from __future__ import annotations

import math
from typing import List, Sequence, Tuple

PASS_THRESHOLD = 85.0


def _gen_hand_cluster(cx: float, cy: float, radius: float = 38.0) -> List[List[float]]:
    pts: List[List[float]] = []
    for i in range(21):
        ang = 2 * math.pi * i / 21.0
        pts.append(
            [
                cx + radius * math.cos(ang),
                cy + radius * math.sin(ang) * 0.55,
            ]
        )
    return pts


def default_reference_pixel_landmarks() -> List[List[float]]:
    """
    프론트 drawLandmarks 순서와 동일: 포즈 4점 → 왼손 21 → 오른손 21 (총 46).
    1280x720 캔버스 가정의 대략적 T자 형태 플레이스홀더.
    """
    W, H = 1280.0, 720.0
    ref: List[List[float]] = []
    ref.append([0.42 * W, 0.26 * H])
    ref.append([0.58 * W, 0.26 * H])
    ref.append([0.38 * W, 0.42 * H])
    ref.append([0.62 * W, 0.42 * H])
    ref.extend(_gen_hand_cluster(0.38 * W, 0.42 * H))
    ref.extend(_gen_hand_cluster(0.62 * W, 0.42 * H))
    return ref


def _normalize_points(pts: Sequence[Sequence[float]]) -> List[List[float]]:
    n = len(pts)
    if n < 2:
        return []
    cx = sum(p[0] for p in pts) / n
    cy = sum(p[1] for p in pts) / n
    centered = [[p[0] - cx, p[1] - cy] for p in pts]
    s = math.sqrt(sum(t[0] * t[0] + t[1] * t[1] for t in centered)) + 1e-9
    return [[t[0] / s, t[1] / s] for t in centered]


def score_pixel_landmarks(
    user: Sequence[Sequence[float]],
    reference: Sequence[Sequence[float]],
) -> float:
    """
    길이가 다르면 앞에서부터 min(len)만 비교(프론트에서 손이 빠질 수 있음).
    반환: 0~100 근사 일치율.
    """
    n = min(len(user), len(reference))
    if n < 2:
        return 0.0
    u = _normalize_points([user[i] for i in range(n)])
    r = _normalize_points([reference[i] for i in range(n)])
    sse = sum((u[i][0] - r[i][0]) ** 2 + (u[i][1] - r[i][1]) ** 2 for i in range(n))
    rmse = math.sqrt(sse / n)
    raw = max(0.0, 100.0 - rmse * 120.0)
    return min(100.0, round(raw, 1))


def evaluate_against_reference(
    user: Sequence[Sequence[float]],
    reference: Sequence[Sequence[float]],
) -> Tuple[float, bool]:
    score = score_pixel_landmarks(user, reference)
    passed = score >= PASS_THRESHOLD
    return score, passed