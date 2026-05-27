import React, {useState, useEffect} from 'react';
import './App.css';
import CalenderPage from './pages/calendarPage/CalendarPage';
import { CreateDataPopUp } from './components/popup/createDataPopUp/CreateDataPopUp';
import DataPage from './pages/dataPage/DataPage';
import CustomButton from './components/button/CustomButton';
import { PopUpManager } from './managers/PopUpManager';
import { DBManager } from './managers/DBManager';
import { CalendarDataPopUp } from './components/popup/calendatDataPopUp/CalendarDataPopUp';
import { SelectDataPopUp } from './components/popup/selectDataPopUp/SelectDataPopUp';

function App() {
  const [currentPage, setCurrentPage] = useState<'calendar' | 'data'>('calendar');
  const [isLoading, setIsLoading] = useState(true);
  const dbManager = DBManager.getInstance();
  const popUpManager = PopUpManager.getInstance();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dbManager.refreshData(); 
      } catch (error) {
        console.error("초기 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false); 
      }
    };
    loadInitialData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '20px' }}>
        서버로부터 데이터를 동기화하는 중입니다...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '40px' }}>Pomentle Admin Page</h1>
      
      <div>
        <CustomButton label='전체 데이터 확인' variant='primary' size='large' onClick={()=>setCurrentPage('data')}/>
        <CustomButton label='달력을 이용한 데이터 배정' variant='danger' size='large' onClick={()=>setCurrentPage('calendar')}/>
      </div>

      <div>
        {currentPage == 'calendar' ? <CalenderPage /> : <DataPage/>}
      </div>

      <div>
        <CalendarDataPopUp/>
        <CreateDataPopUp/>
        <SelectDataPopUp/>
      </div>
    </div>
  );
}

export default App;
