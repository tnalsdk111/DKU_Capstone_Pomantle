import React, { forwardRef, useImperativeHandle, useRef } from "react";
import Webcam from "react-webcam";
import "./Camera.css";

interface CameraContainerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  timer: number;
  selectedTimer: number;
  onTimerSelect: (sec: number) => void;
}

const CameraContainer = forwardRef(
  ({ canvasRef, timer, selectedTimer, onTimerSelect }: CameraContainerProps, ref) => {
    const webcamRef = useRef<Webcam>(null);

    useImperativeHandle(ref, () => ({
      takeScreenshot: () => {
        return webcamRef.current?.getScreenshot();
      },
      videoElement: webcamRef.current?.video,
    }));

    return (
      <div className="camera-viewport">
        {/* Webcam Video & MediaPipe Canvas */}
        <Webcam
          ref={webcamRef}
          mirrored={true}
          screenshotFormat="image/jpeg"
          className="webcam-stream"
        />
        <canvas ref={canvasRef} className="holistic-canvas" />

        {/* Playful REC Badge */}
        <div className="live-badge">
          <span className="live-dot" />
          <span>LIVE</span>
        </div>

        {/* Timer Selector Segment */}
        <div className="timer-selector">
          {[3, 5].map((sec) => (
            <button
              key={sec}
              type="button"
              className={`timer-btn ${selectedTimer === sec ? "active" : ""}`}
              onClick={() => onTimerSelect(sec)}
              id={`timer-btn-${sec}s`}
            >
              {sec}초
            </button>
          ))}
        </div>

        {/* Big Bouncy Countdown Number */}
        {timer > 0 && (
          <div key={timer} className="countdown-overlay">
            {timer}
          </div>
        )}
      </div>
    );
  }
);

export default CameraContainer;