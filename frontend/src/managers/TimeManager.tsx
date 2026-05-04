export class TimeManager {
    private static instance: TimeManager;

    private constructor() {
        
    }

    public static getInstance(): TimeManager {
        if (!TimeManager.instance) {
            TimeManager.instance = new TimeManager();
        }
        return TimeManager.instance;
    }
    
    public init(): void {
        console.log("PopUpManager 준비 완료!");
    }
}