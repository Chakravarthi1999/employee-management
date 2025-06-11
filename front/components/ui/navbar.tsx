"use client"
import React, { useContext, useEffect, useState } from 'react'; 
import { FiBell } from "react-icons/fi"; 
import { useRouter } from 'next/navigation';
import AuthContext from '@/context/AuthContext';
import Link from 'next/link';
import getApiUrl from '@/constants/endpoints';
import Notifications from './notifications';
import axios from 'axios';

const Navbar = () => {
  const router = useRouter();
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext is undefined. Make sure your component is wrapped with AuthProvider.");
  }

  const { user, logout, loading } = auth;
  const [showNotifications, setShowNotifications] = useState(false);
  const [userrole, setUserrole] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else {
           setUserrole(user.role);
         const fetchCount = () => {
      axios.get(`${getApiUrl("count")}/${user.id}`).then(res => {
        setNotificationCount(res.data.count);
        setHasUnread(res.data.count > 0);
      });
    };

    fetchCount();  

    const interval = setInterval(fetchCount, 5000); 

    return () => clearInterval(interval);
      }
    }
  }, [user, loading]);

   


  const handleBellClick = async () => {
    setShowNotifications(!showNotifications);
    if (user) {
      await axios.post(`${getApiUrl("markRead")}/${user.id}`);
      setNotificationCount(0);
      setHasUnread(false);
    }
  };
 

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user.image && (
          <img
            src={`${getApiUrl("uploads")}/${user.image}`}
            alt="Profile"
            className="profile-pic"
          />
        )}
        <Link href="dashboard" className="nav-btn">Dashboard</Link>
        <Link href="profile" className="nav-btn">My Profile</Link>
      </div>

      <div className="navbar-right">
        {userrole === "admin" ? (
          <>
            <Link href="add-employee" className="nav-btn">Add Employee</Link>
            <Link href="manage-notifications" className="nav-btn">Manage Notifications</Link>
            <Link href="CompanyBanners" className="nav-btn">Company Banners</Link>
          </>
        ) : (
          <>
            <button className="nav-btn bell-icon-wrapper" onClick={handleBellClick}>
              <FiBell size={24} />
              {hasUnread && notificationCount > 0 && (
                <span className="notification-count-badge">{notificationCount}</span>
              )}
            </button>

            {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
          </>
        )}
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
