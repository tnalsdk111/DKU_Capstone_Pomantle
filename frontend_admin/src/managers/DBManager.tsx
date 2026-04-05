import { Data } from "../models/Data";

let dummyData = [ // 샘플링용 데이터
  { id: 1, poseName: "사과", originalImage: "...", publicImage: "...", date:"2026-4-4" },
  { id: 2, poseName: "바나나", originalImage: "...", publicImage: "...", date:"2026-4-4" },
  { id: 3, poseName: "키위", originalImage: "...", publicImage: "...", date:"2026-4-4" },
  { id: 4, poseName: "야쿠르트", originalImage: "...", publicImage: "...", date:"2026-4-4" },
  { id: 5, poseName: "오렌지", originalImage: "...", publicImage: "...", date:"2026-4-4" },
  { id: 6, poseName: "귤", originalImage: "...", publicImage: "...", date:"2026-4-4" },
];

export class DBManager{
    private static instance: DBManager

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
        return (dummyData.find(item => item.date === date)) || null;
    }

    public saveData = (data: Data): boolean => {
        const isExist = dummyData.some(item => item.id === data.id);
        if(isExist) return false;

        dummyData.push(data);
        return true;
    }

    public deleteData = (id: number): boolean => {
        const index = dummyData.findIndex(item => item.id === id);
        if(index == -1) return false;

        dummyData.splice(index, 1);
        return true;
    }

    public updateData = (data: Data): boolean => {
        const index = dummyData.findIndex(item => item.id === data.id);
        if(index == -1) return false;

        const newData = [...dummyData];
        newData[index] = data;
        dummyData = newData;

        return true;
    }

    public getAllData = (): Data[] => {
        return [...dummyData];
    }
}