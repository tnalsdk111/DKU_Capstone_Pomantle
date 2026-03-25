export class GameManager {
    private static instance: GameManager;

    private constructor() {
        
    }

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    
    public init(): void {
        console.log("PopUpManager 준비 완료!");
    }
}