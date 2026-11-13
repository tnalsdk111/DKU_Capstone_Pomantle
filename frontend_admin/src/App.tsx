import React, { useState, useEffect } from 'react';
import './App.css';
import CalenderPage from './pages/calendarPage/CalendarPage';
import { CreateDataPopUp } from './components/popup/createDataPopUp/CreateDataPopUp';
import DataPage from './pages/dataPage/DataPage';
import { PopUpManager } from './managers/PopUpManager';
import { DBManager } from './managers/DBManager';
import { CalendarDataPopUp } from './components/popup/calendatDataPopUp/CalendarDataPopUp';
import { SelectDataPopUp } from './components/popup/selectDataPopUp/SelectDataPopUp';

function App() {
  const [currentPage, setCurrentPage] = useState<'calendar' | 'data'>('calendar');
  const [isLoading, setIsLoading] = useState(true);
  const dbManager = DBManager.getInstance();

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
      <div className="admin-app">
        <div className="admin-loading-card">
          <div className="admin-loading-emoji">⚡</div>
          <p className="admin-loading-text">서버로부터 포즈 데이터를 동기화하고 있어요…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      {/* Header Section */}
      <header className="admin-header">
        <div className="admin-badge">
          <span>🛠️</span>
          <span>ADMIN CONSOLE</span>
        </div>
        <h1 className="admin-title">POMANTLE ADMIN</h1>
        <p className="admin-subtitle">데일리 포즈 문제 출제 및 데이터베이스 관리 허브</p>
      </header>
      
      {/* Tab Navigation */}
      <nav className="nav-tab-group">
        <button
          type="button"
          className={`nav-tab-btn ${currentPage === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentPage('calendar')}
          id="tab-calendar"
        >
          <span>📅</span>
          <span>달력 데이터 배정</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${currentPage === 'data' ? 'active' : ''}`}
          onClick={() => setCurrentPage('data')}
          id="tab-data"
        >
          <span>📦</span>
          <span>전체 포즈 데이터 ({dbManager.getAllData().length})</span>
        </button>
      </nav>

      {/* Main Page Area */}
      <main className="admin-content-area">
        {currentPage === 'calendar' ? <CalenderPage /> : <DataPage />}
      </main>

      {/* Popups */}
      <CalendarDataPopUp />
      <CreateDataPopUp />
      <SelectDataPopUp />
    </div>
  );
}

export default App;
