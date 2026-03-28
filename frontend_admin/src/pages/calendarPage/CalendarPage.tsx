import React from 'react';
import AdminCalendar from '../../components/calender/AdminCalendar';
import './CalendarPage.css'
import { CalendarDataPopUp } from '../../components/popup/calendatDataPopUp/CalendarDataPopUp';

function CalenderPage() {
  return (
    <div>
      <CalendarDataPopUp/>
      <AdminCalendar />
    </div>
  );
}

export default CalenderPage;