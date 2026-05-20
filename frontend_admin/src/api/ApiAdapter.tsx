import { PoseData } from "../models/ApiTypes";

export const ApiAdapter = {
    transformTargetVector: (rawTargetVector: any) => {
        // {}이걸 []이걸로 변경
        const convertToCoordinatePairs = (landmarks: any[]) => {
            if(!landmarks) return null;
            return landmarks.map(point => [point.x, point.y]); // z축 제외
        };

        const rawPose = rawTargetVector.poseLandmarks; // 몸
        const rawLeftHand = rawTargetVector.leftHandLandmarks;
        const rawRightHand = rawTargetVector.rightHandLandmarks;

        // return convertToCoordinatePairs(rawPose) || [];

        return {
            pose: convertToCoordinatePairs(rawPose) || [],
            leftHand: convertToCoordinatePairs(rawLeftHand) || [],
            rightHand: convertToCoordinatePairs(rawRightHand) || []
        }
    },

    toCreatePosePayLoad: (rawForm: PoseData) => {
        const extractPureBase64 = (imageStr: string | null) => {
            if(!imageStr) return "";
            let pureBase64 = imageStr.includes(",") ? imageStr.split(",")[1] : imageStr;
            // + 기호는 - 로 변경
            // / 기호는 _ 로 변경
            return pureBase64.replace(/\+/g, '-').replace(/\//g, '_');
        }
        return {
            "poseName" : rawForm.poseName,
            "target_vector" : ApiAdapter.transformTargetVector(rawForm.target_vector),
            "originalImage" : rawForm.originalImage,
            "publicImage" : rawForm.publicImage
        };
    }
};