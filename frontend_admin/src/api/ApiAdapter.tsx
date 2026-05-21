import { PoseData } from "../models/ApiTypes";

export const ApiAdapter = {
    transformTargetVector: (rawTargetVector: any) => {
        // {}이걸 []이걸로 변경
        const convertToCoordinatePairs = (landmarks: any[]) => {
            if(!landmarks) return null;
            return landmarks.map(point => ({
                x: point.x,
                y: point.y
            }));
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