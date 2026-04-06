from flask import Flask
from flask_cors import CORS
from config import Config
from database.dbTable import db
from api.routes import api_bp

def create_app():
    app = Flask(__name__)
    
    # 설정 파일 불러오기
    app.config.from_object(Config)
    CORS(app)

    # 데이터베이스 초기화 및 앱 연동
    db.init_app(app)
    with app.app_context():
        db.create_all()

    # API Blueprint 등록 (이때 모든 경로 앞에 /api가 붙음)
    app.register_blueprint(api_bp, url_prefix='/api')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)