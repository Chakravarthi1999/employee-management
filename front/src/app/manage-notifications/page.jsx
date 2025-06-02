"use client"
import React, { useState, useEffect, useContext } from 'react';
import "./mn.css"
import axios from 'axios';
import getApiUrl from '@/constants/endpoints';
import NotificationModal from '../NM/page';
import AuthContext from '@/context/AuthContext';
import { useRouter } from 'next/navigation';


const Managenotifications = () => {

  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', description: '', image: null });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const {user,loading}=useContext(AuthContext)
  const router=useRouter()


   const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${getApiUrl("notifications")}`);
    setNotifications(res.data); 
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    }
  };

useEffect(() => {
  if (!user&&!loading) {
    router.push("/");  
  }
    fetchNotifications();

}, [user,loading]);

if (!user) return null;



 const handleDeleteNotification = async (id) => {
  try {
    await axios.delete(`${getApiUrl("notifications")}/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  } catch (error) {
    console.error("Failed to delete notification:", error);
    alert("Error deleting notification.");
  }
};


 

  const handleEdit = (notif) => {
    setNotifForm({
      title: notif.title,
      description: notif.description,
      image: notif.image,
    });
    setEditId(notif.id);
    setEditMode(true);
    setShowModal(true);
  };
const handleCreateNotification = async (eOrFormData) => {
  let formData;

  if (eOrFormData instanceof FormData) {
    formData = eOrFormData;
  } else {
    eOrFormData.preventDefault();
    formData = new FormData();
    formData.append("title", notifForm.title);
    formData.append("description", notifForm.description);
    if (notifForm.image && typeof notifForm.image !== 'string') {
      formData.append("image", notifForm.image);
    }
  }

  try {
    if (editMode && editId) {
      await axios.put(
       `${getApiUrl("notifications")}/${editId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    } else {
      await axios.post(`${getApiUrl("notifications")}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    await fetchNotifications();
    setNotifForm({ title: "", description: "", image: '' });
    setEditMode(false);
    setEditId(null);
    setShowModal(false);
  } catch (err) {
    console.error("Notification submit error:", err);
    alert("Failed to submit notification.");
  }
};



  return (
    
   <div className="notifications-container">
  <button
    onClick={() => {
      setShowModal(true);
      setEditMode(false);
      setNotifForm({ title: '', description: '', image: null });
    }}
    className="create-btn"
  >
    Create Notification
  </button>

  <table className="notifications-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Description</th>
        <th>Image</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {notifications.length > 0 ? (
        notifications.map((notif) => (
          <tr key={notif.id}>
            <td>{notif.title}</td>
            <td>{notif.description}</td>
            <td>
              <img
                src={`${getApiUrl("uploads")}/${notif.image}`}
                alt="Notification"
                className="notification-image"
              />
            </td>
            <td>
              <div className="n-acations">
                <button onClick={() => handleEdit(notif)} className="btn-edit">Edit</button>
                <button onClick={() => handleDeleteNotification(notif.id)} className="btn-delete">Delete</button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4" className="empty-message">No notifications available.</td>
        </tr>
      )}
    </tbody>
  </table>

  {showModal && (
    <NotificationModal
      onClose={() => {
        setShowModal(false);
        setEditMode(false);
        setEditId(null);
        setNotifForm({ title: "", description: "", image:'' });
      }}
      notifForm={notifForm}
      setNotifForm={setNotifForm}
      editMode={editMode}
      onSubmit={handleCreateNotification}
    />
  )}
</div>
   
  );
};

export default Managenotifications;
