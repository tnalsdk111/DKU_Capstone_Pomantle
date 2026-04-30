import { Data } from "../models/Data";

let dummyData: Data[] = [ // 샘플링용 데이터
  { id: 1, poseName: "사과", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4" },
  { id: 2, poseName: "바나나", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4" },
  { id: 3, poseName: "키위", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4" },
  { id: 4, poseName: "야쿠르트", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4" },
  { id: 5, poseName: "오렌지", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4" },
  { id: 6, poseName: "귤", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4" },
];

export class DBManager{
    private static instance: DBManager;
    private listeners: (() => void)[] = [];

    subscribe(listeners: () => void){
        this.listeners.push(listeners);
    }
    unsubscribe(listeners: () => void){
        this.listeners = this.listeners.filter(l => l !== listeners);
    }

    private notify(){
        this.listeners.forEach(l => l());
    }

    private constructor() {};

    public static getInstance(): DBManager{
        if (!DBManager.instance) {
            DBManager.instance = new DBManager();
        }
        return DBManager.instance;
    }

    public getData = (id: number): Data | null => {
        return (dummyData.find(item => item.id === id)) || null;
    }

    public getDataByDate = (date: string): Data | null =>{
        return (dummyData.find(item => item.createdAt === date)) || null;
    }

    public addData = (data: Data): boolean => {
        const isExist = dummyData.some(item => item.id === data.id);
        if(isExist) return false;

        dummyData.push(data);
        this.notify();
        return true;
    }

    public deleteData = (id: number): boolean => {
        const index = dummyData.findIndex(item => item.id === id);
        if(index == -1) return false;

        dummyData.splice(index, 1);
        this.notify();
        return true;
    }

    public updateData = (data: Data): boolean => {
        const index = dummyData.findIndex(item => item.id === data.id);
        console.log(index);
        if(index == -1) return false;

        const newData = [...dummyData];
        newData[index] = data;
        dummyData = newData;

        this.notify();

        return true;
    }

    public getAllData = (): Data[] => {
        return [...dummyData];
    }
}