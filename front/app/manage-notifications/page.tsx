"use client"
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import getApiUrl from '@/constants/endpoints';
import AuthContext from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import NotificationModal from '@/components/ui/mnm';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/confirmModal';
import Breadcrumb from '@/components/ui/breadcrumb';

const breadcrumbItems = [
  { label: "Dashboard", href: "/" },
  { label: "Manage Notifications" } 
];
type Notification = {
  id: number;
  title: string;
  description: string;
  image: string | null;
};

const Managenotifications = () => {

const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showModal, setShowModal] = useState(false);
const [notifForm, setNotifForm] = useState<{
  title: string;
  description: string;
  image: File | string | null;
}>({ title: '', description: '', image: null });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
const auth = useContext(AuthContext);

if (!auth) {
  throw new Error("AuthContext is undefined. Make sure your component is wrapped with AuthProvider.");
}

const { user,loading } = auth;
  const [showConfirm, setShowConfirm] = useState(false);
const [notifToDelete, setNotifToDelete] = useState<Notification | null>(null);

  const router=useRouter()


   const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${getApiUrl("notifications")}`);
    setNotifications(res.data); 
    } catch (error:any) {
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



const confirmDelete = (notif: Notification) => {
  setNotifToDelete(notif);
  setShowConfirm(true);
};

const handleDeleteConfirmed = async () => {
  try {
    if (!notifToDelete) return;
    await axios.delete(`${getApiUrl("notifications")}/${notifToDelete.id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== notifToDelete.id));
    toast.success("Notification deleted successfully!");
  } catch (error) {
    toast.error("Error deleting notification.");
  } finally {
    setShowConfirm(false);
    setNotifToDelete(null);
  }
};



 

  const handleEdit = (notif: Notification) => {
    setNotifForm({
      title: notif.title,
      description: notif.description,
      image: notif.image,
    });
    setEditId(notif.id);
    setEditMode(true);
    setShowModal(true);
  };
const handleCreateNotification = async (eOrFormData: React.FormEvent<HTMLFormElement> | FormData) => {
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
      toast.success("notification updated successfully!");
      
    } else {
      await axios.post(`${getApiUrl("notifications")}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
            toast.success("notification created successfully!");

    }

    await fetchNotifications();
    setNotifForm({ title: "", description: "", image: '' });
    setEditMode(false);
    setEditId(null);
    setShowModal(false);
  } catch (err) {
    console.error("Notification submit error:", err);
    toast.error("Failed to submit notification.");
  }
};



  return (
    <>
    <Breadcrumb items={breadcrumbItems} />

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

  <table >
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
              <div className="form-actions">
                <button onClick={() => handleEdit(notif)}>Edit</button>
<button onClick={() => confirmDelete(notif)} >Delete</button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={4} className="empty-message">No notifications available.</td>
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

  {showConfirm &&  notifToDelete && (
  <ConfirmModal
    message={`Are you sure you want to delete "${notifToDelete.title||''}"?`}
    onConfirm={handleDeleteConfirmed}
    onCancel={() => {
      setShowConfirm(false);
      setNotifToDelete(null);
    }}
  />
)}

</div>
   </>
  );
};

export default Managenotifications;
