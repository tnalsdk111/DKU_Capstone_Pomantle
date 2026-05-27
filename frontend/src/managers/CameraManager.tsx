export class CameraManager {
    private static instance: CameraManager;

    private constructor() {
        
    }

    public static getInstance(): CameraManager {
        if (!CameraManager.instance) {
            CameraManager.instance = new CameraManager();
        }
        return CameraManager.instance;
    }
    
    public init(): void {
        console.log("PopUpManager 준비 완료!");
    }
}