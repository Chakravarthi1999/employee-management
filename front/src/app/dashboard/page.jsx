"use client"
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
// import { Carousel } from "react-responsive-carousel";
// import "react-responsive-carousel/lib/styles/carousel.min.css";
import AuthContext from "@/context/AuthContext";
import fetchUsers from "../fetchUsers";
import { useRouter } from "next/navigation";
import getApiUrl from "@/constants/endpoints";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


function Dashboard() {
  const { user, logout, token,loading } = useContext(AuthContext);
  // const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
const [banners, setBanners] = useState([]);
const [loader,setLoader]=useState(true)
const [userrole,setUserrole]=useState("");
const router=useRouter()

useEffect(() => {
 if (!user) {
     router.push("/");
    return ;
  }
setUserrole(user.role)
    // const isAdmin = user.role === "admin";
  const loadUsers = async () => {
    await fetchUsers( token, logout, setEmployees);
    setLoader(false)
  };
// const fetchBanners = async () => {
//     try {
// const res = await axios.get(banners);

//       setBanners(res.data);
//     } catch (err) {
//       console.error("Failed to load banners", err);
//     }
//   };

//   fetchBanners();
  loadUsers();

}, [user, token, logout]);
 

  // const isAdmin = user.role === "admin";

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      if (id === user.id) {
       await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert("Your account has been deleted. You will be logged out.");
        logout();
        // localStorage.removeItem("user");
router.push("/")
      } else {
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers( token, logout,  setEmployees);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete user.");
    }
  };

  const handleEdit = (employee) => {
  localStorage.setItem('selectedEmployee', JSON.stringify(employee));
  router.push('/edit-profile');
};

  return (
    <>
 
{/* {!isAdmin && banners.length > 0 && (
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
src={`${API_BASE_URL}/Banners/${banner.filename}`} 
            alt={`banner-${index}`}
            className="banner-image"
          />
        </div>
      ))}
    </Carousel>
  </div>
)} */}

   {loader ? (
    <div>Loading users...</div> 
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
              <td>{u.role || u.type}</td>
              <td>
<img src={`${getApiUrl("uploads")}/${u.image}`} alt="test" />
              </td>
              {userrole === "admin" && (
                <td className="actions">
                  <button onClick={() => handleEdit(u)}>Edit</button>
                  <button onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
      </tbody>
    </table>
  
</div>
  )} 
    </>
  );
}

export default Dashboard;
