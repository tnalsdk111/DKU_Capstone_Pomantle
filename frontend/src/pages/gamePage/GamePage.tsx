import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { InitHolistic, drawHolisticResults } from "../../components/holistic/Holistic";
import PhotoPopup from "../../components/popups/PhotoPopUp";
import CameraContainer from "../../components/camera/Camera";

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
} as const;

const timerOverlayStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "80px",
  color: "white",
  fontWeight: "bold",
  zIndex: 10,
} as const;

const GamePage = () => {
  const cameraRef = useRef<any>(null); // CameraContainer 접근용
  const canvasRef = useRef<any>(null); // 캔버스 접근용
  const holisticRef = useRef<any>(null);

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0); // 카운트다운 숫자
  const [selectedTimer, setSelectedTimer] = useState<number>(3); // 사용자가 선택한 타이머 숫자
  const [showTimerOptions, setShowTimerOptions] = useState<boolean>(false); // 타이머 옵션 표시 여부
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false); // 팝업 표시 여부

  // 타이머 시작 (설정된 값으로 시작)
  const startTimer = () => { 
    setTimer(selectedTimer);
  };

  // 타이머
  useEffect(() => { // timer가 변화하면 이 안의 것이 실행됨
    if (timer > 0) { // 만약 timer가 0보다 크다면
      const countdown = setInterval(() => { // setTimer함수를 1000ms(1초)마다 실행
        setTimer((prev:number) => prev - 1); // setTimer(이전숫자 - 1)
      }, 1000);
      return () => clearInterval(countdown); // timer > 0 -> countdown 1초뒤 실행 -> return에서 clear로 사라짐

    } else if (timer === 0 && cameraRef.current) { // timer == 0이고 cameraRef안에 무언가가 있으면
      const image = cameraRef.current?.takeScreenshot(); // image에 cameraRef로 현재 스크린샷 찍고
      if (image) {
        setImgSrc(image); // 만약 image에 뭔가 있으면 imgSrc에 image넣기
        setIsPopupOpen(true); // 사진 촬영 시 팝업 열기
      }
    }
  }, [timer]); // timer가 변화할때마다 이 안의 것을 실행시킬거임

  useEffect(() => {
    // Holistic 초기화
    if (!holisticRef.current) {
      holisticRef.current = InitHolistic((results)=>{
        drawHolisticResults(results, canvasRef, cameraRef.current.videoElement);
      });
    }
    const videoElement = cameraRef.current?.videoElement as HTMLVideoElement; // cameraRef의 videoElement를 videoElement라는 변수에 저장
    if (videoElement) {
      const camera = new Camera(videoElement,{
        onFrame: async () => {
          if (holisticRef.current) {
            await holisticRef.current.send({ image: videoElement }); // holisticRef에 videoElement 보내기
      }
    }, 
      width: 1280,
      height: 720
  });
      camera.start(); // 카메라 시작
}
    }, []); // 처음 로딩시 한번만 실행

  
  return (
    <div style={{
      display:"flex",
      flexDirection:"column",
      justifyContent:"center",
      alignItems:"center",
      minHeight:"100vh",
      backgroundColor:"#F0F0F0",
      gap:"30px"
    }}>
      <CameraContainer 
        ref={cameraRef}
        canvasRef={canvasRef}
        timer={timer}
        selectedTimer={selectedTimer}
        onTimerSelect={setSelectedTimer}
      />
      
      <button onClick={() => setTimer(selectedTimer)}>촬영 시작</button>
      
      {imgSrc && <PhotoPopup imgSrc={imgSrc} onClose={() => setImgSrc(null)} />}
    </div>
  );
};

export default GamePage;