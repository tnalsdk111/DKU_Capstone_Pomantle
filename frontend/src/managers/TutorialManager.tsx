export class TutorialManager {
    private static instance: TutorialManager;

    private constructor() {
        
    }

    public static getInstance(): TutorialManager {
        if (!TutorialManager.instance) {
            TutorialManager.instance = new TutorialManager();
        }
        return TutorialManager.instance;
    }
    
    public init(): void {
        console.log("PopUpManager 준비 완료!");
    }
}