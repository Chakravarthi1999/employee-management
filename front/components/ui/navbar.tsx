"use client";
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FiBell, FiMenu } from "react-icons/fi";
import { usePathname, useRouter } from 'next/navigation';
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
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else {
        setUserrole(user.role);

        const fetchCount = () => {
          axios.get(`${getApiUrl("count")}/${user.id}`).then((res) => {
            setNotificationCount(res.data.count);
            setHasUnread(res.data.count > 0);
          });
        };

        fetchCount();
        const interval = setInterval(fetchCount, 5000);

        const handleClickOutside = (event: MouseEvent) => {
          if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
            setShowSidebar(false);
          }
        };

        if (showSidebar) {
          document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
          clearInterval(interval);
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }
  }, [user, loading]);

  useEffect(() => {
    const savedSidebar = localStorage.getItem("showProfileSidebar");
    if (savedSidebar === "true") {
      setShowProfileSidebar(true);
    }
  }, []);

  useEffect(() => {
    if (pathname !== "/edit-profile" && pathname !== "/change-password") {
      localStorage.removeItem("showProfileSidebar");
      setShowProfileSidebar(false);
    }
  }, [pathname]);

  const handleBellClick = async () => {
    setShowNotifications(!showNotifications);
    if (user) {
      await axios.post(`${getApiUrl("markRead")}/${user.id}`);
      setNotificationCount(0);
      setHasUnread(false);
    }
  };

  type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    dob: string;
    image: string;
    role: string;
    type?: string;
  };

  const handleEdit = (employee: User) => {
    setShowSidebar(false);
    setShowProfileSidebar(true);
    localStorage.setItem('selectedEmployee', JSON.stringify(employee));
    localStorage.setItem("showProfileSidebar", "true");
    router.push('/edit-profile');
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
        <button className="nav-btn" onClick={() => setShowSidebar(!showSidebar)}>
          <FiMenu size={24} />
        </button>
      </div>

      {showSidebar && (
        <div ref={panelRef} className="sidebar-dropdown">
          <button onClick={() => handleEdit(user)} className="sidebar-link">Edit Profile</button>
          <button
            onClick={() => {
              setShowSidebar(false);
              setShowProfileSidebar(true);
              localStorage.setItem("showProfileSidebar", "true");
              router.push('/change-password');
            }}
            className="sidebar-link"
          >
            Change Password
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("showProfileSidebar");
              logout();
            }}
            className="sidebar-link"
          >
            Logout
          </button>
        </div>
      )}

      {showProfileSidebar && (
        <div className="sidebar-left">
          <h3 className="sidebar-heading">My Profile</h3>
          <button
            onClick={() => handleEdit(user)}
            className={`sidebar-link ${pathname === "/edit-profile" ? "active-link" : ""}`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => {
              localStorage.setItem("showProfileSidebar", "true");
              router.push('/change-password');
            }}
            className={`sidebar-link ${pathname === "/change-password" ? "active-link" : ""}`}
          >
            Change Password
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
