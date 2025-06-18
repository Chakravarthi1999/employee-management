"use client";
import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthContext from '@/context/AuthContext';
import getApiUrl from '@/constants/endpoints';
import Breadcrumb from '@/components/ui/breadcrumb';

const breadcrumbItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Profile" },
];

const Profile = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext is undefined. Make sure your component is wrapped with AuthProvider.");
  }

  const { user, loading } = auth;
  const router = useRouter();

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

  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
    }
  }, [user, loading]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-image">
            <img
              src={`${getApiUrl("uploads")}/${user.image}`}
              alt="Profile"
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
