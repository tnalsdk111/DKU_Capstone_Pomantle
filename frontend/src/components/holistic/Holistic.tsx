import { RefObject } from "react";
import { Holistic, Results } from "@mediapipe/holistic";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS, FACEMESH_LIPS } from "@mediapipe/holistic";

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

// pose의 팔꿈치와 hand의 손을 연결할때 사용하는 변수
let pose_13 = undefined;
let pose_14 = undefined;
let lefthand_0 = undefined;
let righthand_0 = undefined;

// 점과 선 사이즈
const pointSize = 2;
const lineWidth = 2;

export const InitHolistic = (
    onResultsCallback: (results: Results) => void
    ) => { 
    // holistic 가져오기
    const holistic = new Holistic({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`,
    });

    // holistic 옵션 설정
    holistic.setOptions({
        modelComplexity: 1, // 얼마나 정확하게 할거냐. 2가 최대. 2로 하면 너무 느려짐
        smoothLandmarks: true,
        enableSegmentation: false, // 하면 segmentation이 적용되어서 빨간연기가 감쌈
        smoothSegmentation: true,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    // holistic이 사용할 함수
    holistic.onResults(onResultsCallback);

    // holistic 반환
    return holistic;
}

export const drawHolisticResults = (
    results: Results, 
    canvasRef: RefObject<HTMLCanvasElement>, 
    videoElement: HTMLVideoElement) => {
    if (!results || !canvasRef.current || !videoElement) return; // 하나라도 없으면 반환

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    if (!canvasCtx) return; // TS 안전 처리

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    
    // 손 초기화
    let lefthand_0: any = undefined;
    let righthand_0: any = undefined;
    let pose_13: any = undefined;
    let pose_14: any = undefined;

    let inputSource = null;

    if(results.image && results.image.width > 0){
        inputSource = results.image;
    }
    else{
        inputSource = videoElement;
    }

    if(inputSource){
        try{
            canvasCtx.drawImage(inputSource, 0, 0, canvasElement.width, canvasElement.height);
        } catch (e){
            console.warn("이미지를 그리는 중 오류 발생", e);
        }
    }

    // drawConnector는 선을 그림
    // drawLandmark는 점을 그림

    if(results.poseLandmarks && results.poseLandmarks[14]) pose_14 = results.poseLandmarks[14];
    if(results.poseLandmarks && results.poseLandmarks[13]) pose_13 = results.poseLandmarks[13];
    if(results.leftHandLandmarks && results.leftHandLandmarks[0]) lefthand_0 = results.leftHandLandmarks[0];
    if(results.rightHandLandmarks && results.rightHandLandmarks[0]) righthand_0 = results.rightHandLandmarks[0];

    if(lefthand_0 !== undefined && pose_13 !== undefined) drawConnectors(canvasCtx, [lefthand_0, pose_13], [[0, 1]], {color: '#00CC00', lineWidth: lineWidth});
    if(righthand_0 !== undefined && pose_14 !== undefined) drawConnectors(canvasCtx, [righthand_0, pose_14], [[0, 1]], {color: '#00CC00', lineWidth: lineWidth});

    if(results.poseLandmarks){
        drawConnectors(canvasCtx, results.poseLandmarks, poseConnections as [number, number][], {color: '#00FF00', lineWidth: lineWidth}); // 팔꿈치 까지만 연결
        drawLandmarks(canvasCtx, results.poseLandmarks.slice(11, 15), {color: '#FF0000', radius: pointSize}); // 팔꿈치 까지만 그림
    }

    // if(results.faceLandmarks){
    //     drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_LIPS, {color: '#00FF00', lineWidth: lineWidth});
    // }
    
    if(results.leftHandLandmarks){
        drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: lineWidth});
        drawLandmarks(canvasCtx, results.leftHandLandmarks, {color: '#FF0000', radius: pointSize});
    }

    if(results.rightHandLandmarks){
        drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {color: '#00CC00', lineWidth: lineWidth});
        drawLandmarks(canvasCtx, results.rightHandLandmarks, {color: '#FF0000', radius: pointSize});
    }
    
    canvasCtx.restore();
}