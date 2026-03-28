import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminCalendar.css';
import { PopUpManager } from '../../managers/PopUpManager';
import { PopUpType } from '../../models/PopUpType';

const AdminCalendar = () => {
  const onDataClick = () => {
    PopUpManager.getInstance().openPopUp(PopUpType.CALENDARDATA);
  }

  return (
    <div className="admin-calendar-wrapper">
      <Calendar onClickDay={onDataClick}/>
    </div>
  );
};

export default AdminCalendar;