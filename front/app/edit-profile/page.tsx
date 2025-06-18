"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import getApiUrl from "@/constants/endpoints";
import AuthContext from "@/context/AuthContext";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/ui/breadcrumb";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const EditProfile = () => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("AuthContext is undefined. Make sure your component is wrapped with AuthProvider.");
  }

  const { user, setUser, token, loading } = auth;
  const router = useRouter();

  interface EditProfileData {
    id: number;
    name: string;
    email: string;
    phone: string;
    type: string;
    role: string;
    image: string;
  }

  type ProfileErrors = {
    name?: string;
    phone?: string;
    email?: string;
    type?: string;
    image?: string;
  };

  const [editData, setEditData] = useState<EditProfileData | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});

  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
    }
    const data = localStorage.getItem("selectedEmployee");
    if (data) {
      setEditData(JSON.parse(data));
    }
  }, [user, loading]);

  if (!user) return null;
  if (!editData) return <div>Loading...</div>;

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    ...(editData.id === user.id ? [{ label: "My Profile", href: "/profile" }] : []),
    { label: "Edit Profile" },
  ];

  const validateField = (field: keyof EditProfileData, value: any) => {
    let error = "";
    if (field === "name") {
      if (!value.trim()) error = "Name is required.";
    } else if (field === "phone") {
      if (!value.trim()) error = "Phone number is required.";
      else if (!/^\d{10}$/.test(value)) error = "Phone number must be 10 digits.";
    } else if (field === "email") {
      if (!value.trim()) error = "Email is required.";
      else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Please enter a valid email.";
    } else if (field === "type" && editData.role !== "admin") {
      if (!value) error = "Please select a type.";
    }
    return error;
  };

  const handleFieldChange = (field: keyof EditProfileData, value: string) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : prev));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: validateField(field, value),
    }));
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    const newErrors: ProfileErrors = {};
    const fields: (keyof ProfileErrors)[] = ["name", "phone", "email", "type"];
    fields.forEach((field) => {
      const error = validateField(field, editData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const formData = new FormData();
    formData.append("name", editData.name);
    formData.append("email", editData.email);
    formData.append("phone", editData.phone);
    formData.append("type", editData.type);
    if (image) formData.append("image", image);

    try {
      await axios.put(`${API_BASE_URL}/${editData.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (editData.id === user.id) {
        const res = await axios.get(`${getApiUrl("getbyid")}/${editData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data[0]);
        toast.success("Profile updated successfully!");
        localStorage.removeItem("selectedEmployee");
        router.push("/profile");
      } else {
        toast.success("Profile updated successfully!");
        localStorage.removeItem("selectedEmployee");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <>
      <div className="bread">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="edit-profile-container">
        <h2>Edit Profile</h2>

        <label>Name:</label>
        <input
          type="text"
          value={editData.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          placeholder="Enter your name"
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <label>Phone:</label>
        <input
          type="text"
          value={editData.phone}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
          placeholder="Enter your phone number"
        />
        {errors.phone && <span className="error">{errors.phone}</span>}

        <label>Email:</label>
        <input
          type="email"
          value={editData.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          placeholder="Enter your email"
        />
        {errors.email && <span className="error">{errors.email}</span>}

        {editData.role !== "admin" && (
          <>
            <label>Type:</label>
            <select
              value={editData.type}
              onChange={(e) => handleFieldChange("type", e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Developer">Developer</option>
              <option value="Tester">Tester</option>
            </select>
            {errors.type && <span className="error">{errors.type}</span>}
          </>
        )}

        <label>Profile Image</label>
        <input type="file" onChange={handleImagePreview} />

        {editData.image && !image && (
          <div className="image-preview">
            <label>Current Image:</label>
            <img
              src={`${getApiUrl("uploads")}/${editData.image}`}
              alt="Current Profile"
            />
          </div>
        )}

        {image && (
          <div className="image-preview">
            <label>Selected Image:</label>
            <img src={URL.createObjectURL(image)} alt="Selected Profile" />
          </div>
        )}

        <button onClick={handleUpdate} type="submit">Update</button>
      </div>
    </>
  );
};

export default EditProfile;
