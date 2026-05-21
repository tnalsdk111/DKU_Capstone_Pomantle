import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminCalendar.css';
import { PopUpManager } from '../../managers/PopUpManager';
import { PopUpType } from '../../models/PopUpType';

const AdminCalendar = () => {
  const onDataClick = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const date = String(value.getDate()).padStart(2, '0');

    const dateString = `${year}-${month}-${date}`;
    const payload = {
      date: dateString,
    };
    PopUpManager.getInstance().openPopUp(PopUpType.CALENDARDATA, payload);
  }

  return (
    <div className="admin-calendar-wrapper">
      <Calendar onClickDay={(value) => onDataClick(value as Date)}/>
    </div>
  );
};

export default AdminCalendar;