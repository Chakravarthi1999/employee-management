"use client"
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import AuthContext from "@/context/AuthContext";
import fetchUsers from "../fetchUsers";
import { useRouter } from "next/navigation";
import getApiUrl from "@/constants/endpoints";
import { toast } from 'react-toastify';
import ConfirmModal from "@/components/ui/confirmModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


function Dashboard() {
  const { user, logout, token,loading } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
const [banners, setBanners] = useState([]);
const [loader,setLoader]=useState(true)
const [userrole,setUserrole]=useState("");
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteTarget, setDeleteTarget] = useState(null);

const router=useRouter()

 

useEffect(() => {
  if (!loading) { 
    if (!user) {
      router.push("/");
    } else {
      setUserrole(user.role); 
      const loadUsers = async () => {
        await fetchUsers(token, logout, setEmployees);
        setLoader(false);
      };
      const fetchBanners = async () => {
    try {
const res = await axios.get(`${getApiUrl("visiblebanners")}`);

      setBanners(res.data);
    } catch (err) {
      console.error("Failed to load banners", err);
    }
  };

  fetchBanners();
      loadUsers();
    }
  }
}, [user, token, loading, logout, router]);

const confirmDelete = (id) => {
  setDeleteTarget(id);
  setShowDeleteModal(true);
};

const handleDeleteConfirmed = async () => {
  if (!deleteTarget) return;
  try {
    if (deleteTarget === user.id) {
      await axios.delete(`${API_BASE_URL}/${deleteTarget}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      toast.success("Deleted successfully!");
      
      router.push("/");
    } else {
      await axios.delete(`${API_BASE_URL}/${deleteTarget}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
            toast.success("Deleted successfully!");

      fetchUsers(token, logout, setEmployees);
    }
  } catch (err) {
    console.error("Delete error:", err);
    toast.error("Failed to delete user.");
  } finally {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  }
};


  const handleEdit = (employee) => {
  localStorage.setItem('selectedEmployee', JSON.stringify(employee));
  router.push('/edit-profile');
};

  return (
    <>
 
 {!(userrole === "admin") && banners.length > 0 && (
  <div className="carousel-wrapper">
    <Carousel
      autoPlay
      infiniteLoop
      showThumbs={false}
      showStatus={false}
      interval={2000}
      dynamicHeight={false}
          showArrows={false}

    >
      {banners.map((banner, index) => (
        <div key={index} className="banner-slide">
          <img
src={`${API_BASE_URL}/uploads/${banner.filename}`} 
            alt={`banner-${index}`}
            className="banner-image"
          />
        </div>
      ))}
    </Carousel>
  </div>
)} 

   {loader ? (
<div className="loading-wrapper">
  <div className="spinner"></div>
</div>
  ) : (
<div className="dashboard-header">

  <div className="dashboard-header-bar">
        <h3>All Users</h3>
    <input
      type="text"
      placeholder="Search by name or email"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />
  </div>

    <table border="1">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>DOB</th>
          <th>Role</th>
          <th>Image</th>
          {userrole === "admin" && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {employees
          .filter((u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{new Date(u.dob).toLocaleDateString("en-GB")}</td>
              <td>{u.role || u.type||'N/A'}</td>
              <td>
<img src={`${getApiUrl("uploads")}/${u.image}`} alt="test" />
              </td>
              {userrole === "admin" && (
                <td>
                <div className="form-actions">
                  <button onClick={() => handleEdit(u)}>Edit</button>
<button onClick={() => confirmDelete(u.id)}>Delete</button>
                </div>
                </td>
              )}
            </tr>
          ))}
      </tbody>
    </table>
  
</div>
  )} 

 {showDeleteModal && (
  <ConfirmModal
   message=
  
    {deleteTarget === user?.id
      ? "Are you sure you want to delete your own account? You will be logged out."
      : "Are you sure you want to delete this user?"}



    onConfirm={handleDeleteConfirmed}
    onCancel={() => {
       setShowDeleteModal(false);
            setDeleteTarget(null);
    }}
  />
)}


    </>
  );
}

export default Dashboard;
