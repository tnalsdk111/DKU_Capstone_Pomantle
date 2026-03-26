/*
2026.03.17
현재는 자바스크립트와 html을 통해 비디오에 들어오는 모든걸 그리는 상태
코드 정리와 정답 생성 함수, 정답 비교 함수, 정답을 DB에서 가져오는 함수 등 필요

2026.03.17
현재 몸통까지 완료. 이제 얼굴 추가
Holistic으로 바꾸는걸 고려할것
*/

// HandLandmarker는 ai모델 자체, 손가락 좌표 찍을거임
// FilesetResolver는 ai연산 파일 가져와줌
import { HandLandmarker, PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker = undefined;
let poseLandmarker = undefined;

const CircleSize = 5;
const lineWidth = 3;

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

const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks( // FilesetResolver가 파일 가져올때까지 기다리기
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(
            vision,
            {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                delegate : "GPU"
            },
            runningMode: "VIDEO"
        });
}

const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d"); // 2D 그림 도구 가져오기

const handConnections = [ // 연결할것들
                [0, 1], [1, 2], [2, 3], [3, 4],       // 엄지
                [0, 5], [5, 6], [6, 7], [7, 8],       // 검지
                [5, 9], [9, 10], [10, 11], [11, 12],  // 중지
                [9, 13], [13, 14], [14, 15], [15, 16], // 약지
                [13, 17], [17, 18], [18, 19], [19, 20], // 새끼
                [0, 17] // 손바닥 닫기
            ];

const poseConnections = [
    // 2. 상체 (어깨, 팔, 손)
    [12, 11],                         // 어깨 사이
    [12, 14],                // 오른팔 (어깨-팔꿈치-손목)
    [11, 13],                // 왼팔

    // 3. 몸통 (어깨-골반 사각형)
    [12, 24], [11, 23],               // 옆구리
    [24, 23],                         // 골반 사이

    // 4. 하체 (다리, 발)
    [24, 26], [26, 28],               // 오른다리 (골반-무릎-발목)
    [23, 25], [25, 27],               // 왼다리
    [28, 30], [30, 32], [32, 28],     // 오른발 (삼각형)
    [27, 29], [29, 31], [31, 27]      // 왼발 (삼각형)
];

let pose_13 = undefined;
let pose_14 = undefined;
let lefthand_0 = undefined;
let righthand_0 = undefined;

function drawingLandmark(results, connections, type) { // 손가락 관절 그리기 함수
    if (results.landmarks) { // landmark가 있으면 -> 그릴게 있으면
        results.landmarks.forEach((landmarks, i) => {  // results.landmarks는 오른손, 왼손 이런거고 landmarks에는 오른손의 관절 좌표값 이런게 들어감
            canvasCtx.strokeStyle = "#00FF00"; // 선 색상 (초록색)
            canvasCtx.lineWidth = lineWidth; // 선 굵기

            connections.forEach(([startIdx, endIdx]) => {
                const start = landmarks[startIdx]; // 선 그릴 시작점
                const end = landmarks[endIdx]; // 선 그릴 끝점

                canvasCtx.beginPath(); // 그릴거 저장
                canvasCtx.moveTo(start.x * canvasElement.width, start.y * canvasElement.height); // 여기로 이동해서
                canvasCtx.lineTo(end.x * canvasElement.width, end.y * canvasElement.height); // 여기로 선을 그어라
                canvasCtx.stroke(); // 저장한거 그리기
            });

            canvasCtx.fillStyle = "#FF0000"; // 점 색상 (빨간색)
            landmarks.forEach((point, index) => {
                if(type == "pose"){
                    const isFace =  0 <= index && index <= 10;
                    const isHand = 15 <= index && index <= 22;

                    if(isFace || isHand) return;
                }

                if(type == "hand" && index == 0){
                    console.log(results.handednesses)
                    if (results.handednesses && results.handednesses[i]) {
                        const label = results.handednesses[i][0].categoryName;
                        console.log(label);

                        if (label === "Left") lefthand_0 = point;
                        else if (label === "Right") righthand_0 = point;
                    }
                }

                if(type == "pose" && index == 14) pose_14 = point;
                else if(type == "pose" && index == 13) pose_13 = point;

                const x = point.x * canvasElement.width; // 0~1 사이 값을 좌표로 변환
                const y = point.y * canvasElement.height; // 0~1 사이 값을 좌표로 변환

                canvasCtx.beginPath(); // 그릴거 저장
                canvasCtx.arc(x, y, CircleSize, 0, 2 * Math.PI); // 반지름 5짜리 원
                canvasCtx.fillStyle = "red"; // 빨간색
                canvasCtx.fill(); // 채우기 -> 그려짐
            });
        });
    }
}

function drawLine(start, end){
    const startX = start.x * canvasElement.width;
    const startY = start.y * canvasElement.height;
    const endX = end.x * canvasElement.width;
    const endY = end.y * canvasElement.height;

    // 1. 선 그리기 (따로 독립시킴)
    canvasCtx.beginPath();
    canvasCtx.moveTo(startX, startY);
    canvasCtx.lineTo(endX, endY);
    canvasCtx.strokeStyle = "#00FF00"; // 연결선은 노란색으로 구분해볼까요?
    canvasCtx.lineWidth = 2;
    canvasCtx.stroke();

    // 2. 시작점(손목) 원 그리기
    canvasCtx.beginPath();
    canvasCtx.arc(startX, startY, CircleSize, 0, 2 * Math.PI);
    canvasCtx.fillStyle = "FF0000";
    canvasCtx.fill();

    // 3. 끝점(팔꿈치) 원 그리기
    canvasCtx.beginPath();
    canvasCtx.arc(endX, endY, CircleSize, 0, 2 * Math.PI);
    canvasCtx.fillStyle = "FF0000";
    canvasCtx.fill();
}

let lastVideoTime = -1; // 이전의 시간
async function predictWebcam() {
    if(handLandmarker == undefined) return; // ai모델 못가져왔으면 return
    if(poseLandmarker == undefined) return;

    const video = document.getElementById("cameraview"); // 비디오 가져오기

    if(video.currentTime !== lastVideoTime){ // 시간이 지나 예측할 시간이 되었으면
        lastVideoTime = video.currentTime; // 시간 업데이트해주고
        lefthand_0 = undefined;
        righthand_0 = undefined;
        pose_13 = undefined;
        pose_14 = undefined;
        
        let startTimeMs = performance.now(); // 밀리초로 시간 재기
        const handResults = handLandmarker.detectForVideo(video, startTimeMs); // result안에 video가 startTimeMs였을때의 좌표값 들어감
        const poseResults = poseLandmarker.detectForVideo(video, startTimeMs);

        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if(handResults.landmarks && handResults.landmarks.length > 0){ // 좌표값이 있으면 그림 그리기
            //console.log("좌표 : ", results.landmarks[0]);
            drawingLandmark(handResults, handConnections, "hand");
        }
        if(poseResults.landmarks && poseResults.landmarks.length > 0){ // 좌표값이 있으면 그림 그리기
            //console.log("좌표 : ", results.landmarks[0]);
            drawingLandmark(poseResults, poseConnections, "pose");
        }

        if(lefthand_0 != undefined && pose_13 != undefined){
            drawLine(lefthand_0, pose_13);
        }
        if(righthand_0 != undefined && pose_14 != undefined){
            drawLine(righthand_0, pose_14);
        }


    }

    window.requestAnimationFrame(predictWebcam); // 계속 반복
}

function camInit(stream){ // stream은 영상 신호
    console.log("ca");
    const video = document.getElementById("cameraview"); // html에서 가져오기
    video.srcObject = stream; // stream과 camera 연결 여기서 stream은 mainInit()의 video임

    video.addEventListener("loadeddata", ()=> { // 데이터가 로드되면 -> 처음 시작할때
        video.play(); // 영상 재생
        predictWebcam(); // 실시간 분석
    });
}

async function mainInit() {

    await createHandLandmarker(); // ai가져오기 await니까 가져올때까지 기다림
    await createPoseLandmarker(); // pose모델 가져오기
    

    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ // 문제있으면 alert 띄우고 return
        alert("Media Device not supported");
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
    });
    camInit(stream);

}

mainInit();