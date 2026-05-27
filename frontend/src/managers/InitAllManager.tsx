export class InitAllManager {
    private static instance: InitAllManager;

    private constructor() {
        
    }

    public static getInstance(): InitAllManager {
        if (!InitAllManager.instance) {
            InitAllManager.instance = new InitAllManager();
        }
        return InitAllManager.instance;
    }
    
    public init(): void {
        console.log("PopUpManager 준비 완료!");
    }
}