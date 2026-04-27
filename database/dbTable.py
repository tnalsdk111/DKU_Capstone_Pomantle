from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

# 여기서 db 객체 생성
db = SQLAlchemy()

class Pose(db.Model):
    __tablename__ = 'poses'
    
    pose_id = db.Column(db.BigInteger, primary_key=True)
    pose_name = db.Column(db.String(100), nullable=False)
    target_vector = db.Column(JSONB, nullable=False)
    
    # --- 🌟 어드민 페이지 명세(DataItem)에 맞춰 추가된 필드 ---
    # DataItem 인터페이스의 'originalImage'
    original_image = db.Column(db.String(255), nullable=True)
    # DataItem 인터페이스의 'publicImage'
    public_image = db.Column(db.String(255), nullable=True)   
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DailyPose(db.Model):
    
    __tablename__ = 'daily_poses'
    daily_id = db.Column(db.BigInteger, primary_key=True)
    target_date = db.Column(db.Date, unique=True, nullable=False)
    pose_id = db.Column(db.BigInteger, db.ForeignKey('poses.pose_id', ondelete='CASCADE'))
