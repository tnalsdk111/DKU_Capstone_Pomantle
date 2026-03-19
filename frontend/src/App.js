import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";

const CameraWithTimer = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [timer, setTimer] = useState(0);

  const startTimer = (seconds) => {
    setTimer(seconds);
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0 && webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      if (image) setImgSrc(image);
    }
  }, [timer]);

  return (
    <div>
      {timer > 0 && <div>{timer}</div>}
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={() => startTimer(3)}>3초 후 촬영</button>
      {imgSrc && <img src={imgSrc} alt="Captured" />}
    </div>
  );
};

export default CameraWithTimer;