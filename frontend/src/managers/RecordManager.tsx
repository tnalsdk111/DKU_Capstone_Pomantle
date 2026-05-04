export class RecordManager {
    private static instance: RecordManager;

    private constructor() {
        
    }

    public static getInstance(): RecordManager {
        if (!RecordManager.instance) {
            RecordManager.instance = new RecordManager();
        }
        return RecordManager.instance;
    }
    
    public init(): void {
        console.log("PopUpManager 준비 완료!");
    }
}