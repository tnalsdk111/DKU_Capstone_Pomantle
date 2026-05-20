import { Data } from "../models/Data";
import ApiService from "../api/ApiService";
import { PoseData } from "../models/ApiTypes";

// let dummyData: Data[] = [ // 샘플링용 데이터
//   { id: 0, poseName: "사과", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4", usedAt: "2026-5-3" },
//   { id: 1, poseName: "바나나", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4", usedAt: "2026-5-4" },
//   { id: 2, poseName: "키위", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4", usedAt: "2026-5-5" },
//   { id: 3, poseName: "야쿠르트", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4", usedAt: "2026-5-6" },
//   { id: 4, poseName: "오렌지", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4", usedAt: "2026-5-7" },
//   { id: 5, poseName: "귤", originalImage: "...", publicImage: "...", vector: null, createdAt:"2026-4-4", usedAt: "2026-5-8" },
// ];

export class DBManager{
    private static instance: DBManager;
    private dataList: PoseData[] = [];
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

    public async refreshData(): Promise<void>{ // 데이터 새로고침
        try{
            const freshData = await ApiService.getInstance().getPoses();
            this.dataList = freshData;
            this.notify();
            console.log("데이터 동기화 성공");
        } catch (error){
            console.log("데이터 동기화 실패: ", error);
            throw error;
        }
    }

    public getAllData = (): PoseData[] => { // 모든 데이터 가져오기
        return this.dataList;
        //return [...dummyData];
    }

    public getData = (id: number): PoseData | null => { // id를 통해 특정 데이터 가져오기
        return this.dataList.find(item => item.id === id) || null;
        // return (dummyData.find(item => item.id === id)) || null;
    }

    public getDataByDate = (date: string): PoseData | null =>{ // 날짜를 통해 특정 데이터 가져오기
        return this.dataList.find(item => item.usedAt === date) || null;
        // return (dummyData.find(item => item.usedAt === date)) || null;
    }

    public async addData(data: PoseData): Promise<boolean>{ // 데이터 추가하기
        // const isExist = dummyData.some(item => item.id === data.id);
        //if(isExist) return false;

        //dummyData.push(data);

        try{
            console.log(data);
            await ApiService.getInstance().createPose(data);
            await this.refreshData(); // 등록 후 전체 목록 새로고침
            return true;
        } catch (error) {
            console.error("포즈 등록 실패:", error);
            return false;
        }

        // this.notify();
        // return true;
    }

    public async deleteData(id: number): Promise<boolean> { // 데이터 삭제하기
        // const index = dummyData.findIndex(item => item.id === id);
        //if(index == -1) return false;

        //this.dataList.splice(index, 1);
        // dummyData.splice(index, 1);
        try {
            await ApiService.getInstance().deletePose(id);
            await this.refreshData();
            this.notify();
            return true;
        } catch (error) {
            console.error("포즈 삭제 실패:", error);
            return false;
        }
        // this.notify();
        // return true;
    }

    public async assignPose(date: string, poseId: number): Promise<boolean> { // 특정 날짜에 데이터 할당하기
        try {
            await ApiService.getInstance().assignPoseToDate(date, poseId);
            await this.refreshData();
            return true;
        } catch (error) {
            console.error("포즈 할당 실패:", error);
            return false;
        }
    }

    public async unassignPose(date: string): Promise<boolean> { // 특정 날짜 데이터 할당 취소하기
        try {
            await ApiService.getInstance().unassignPoseFromDate(date);
            await this.refreshData(); 
            return true;
        } catch (error) {
            console.error("포즈 할당 취소 실패:", error);
            return false;
        }
    }

    public updateData = (data: PoseData): boolean => { // 기존 데이터 수정하기
        // const index = dummyData.findIndex(item => item.id === data.id);
        //if(index == -1) return false;

        //const newData = [...this.dataList];
        // const newData = [...dummyData];
        //newData[index] = data;
        //this.dataList = newData;
        // dummyData = newData;

        this.notify();

        return true;
    }

    public getID = () => { // 새로 만들어질 데이터의 id 지정해주기

        // if(dummyData.length === 0) return 0;
        // else return dummyData[dummyData.length-1].id + 1;
    }
}