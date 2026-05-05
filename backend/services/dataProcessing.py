"""요청 본문에서 캔버스 픽셀 랜드마크만 검증·파싱합니다."""


def parse_pixel_landmarks(raw):
    """
    프론트와 동일: landmarks = [[px, py], ...] (각 원소 길이 2의 숫자 배열)
    성공 시 list[list[float]], 실패 시 None
    """
    if raw is None or not isinstance(raw, list) or len(raw) == 0:
        return None
    out = []
    for item in raw:
        if not isinstance(item, (list, tuple)) or len(item) != 2:
            return None
        try:
            px = float(item[0])
            py = float(item[1])
        except (TypeError, ValueError):
            return None
        out.append([px, py])
    return out
