export class SaveManager {
    private static instance: SaveManager;

    private constructor() {
        
    }

    public static getInstance(): SaveManager {
        if (!SaveManager.instance) {
            SaveManager.instance = new SaveManager();
        }
        return SaveManager.instance;
    }
    
    public init(): void {
        console.log("PopUpManager 준비 완료!");
    }
}