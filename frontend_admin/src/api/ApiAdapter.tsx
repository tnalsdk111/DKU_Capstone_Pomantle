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
        // {}이걸 []이걸로 변경
        const convertToCoordinatePairs = (landmarks: any[]) => {
            if(!landmarks) return null;
            return landmarks.map(point => {
                if (Array.isArray(point)) return point;
                return [point.x, point.y];
        });
        };

        const rawPose = rawTargetVector.poseLandmarks; // 몸
        const rawLeftHand = rawTargetVector.leftHandLandmarks;
        const rawRightHand = rawTargetVector.rightHandLandmarks;

        return {
            pose: convertToCoordinatePairs(rawPose) || null,
            leftHand: convertToCoordinatePairs(rawLeftHand) || null,
            rightHand: convertToCoordinatePairs(rawRightHand) || null
        }
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