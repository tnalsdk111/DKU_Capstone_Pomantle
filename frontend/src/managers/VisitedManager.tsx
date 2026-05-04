export class VisitedManager {
    private static instance: VisitedManager;

    private constructor() {
        
    }

    public static getInstance(): VisitedManager {
        if (!VisitedManager.instance) {
            VisitedManager.instance = new VisitedManager();
        }
        return VisitedManager.instance;
    }
    
    public init(): void {
        console.log("PopUpManager 준비 완료!");
    }
}