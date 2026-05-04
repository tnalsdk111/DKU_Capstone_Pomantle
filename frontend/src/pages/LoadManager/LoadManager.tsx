import "./LoadManager.css";
import React, { useState, useRef, useEffect } from "react";

type Props = {
  onSuccess: () => void;
};

function LoadManager({ onSuccess }: Props) {
  useEffect(() => {
    const checkCamera = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setTimeout(() => {
          onSuccess();
        }, 1000); // UX용 살짝 딜레이
      } catch {
        alert("카메라 권한 필요");
      }
    };

    checkCamera();
  }, [onSuccess]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

export default LoadManager;