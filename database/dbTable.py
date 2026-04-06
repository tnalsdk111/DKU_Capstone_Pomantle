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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DailyPose(db.Model):
    __tablename__ = 'daily_poses'
    daily_id = db.Column(db.BigInteger, primary_key=True)
    target_date = db.Column(db.Date, unique=True, nullable=False)
    pose_id = db.Column(db.BigInteger, db.ForeignKey('poses.pose_id', ondelete='CASCADE'))