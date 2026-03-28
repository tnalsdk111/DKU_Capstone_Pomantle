import React, {useState} from 'react';
import './App.css';
import CalenderPage from './pages/calendarPage/CalendarPage';
import DataPage from './pages/dataPage/DataPage';
import CustomButton from './components/button/CustomButton';
import { PopUpManager } from './managers/PopUpManager';

function App() {
  const [currentPage, setCurrentPage] = useState<'calendar' | 'data'>('calendar');
  const popUpManager = PopUpManager.getInstance();

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
    </div>
  );
}

export default App;
