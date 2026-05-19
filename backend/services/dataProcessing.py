"""요청 본문에서 부위별 랜드마크를 검증·파싱합니다."""

def parse_pixel_landmarks(raw):
    """
    프론트와 동일: 
    raw = {
        "pose": [[x, y], ...],
        "leftHand": [[x, y], ...] 또는 null,
        "rightHand": [[x, y], ...] 또는 null,
        "lips": [[x, y], ...] 또는 null
    }
    
    성공 시 검증된 부위만 담긴 딕셔너리 반환 (예: {"pose": [[x,y],...], "lips": [[x,y],...]}), 실패 시 None
    """
    if raw is None or not isinstance(raw, dict):
        return None

    out_dict = {}
    
    keys_order = ["pose", "leftHand", "rightHand", "lips"]

    for key in keys_order:
        #딕셔너리에서 각 부위의 좌표 배열을 가져옴
        points = raw.get(key)
        
        #감지가 안 되었거나 안 쓰기로 해서 null(None)로 들어온 부위는 건너뜀
        if points is None:
            continue
            
        if not isinstance(points, list):
            return None

        #해당 부위의 좌표들을 임시로 담을 리스트
        valid_points = []
        
        #검증 로직을 각 부위별 배열에 그대로 적용
        for item in points:
            if not isinstance(item, (list, tuple)) or len(item) != 2:
                return None
            try:
                px = float(item[0])
                py = float(item[1])
            except (TypeError, ValueError):
                return None
            valid_points.append([px, py])

        #해당 부위의 검증이 무사히 끝났다면, 딕셔너리에 키값과 함께 저장
        if valid_points:
            out_dict[key] = valid_points

    #파싱된 부위가 하나라도 있으면 딕셔너리 반환, 텅 비었으면 None
    return out_dict if len(out_dict) > 0 else None

