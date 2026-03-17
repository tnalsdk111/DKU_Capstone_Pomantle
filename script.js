/*
2026.03.17
현재는 자바스크립트와 html을 통해 비디오에 들어오는 모든걸 그리는 상태
코드 정리와 상반신 정체 인식, 정답 생성 함수, 정답 비교 함수, 정답을 DB에서 가져오는 함수 등 추가로 필요
*/

// HandLandmarker는 ai모델 자체, 손가락 좌표 찍을거임
// FilesetResolver는 ai연산 파일 가져와줌
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker = undefined;

const createHandLandmarker = async () => { // 비동기
  const vision = await FilesetResolver.forVisionTasks( // FilesetResolver가 파일 가져올때까지 기다리기
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions( // 손 가져오기
        vision,
        {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
        });
};

const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d"); // 2D 그림 도구 가져오기

function processResults(results) { // 손가락 관절 그리기 함수
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // canvas 지우기

    if (results.landmarks) { // landmark가 있으면 -> 그릴게 있으면
        for (const landmarks of results.landmarks) {  // results.landmarks는 오른손, 왼손 이런거고 landmarks에는 오른손의 관절 좌표값 이런게 들어감
            canvasCtx.strokeStyle = "#00FF00"; // 선 색상 (초록색)
            canvasCtx.lineWidth = 3; // 선 굵기
            const connections = [ // 연결할것들
                [0, 1], [1, 2], [2, 3], [3, 4],       // 엄지
                [0, 5], [5, 6], [6, 7], [7, 8],       // 검지
                [5, 9], [9, 10], [10, 11], [11, 12],  // 중지
                [9, 13], [13, 14], [14, 15], [15, 16], // 약지
                [13, 17], [17, 18], [18, 19], [19, 20], // 새끼
                [0, 17] // 손바닥 닫기
            ];

            connections.forEach(([startIdx, endIdx]) => {
                const start = landmarks[startIdx]; // 선 그릴 시작점
                const end = landmarks[endIdx]; // 선 그릴 끝점

                canvasCtx.beginPath(); // 그릴거 저장
                canvasCtx.moveTo(start.x * canvasElement.width, start.y * canvasElement.height); // 여기로 이동해서
                canvasCtx.lineTo(end.x * canvasElement.width, end.y * canvasElement.height); // 여기로 선을 그어라
                canvasCtx.stroke(); // 저장한거 그리기
            });

            canvasCtx.fillStyle = "#FF0000"; // 점 색상 (빨간색)
            for (const point of landmarks) { // 좌표값 하나하나
                const x = point.x * canvasElement.width; // 0~1 사이 값을 좌표로 변환
                const y = point.y * canvasElement.height; // 0~1 사이 값을 좌표로 변환

                canvasCtx.beginPath(); // 그릴거 저장
                canvasCtx.arc(x, y, 5, 0, 2 * Math.PI); // 반지름 5짜리 원
                canvasCtx.fillStyle = "red"; // 빨간색
                canvasCtx.fill(); // 채우기 -> 그려짐
            }
        }
    }
}

let lastVideoTime = -1; // 이전의 시간
async function predictWebcam() {
    if(handLandmarker == undefined) return; // ai모델 못가져왔으면 return
    const video = document.getElementById("cameraview"); // 비디오 가져오기

    if(video.currentTime !== lastVideoTime){ // 시간이 지나 예측할 시간이 되었으면
        lastVideoTime = video.currentTime; // 시간 업데이트해주고
        
        let startTimeMs = performance.now(); // 밀리초로 시간 재기
        const results = handLandmarker.detectForVideo(video, startTimeMs); // result안에 video가 startTimeMs였을때의 좌표값 들어감

        if(results.landmarks && results.landmarks.length > 0){ // 좌표값이 있으면 그림 그리기
            //console.log("좌표 : ", results.landmarks[0]);
            processResults(results);
        }
        else{ // 좌표값이 없으면 canvas 지우기
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }
    }

    window.requestAnimationFrame(predictWebcam); // 계속 반복
}

function camInit(stream){ // stream은 영상 신호
    const video = document.getElementById("cameraview"); // html에서 가져오기
    video.srcObject = stream; // stream과 camera 연결 여기서 stream은 mainInit()의 video임

    video.addEventListener("loadeddata", ()=> { // 데이터가 로드되면 -> 처음 시작할때
        video.play(); // 영상 재생
        predictWebcam(); // 실시간 분석
    });
}

async function mainInit() {
    await createHandLandmarker(); // ai가져오기 await니까 가져올때까지 기다림

    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ // 문제있으면 alert 띄우고 return
        alert("Media Device not supported");
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: {facingMode: "user"} }) // 카메라를 사용해도 되냐
    .then(camInit) // 사용해도되면 camInit()
    .catch((err) => console.log("카메라 권한 거부됨:", err)); // 안되면 거부
}

mainInit();