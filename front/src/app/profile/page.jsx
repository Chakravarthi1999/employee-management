"use client"
import React, { useContext, useEffect } from 'react';
import "./profile.css";
import AuthContext from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import getApiUrl from '@/constants/endpoints';


const Profile = () => {
  const { user,loading } = useContext(AuthContext);
const router=useRouter();
   const handleEdit = (employee) => {
  localStorage.setItem('selectedEmployee', JSON.stringify(employee));
  router.push('/edit-profile');
};
useEffect(() => {
  if (!user&&!loading) {
    router.push("/");  
  }

}, [user,loading]);

if (!user) {
  return null; 
}
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-image">
          <img
  src={`${getApiUrl("uploads")}/${user.image}`}
            alt="Profile"
            className="profile-img"
          />
        </div>
        <div className="profile-details">
          <h2 className="profile-title">My Profile</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>DOB:</strong> {new Date(user.dob).toLocaleDateString('en-GB')}</p>

          {user.role !== 'admin' && (
            
              <p><strong>Type:</strong> {user.type}</p>
          )}
             <button onClick={() => handleEdit(user)} className='edit-link'>Edit</button>
            
        
        </div>
      </div>
    </div>
  );
};

export default Profile;
