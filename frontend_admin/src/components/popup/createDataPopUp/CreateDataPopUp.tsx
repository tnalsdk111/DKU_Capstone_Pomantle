import React, { useState, useEffect, useRef } from 'react'
import { PopUp } from "../../../models/PopUp";
import { PopUpManager } from '../../../managers/PopUpManager';
import { PopUpType } from '../../../models/PopUpType';
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { InitHolistic, drawHolisticResults } from "../../holistic/Holistic";
import './CreateDataPopUp.css'
import CustomButton from '../../button/CustomButton';
import { captureCombinedImage } from './CreateDataPopUpHelper';
import { Data } from '../../../models/Data';
import { DBManager } from '../../../managers/DBManager';

interface CreateDataPopUp extends PopUp{
    showData(date:string): void;
}

export const CreateDataPopUp = () => {
    const webcamRef = useRef<Webcam | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const dataCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const holisticRef = useRef<any>(null);
    const countdownRef = useRef<any>(null);
    const lastResultRef = useRef<any>(null);
    const idRef = useRef<number>(-1);
    const usedAtRef = useRef<string>("");
    const todayRef = useRef<string>("");


    const [originImg, setOriginImg] = useState<string>(""); // 원본 이미지
    const [publicImg, setPublicImg] = useState<string>(""); // 공개 이미지
    const [poseName, setPoseName] = useState<string>("");
    const [timer, setTimer] = useState<number>(0);
    
    const [isVisible, setIsVisible] = useState(false);

    const resetAllStates = () => {
        setOriginImg("");
        setPublicImg("");
        setTimer(0);
        setPoseName("");
        idRef.current = -1;
        usedAtRef.current = "";
        todayRef.current = "";
        if(countdownRef.current){
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }

    const startTimer = (seconds:number) => {
        setOriginImg("");
        setPublicImg("");
        setTimer(seconds);
    };

    const handleCapture = () => {
        const images = captureCombinedImage(webcamRef, dataCanvasRef, lastResultRef.current);
        
        if(images){
            const { originImage, publicImage } = images;
            if(originImage !== "data:,") setOriginImg(originImage);
            if(publicImage !== "data:,") setPublicImg(publicImage);
        }
    };

    const saveAll = () => {
        const chk = (idRef.current === -1);
        if(idRef.current === -1) idRef.current = DBManager.getInstance().getID(); 
        if(todayRef.current !== "" && usedAtRef.current === "") usedAtRef.current = todayRef.current;

        const dataSave:Data = {
            id: idRef.current,
            poseName: poseName,
            vector: lastResultRef.current,
            originalImage: originImg,
            publicImage: publicImg,
            createdAt: new Date().toISOString(),
            usedAt: usedAtRef.current,
        }

        try{
            console.log("저장할 데이터: ", dataSave);
            if(!chk){
                DBManager.getInstance().updateData(dataSave);
            }
            else{
                DBManager.getInstance().addData(dataSave);
            }
        } catch(error){
            console.error("저장 실패: ", error);
        }
    }

    useEffect(() => { 
        if(!isVisible) return;

        if (timer > 0) { 
            countdownRef.current = setInterval(() => { 
                setTimer((prev:number) => prev - 1);
            }, 1000);
        }
        else if (timer === 0 && webcamRef.current) { 
            handleCapture();
        }
        return () => clearInterval(countdownRef.current);
    }, [timer, isVisible]); 

    const initPopUp: CreateDataPopUp = {
        currentPopUpType: PopUpType.CREATEDATA,
        init: () => {},
        open: () => setIsVisible(true),
        close: () => {
            resetAllStates();
            setIsVisible(false);
        },
        showData: (data:any) => {
            console.log("들어온 데이터 : ", data);
            if(data.poseName) setPoseName(data.poseName);
            if(data.originalImage) setOriginImg(data.originalImage);
            if(data.publicImage) setPublicImg(data.publicImage);
            if(data.id != null) idRef.current = data.id;
            if(data.usedAt) usedAtRef.current = data.usedAt;
            if(data.today) todayRef.current = data.today;
            setIsVisible(true);
        }
    };

    useEffect(() => {
        if(!isVisible) return;
        
        const handleMediaPipeResults = (results: any) => {
            lastResultRef.current = results;

            const video = webcamRef.current?.video;
            
            if (video && previewCanvasRef.current) {
                drawHolisticResults(
                    results, 
                    previewCanvasRef as React.RefObject<HTMLCanvasElement>, 
                    dataCanvasRef as React.RefObject<HTMLCanvasElement>, 
                    video
                );
            }
        };

        if(!holisticRef.current){
            holisticRef.current = InitHolistic(handleMediaPipeResults);
        }

        let camera: any = null;

        const startMediaPipe = () => {
            const videoElement = webcamRef.current?.video;

            if(videoElement && videoElement.videoWidth > 0){ // 웹캠과 웹캠 비디오가 잘 작동되면 
                camera = new Camera(videoElement, { // 카메라를 새로 만드는데
                    onFrame: async () => { // 프레임마다
                        if(videoElement.videoWidth > 0 && holisticRef.current){ // 만약 holisticRef이 있다면
                            await holisticRef.current.send({image: videoElement}); // 비디오를 보낸다. 이러면 위의 drawHolisticResults함수가 실행될것이다.
                        }
                    }, 
                    // 크기
                    width: 640,
                    height: 480
                });
                camera.start(); // 카메라 시작
            }else{
                setTimeout(startMediaPipe, 100);
            }
        };

        startMediaPipe();

        return () => {
            if(camera) camera.stop();
        };
    }, [isVisible]);

    useEffect(() => {
        PopUpManager.getInstance().pushPopUp(initPopUp);
    }, []);

    if (!isVisible) return null;

    return (
    <div className='modal-overlay' onClick={initPopUp.close}>
        <div className='modal-content-container' onClick={(e) => e.stopPropagation()}>
            
            {/* 1. 상단: 포즈 이름 입력 영역 */}
            <div className="input-section">
                <input 
                    type="text" 
                    className="pose-name-input" 
                    placeholder="포즈 이름을 입력해주세요"
                    value={poseName}
                    onChange={(e) => setPoseName(e.target.value)}
                />
            </div>

            {/* 2. 중앙: 2x2 그리드 영역 */}
            <div className="capture-grid">
                {/* 왼쪽: 원본 (촬영 중엔 웹캠, 촬영 후엔 스크린샷) */}
                <div className="grid-item">
                    <div className="item-label">원본</div>
                    <div className="display-box">
                        {/* 💡 1. 사진이 찍혔다면 이미지를 위에 띄움 */}
                        {originImg && <img src={originImg} alt="Original" className="captured-img" />}

                        {/* 💡 2. 웹캠과 캔버스는 항상 존재하되, 사진이 찍혔을 때만 숨김 */}
                        <div style={{ display: originImg ? 'none' : 'block', width: '100%', height: '100%' }}>
                            <Webcam 
                                ref={webcamRef} 
                                mirrored={true} 
                                className="video-element" 
                                screenshotFormat="image/png"
                                videoConstraints={{ width: 640, height: 480 }}
                            />
                            <canvas ref={previewCanvasRef} className="video-element" />
                            <canvas ref={dataCanvasRef} style={{ display: 'none' }} />
                            {timer > 0 && <div className="grid-timer">{timer}</div>}
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 공개용 (뼈대 합성 결과물) */}
                <div className="grid-item">
                    <div className="item-label">공개용</div>
                    <div className="display-box">
                        {publicImg ? (
                            <img src={publicImg} alt="Public" className="captured-img" />
                        ) : (
                            <div className="placeholder-text">촬영 후 분석 결과가 표시됩니다</div>
                        )}
                    </div>
                </div>

                {/* 3. 하단: 버튼 영역 */}
                <div className="grid-item footer-item">
                    <CustomButton 
                        label={timer > 0 ? '준비...' : '사진 촬영'} 
                        variant='primary' 
                        size='large' 
                        onClick={() => startTimer(3)}
                        disabled={timer > 0}
                    />
                </div>

                <div className="grid-item footer-item">
                    <CustomButton 
                        label='데이터 저장' 
                        variant='primary' 
                        size='large' 
                        onClick={() => saveAll()}
                        disabled={!poseName || !publicImg}
                    />
                </div>
            </div>
        </div>
    </div>
    );
}