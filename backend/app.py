from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/save-record', methods=['POST'])
def save_record():
    record_data = request.json
    print(f'받은 데이터: {record_data}')

    return jsonify({
        "status": "success",
        "message": "데이터가 무사히 서버에 도착했습니다."
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)