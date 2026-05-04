import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AdminCalendar.css';
import { PopUpManager } from '../../managers/PopUpManager';
import { PopUpType } from '../../models/PopUpType';

const AdminCalendar = () => {
  const onDataClick = (value: Date) => {
    const dateString = `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`;
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