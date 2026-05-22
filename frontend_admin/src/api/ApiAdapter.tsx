import { PoseData } from "../models/ApiTypes";

export const ApiAdapter = {
    transformTargetVector: (rawTargetVector: any) => {
        if ('pose' in rawTargetVector || 'leftHand' in rawTargetVector || 'rightHand' in rawTargetVector) {
            console.log("이미 정제된 포즈 데이터이므로 변환 없이 그대로 반환합니다.");
            return {
                pose: rawTargetVector.pose || null,
                leftHand: rawTargetVector.leftHand || null,
                rightHand: rawTargetVector.rightHand || null
            };
        }

        // 🚨 뒤집기(mirrorPoint) 없이 순수하게 좌표쌍만 변환합니다.
        const convertToCoordinatePairs = (landmarks: any[]) => {
            if(!landmarks) return null;
            return landmarks.map(point => {
                if (Array.isArray(point)) return point;
                return [point.x, point.y];
            });
        };
        
        const rawPose = rawTargetVector.poseLandmarks;
        const rawLeftHand = rawTargetVector.leftHandLandmarks;
        const rawRightHand = rawTargetVector.rightHandLandmarks;

        let filteredPose = null;
        if (rawPose) {
            const targetIndices = [11, 12, 13, 14];
            filteredPose = targetIndices.map(idx => {
                const point = rawPose[idx];
                if (!point) return [0, 0];
                return Array.isArray(point) ? point : [point.x, point.y];
            });
        }

        // 🚨 제 짝 그대로 정직하게 반환합니다.
        return {
            pose: filteredPose,
            leftHand: convertToCoordinatePairs(rawRightHand) || null,
            rightHand: convertToCoordinatePairs(rawLeftHand) || null
        };
    },

    toCreatePosePayLoad: (rawForm: PoseData) => {
        return {
            "poseName" : rawForm.poseName,
            "target_vector" : ApiAdapter.transformTargetVector(rawForm.target_vector),
            "originalImage" : rawForm.originalImage,
            "publicImage" : rawForm.publicImage,
            "usedAt" : rawForm.usedAt
        };
    }
};