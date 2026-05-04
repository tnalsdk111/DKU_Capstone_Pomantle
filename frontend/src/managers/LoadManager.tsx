export class LoadManager {
    private static instance: LoadManager;

    private constructor() {
        
    }

    public static getInstance(): LoadManager {
        if (!LoadManager.instance) {
            LoadManager.instance = new LoadManager();
        }
        return LoadManager.instance;
    }
    
    public init(): void {
        console.log("PopUpManager 준비 완료!");
    }
}