import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { InitHolistic, drawHolisticResults } from "./utils/holisticService";

// useState (상태 관리자) 화면에서 변하는 데이터 저장, 변하면 화면이 바로 적용시킴
// useRef (저장소) HTMl에 직접 접근, 
// useEffect (실행 감시자) 조건 충족시 Effect일으킴

// html 태그 추가할때 사용하는 css
const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
};

const timerOverlayStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "80px",
  color: "white",
  fontWeight: "bold",
  zIndex: 10,
};

const CameraWithTimer = () => {
  const webcamRef = useRef(null); //video에 접근하는것이 목적이지만 아직 video가 만들어지지않았기에 useRef(null)로 선언
  const [imgSrc, setImgSrc] = useState(null); // 변수 imgSrc와 변수를 변경할 변경함수 setImgSrc선언
  const [timer, setTimer] = useState(0); // 변수 timer와 변수를 변경할 변경함수 setTimer선언하는데 timer의 초기값은 0

  const holisticRef = useRef(null); // holistic용
  const canvasRef = useRef(null);

  const startTimer = (seconds) => { // startTimer(seconds)를 주면 setTimer(seconds)를 실행
    // 나중에 여러가지 기능이 더 추가되도 이 안에 채우면 되니 확장성이 좋음
    setTimer(seconds);
  };

  useEffect(() => { // timer가 변화하면 이 안의 것이 실행됨
    if (timer > 0) { // 만약 timer가 0보다 크다면
      const countdown = setInterval(() => { // setTimer함수를 1000ms(1초)마다 실행
        setTimer((prev) => prev - 1); // setTimer(이전숫자 - 1)
      }, 1000);
      return () => clearInterval(countdown); // timer > 0 -> countdown 1초뒤 실행 -> return에서 clear로 사라짐

    } else if (timer === 0 && webcamRef.current) { // timer == 0이고 webcamRef안에 무언가가 있으면
      const image = webcamRef.current.getScreenshot(); // image에 webcamRef로 현재 스크린샷 찍고
      if (image) setImgSrc(image); // 만약 image에 뭔가 있으면 imgSrc에 image넣기
    }
  }, [timer]); // timer가 변화할때마다 이 안의 것을 실행시킬거임

  useEffect(() => {
    // 이미지를 통해 예측한 좌표를 어떻게 그릴지에 대한 함수
    const handleMediaPipeResults = (results) => {
        drawHolisticResults(results, canvasRef, webcamRef.current?.video);
    };

    if(!holisticRef.current){ // 만약 holisticRef가 현재 없다면
      holisticRef.current = InitHolistic(handleMediaPipeResults); // 새롭게 만들어라
    }

    if(webcamRef.current && webcamRef.current.video){ // 웹캠과 웹캠 비디오가 잘 작동되면 
      const videoElement = webcamRef.current.video; // videoElement에 비디오를 가져오고
      const camera = new Camera(videoElement, { // 카메라를 새로 만드는데
        onFrame: async () => { // 프레임마다
          if(holisticRef.current){ // 만약 holisticRef이 있다면
            await holisticRef.current.send({image: videoElement}); // 비디오를 보낸다. 이러면 위의 drawHolisticResults함수가 실행될것이다.
          }
        }, 
        // 크기
        width: 1280,
        height: 720
      });
      camera.start(); // 카메라 시작
    }

    return () => {
      if(holisticRef.current){ // 만약 holisticRef가 열려있다면
        holisticRef.current.close(); // 닫아라
      }
    }
  }, []) // 처음 로딩시 한번만 실행

  return (
    // timer > 0이면 timer출력
    // webcamRef에 Webcam을 붙이고 스크린샷포멧은 jpeg
    // button 클릭하면 startTimer(3)
    // imgSrc가 있으면 표시
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
    
    {/* --- 1. 겹치는 구역 (카메라 + 캔버스) --- */}
    <div style={{ position: "relative", width: "1280px", height: "720px", backgroundColor: "#000" }}>
      {/* 1층: 비디오 */}
      <Webcam ref={webcamRef} mirrored={true} style={overlayStyle} />
      
      {/* 2층: 캔버스 */}
      <canvas ref={canvasRef} style={overlayStyle} />
      
      {/* (옵션) 타이머 숫자도 영상 정중앙에 띄우고 싶다면 여기에! */}
      {timer > 0 && <div style={timerOverlayStyle}>{timer}</div>}
    </div>

    {/* --- 2. 일반 구역 (버튼, 사진 등) --- */}
    <div style={{ textAlign: "center" }}>
      <button 
        onClick={() => startTimer(3)}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        3초 후 촬영
      </button>

      {/* 찍힌 사진 표시 구역 */}
      {imgSrc && (
        <div style={{ marginTop: "20px" }}>
          <h3>캡처된 화면:</h3>
          <img src={imgSrc} alt="Captured" style={{ width: "320px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }} />
        </div>
      )}
    </div>

  </div>
  );
};

export default CameraWithTimer;