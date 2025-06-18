import React, { useContext, useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import AuthContext from '@/context/AuthContext';
import getApiUrl from '@/constants/endpoints';
import { onChildAdded, ref, remove } from 'firebase/database';
import { database } from '@/utils/firebase';

interface Notification {
  id: string;
  createdAt: string;
  title: string;
  description: string;
}

interface Employee {
  id: number;
  name: string;
}

const formatDateTime = (createdAt: string) => {
  const date = new Date(createdAt.replace(" ", "T"));
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay === 0) {
    if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return "Just now";
    }
  }

  if (diffDay === 1) {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    const timeStr = date.toLocaleTimeString(undefined, options);
    return `Yesterday at ${timeStr}`;
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleString(undefined, options);
};

const Notifications = ({ onClose }: { onClose: () => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within AuthProvider");
  }

  const { user } = authContext;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBirthdays();
    fetchNotifications();
    listenRealtimeNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchBirthdays = async () => {
    try {
      const birthdayRes = await axios.get<Employee[]>(getApiUrl("birthdays"));
      const birthdayNotifs = birthdayRes.data.map((emp: Employee) => ({
        id: `bday-${emp.id}`,
        createdAt: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        title: "🎉 Birthday Notification",
        description:
          user && emp.id === user.id
            ? `🎂 Wish you a happy birthday ${emp.name}!`
            : `🎉 Today is ${emp.name}'s birthday.`,
      }));

      setNotifications((prev) => {
        const existingIds = new Set(prev.map(n => n.id));
        const newBirthdays = birthdayNotifs.filter(n => !existingIds.has(n.id));
        return [...prev, ...newBirthdays];
      });
    } catch (error) {
      console.error("Failed to fetch birthdays:", error);
    }
  };

  const listenRealtimeNotifications = () => {
    if (!user) return;

    const notificationsRef = ref(database, 'notifications');

    onChildAdded(notificationsRef, async (snapshot) => {
      const data = snapshot.val();

      if (data.receiverIds && data.receiverIds.includes(user.id)) {
        const newNotif: Notification = {
          id: snapshot.key!,
          createdAt: data.createdAt,
          title: data.title,
          description: data.description,
        };

        setNotifications((prev) => {
          if (prev.some(notif => notif.id === newNotif.id)) {
            return prev;
          }
          return [newNotif, ...prev];
        });

        const notifRef = ref(database, `notifications/${snapshot.key}`);
        await remove(notifRef);
      }
    });
  };

  const fetchNotifications = async () => {
    try {
      if (!user) return;

      const res = await axios.get(`${getApiUrl("notifications")}/${user.id}`);
      const data: Notification[] = res.data.map((notif: any) => ({
        id: notif.id.toString(),
        createdAt: notif.createdAt,
        title: notif.title,
        description: notif.description,
      }));

      setNotifications((prev) => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNotifications = data.filter(n => !existingIds.has(n.id));
        return [...prev, ...newNotifications];
      });
    } catch (err) {
      console.error("Failed to fetch backend notifications", err);
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
            <p className="notification-time">
              {item.id.startsWith('bday-')
                ? "Today 12:00 AM"
                : formatDateTime(item.createdAt)}
            </p>
            <p className="notification-title">
              <strong>{item.title}</strong>
            </p>
            <p className="notification-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
