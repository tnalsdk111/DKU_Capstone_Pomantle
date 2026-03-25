import axios from 'axios'
import { API_BASE_URL } from '../constants/ApiConfig';

const API_URL = API_BASE_URL;

class ApiService{
    private static instance: ApiService;

    public static getInstance(): ApiService{
        if(!ApiService.instance){
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    async saveRecord(record: any){
        try{
            const response = await axios.post(`${API_URL}/save-record`, record);
            return response.data;
        } catch(error){
            console.error("서버 저장 실패: ", error);
            throw error;
        }
    }
}

export default ApiService;