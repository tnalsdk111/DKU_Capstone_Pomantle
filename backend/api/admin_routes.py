#admin_routes.py
from flask import Blueprint, request, jsonify
from database.dbTable import db, Pose, DailyPose
from datetime import datetime

#어드민 전용 API 블루프린트 생성 (/api/v1/admin)
admin_bp = Blueprint('admin_bp', __name__)


#1. 포즈 관리 API (DataPage 용)

#전체 포즈 목록 조회
@admin_bp.route('/poses', methods=['GET'])
def get_all_poses():
    try:
        poses = Pose.query.order_by(Pose.pose_id.desc()).all()
        #DataItem 인터페이스에 맞춘 키값 반환
        result = [{
            "id": pose.pose_id,
            "poseName": pose.pose_name,
            "originalImage": pose.original_image,
            "publicImage": pose.public_image,
            "createdAt": pose.created_at.strftime("%Y-%m-%d") if pose.created_at else None
        } for pose in poses]
        
        return jsonify({"status": "success", "data": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "포즈 목록을 불러오던 중 문제가 발생했습니다."}), 500

#새로운 포즈 등록
@admin_bp.route('/poses', methods=['POST'])
def create_pose():
    data = request.get_json()
    try:
        new_pose = Pose(
            pose_name=data['poseName'],
            target_vector=data['target_vector'],  # 평가용: 캔버스 픽셀 [[u,v], ...] JSON 배열
            original_image=data.get('originalImage', ''),
            public_image=data.get('publicImage', '')
        )
        db.session.add(new_pose)
        db.session.commit()
        return jsonify({"status": "success", "message": "포즈가 등록되었습니다."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "필수 데이터가 누락되었습니다."}), 400

#포즈 삭제
@admin_bp.route('/poses/<int:pose_id>', methods=['DELETE'])
def delete_pose(pose_id):
    try:
        pose = Pose.query.get(pose_id)
        if not pose:
            return jsonify({"status": "error", "message": "포즈를 찾을 수 없습니다."}), 404
            
        db.session.delete(pose)
        db.session.commit()
        return jsonify({"status": "success", "message": "포즈가 삭제되었습니다."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "포즈를 삭제하던 중 문제가 발생했습니다."}), 500



#2. 캘린더 관리 API (CalendarPage 용)


#지정된 날짜의 포즈 조회 (월별 캘린더 데이터 로드용)
@admin_bp.route('/daily-poses', methods=['GET'])
def get_daily_poses():
    try:
        daily_poses = DailyPose.query.all()
        result = []
        for dp in daily_poses:
            pose = Pose.query.get(dp.pose_id)
            if pose:
                #CalendarDataPopUp에서 사용할 Data 인터페이스 형식 포함
                result.append({
                    "date": dp.target_date.strftime("%Y-%m-%d"),
                    "data": {
                        "id": pose.pose_id,
                        "poseName": pose.pose_name,
                        "originalImage": pose.original_image,
                        "publicImage": pose.public_image
                    }
                })
        return jsonify({"status": "success", "data": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "포즈 정보를 불러오던 중 문제가 발생했습니다."}), 500

#특정 날짜에 포즈 지정 (생성 및 수정)
@admin_bp.route('/daily-poses', methods=['POST'])
def set_daily_pose():
    data = request.get_json()
    target_date_str = data.get('date') #YYYY-MM-DD
    pose_id = data.get('pose_id')

    try:
        target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
        
        #이미 해당 날짜에 지정된 포즈가 있는지 확인
        existing_daily = DailyPose.query.filter_by(target_date=target_date).first()
        
        if existing_daily:
            #있으면 덮어쓰기 (수정)
            existing_daily.pose_id = pose_id
            message = "해당 날짜의 포즈가 수정되었습니다."
        else:
            #없으면 새로 생성
            new_daily = DailyPose(target_date=target_date, pose_id=pose_id)
            db.session.add(new_daily)
            message = "해당 날짜에 포즈가 지정되었습니다."
            
        db.session.commit()
        return jsonify({"status": "success", "message": message}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "포즈 지정에 실패하였습니다."}), 400

#특정 날짜의 포즈 지정 취소 (삭제)
@admin_bp.route('/daily-poses/<string:date_str>', methods=['DELETE'])
def delete_daily_pose(date_str):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        daily_pose = DailyPose.query.filter_by(target_date=target_date).first()
        
        if not daily_pose:
            return jsonify({"status": "error", "message": "해당 날짜에 지정된 포즈가 없습니다."}), 404
            
        db.session.delete(daily_pose)
        db.session.commit()
        return jsonify({"status": "success", "message": "해당 날짜의 포즈 지정이 취소되었습니다."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": "해당 날짜 포즈 지정 취소에 실패했습니다."}), 500
