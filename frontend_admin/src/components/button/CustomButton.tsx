import React from "react";
import './CustomButton.css'

interface ButtonProps{
    label? : string; // 버튼에 들어가는 글자
    onClick?: ()=> void; // 클릭시 실행 함수
    variant?: 'primary' | 'danger' | 'success' | 'image-btn'; // 버튼 색상 타입
    size?: 'small' | 'medium' | 'large' | 'square'; // 버튼 크기
    disabled?: boolean; // 비활성화 여부
    children?: React.ReactNode; // 이미지 태크 등을 넣기 위한 속성
}

const CustomButton = ({
    // 기본 초기화 값
    label,
    onClick,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    children
}: ButtonProps) => {
    return (
        <button className={`custom-btn ${variant} ${size}`}
                onClick={onClick}
                disabled={disabled}>
            {children}
            {label && <span>{label}</span>}
        </button>
    );
};

export default CustomButton;