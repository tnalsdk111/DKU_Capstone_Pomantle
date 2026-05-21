import Webcam from "react-webcam";
import { FACEMESH_FACE_OVAL } from "@mediapipe/holistic";

interface CapturedImages {
    originImage: string;
    publicImage: string;
}

export const captureCombinedImage = (
    video: HTMLVideoElement,
    drawingCanvas: HTMLCanvasElement,
    results: any
): CapturedImages | null => {
        if(video && drawingCanvas){
            const combinedCanvas = document.createElement("canvas");
            const context = combinedCanvas.getContext("2d");
            if(!context) return null;

            const {videoWidth, videoHeight} = video;
            combinedCanvas.width = videoWidth;
            combinedCanvas.height = videoHeight;

            context.translate(videoWidth, 0);
            context.scale(-1, 1);

            context.drawImage(video, 0, 0, videoWidth, videoHeight);

            const originImage = combinedCanvas.toDataURL("image/png");

            context.setTransform(1, 0, 0, 1, 0, 0);

            // if(results?.faceLandmarks){
            //     const landmarks = results.faceLandmarks;

            //     const xs = landmarks.map((l: any) => l.x * videoWidth);
            //     const ys = landmarks.map((l: any) => l.y * videoHeight);
                
            //     const minX = Math.min(...xs);
            //     const maxX = Math.max(...xs);
            //     const minY = Math.min(...ys);
            //     const maxY = Math.max(...ys);

            //     // 2. 검은색 사각형 그리기
            //     context.fillStyle = "black";
            //     context.fillRect(minX - 10, minY - 10, (maxX - minX) + 20, (maxY - minY) + 20);
            // }

            if (results?.faceLandmarks) {
                const landmarks = results.faceLandmarks;
                const ovalIndices = Array.from(new Set(FACEMESH_FACE_OVAL.flat()));
                const ovalPoints = ovalIndices.map(index => landmarks[index]);

                if (ovalPoints.length > 0) {
                    context.save();
                    context.beginPath();

                    // 3. 다각형(Path) 그리기
                    // 점들을 순서대로 연결 (평탄화된 순서가 외곽선 순서가 아닐 수 있으므로 
                    // 시각적으로 더 깔끔하게 하려면 원래 oval 구조를 따라 그리는 게 좋지만, 
                    // 단순히 '가리기' 용도라면 이 정도로도 충분합니다.)
                    context.moveTo(ovalPoints[0].x * videoWidth, ovalPoints[0].y * videoHeight);
                    for (let i = 1; i < ovalPoints.length; i++) {
                        context.lineTo(ovalPoints[i].x * videoWidth, ovalPoints[i].y * videoHeight);
                    }

                    context.closePath();
                    context.fillStyle = "black";
                    context.fill();
                    context.restore();
                }
            }

            context.drawImage(drawingCanvas, 0, 0, videoWidth, videoHeight);

            const publicImage = combinedCanvas.toDataURL("image/png");
            return {originImage, publicImage};
        }
        return null;
    };