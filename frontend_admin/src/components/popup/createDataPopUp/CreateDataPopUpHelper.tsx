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

            if (results?.faceLandmarks) {
                const landmarks = results.faceLandmarks;
                const ovalIndices = Array.from(new Set(FACEMESH_FACE_OVAL.flat()));
                const ovalPoints = ovalIndices.map(index => landmarks[index]);

                if (ovalPoints.length > 0) {
                    context.save();
                    context.beginPath();
                    
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