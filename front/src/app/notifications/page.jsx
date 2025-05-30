import React, { useContext, useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import './notifications.css';
import AuthContext from '@/context/AuthContext';
import getApiUrl from '@/constants/endpoints';

const formatDateTime = (createdAt) => {
  const now = new Date();
  const date = new Date(createdAt.replace(" ", "T"));

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const timeStr = date.toLocaleTimeString(undefined, options);

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  const dateStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return `${dateStr}, ${timeStr}`;
};

const Notifications = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  const panelRef = useRef(null);
  
  useEffect(() => {
    fetchNotifications();
     const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();  
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);


  
  const fetchNotifications = async () => {
    try {
      const notifRes = await axios.get(`${getApiUrl("notifications")}`);
      const systemNotifications = notifRes.data;

      const birthdayRes = await axios.get(`${getApiUrl("birthdays")}`
      );

      const birthdayNotifs = birthdayRes.data.map((emp) => ({
        id: `${emp.id}`,
        createdAt: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        title: "🎉 Birthday Notification",
        description:
          emp.id === user.id
            ? `🎂 Wish you a happy birthday ${emp.name}!`
            : `🎉 Today is ${emp.name}'s birthday.`,
      }));

      setNotifications([...birthdayNotifs, ...systemNotifications]);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    }
  };

  return (
    <div ref={panelRef} className="notification-panel">
      <div className="notification-header">
        <h2>Notifications</h2>
        <IoClose onClick={onClose} size={24} className="close-btn" />
      </div>
      <div className="notification-content">
        {notifications.map((item) => (
          <div key={item.id} className="notification-item">
            <p className="notification-time">{formatDateTime(item.createdAt)}</p>
            <p className="notification-title"><strong>{item.title}</strong></p>
            <p className="notification-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
