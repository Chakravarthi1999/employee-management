"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./edit.css";
import { useRouter } from "next/navigation";
import getApiUrl from "@/constants/endpoints";
import AuthContext from "@/context/AuthContext";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const EditProfile = () => {
  const { user, setUser, token,loading } = useContext(AuthContext);
  const [editData, setEditData] = useState(null);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (!user&&!loading) {
    router.push("/");  
  }
    const data = localStorage.getItem("selectedEmployee");
    if (data) {
      setEditData(JSON.parse(data));
    }
  }, [user,loading]);


if (!user) {
  return null; 
}
  if (!editData) return <div>Loading...</div>;

  const validateField = (field, value) => {
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

  const handleFieldChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: validateField(field, value),
    }));
  };

  const handleUpdate = async () => {
    const newErrors = {};
    for (const field of ["name", "phone", "email", "type"]) {
      const error = validateField(field, editData[field]);
      if (error) newErrors[field] = error;
    }
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
        const res = await axios.get(`${getApiUrl("getbyid")}/${editData.id}`,{
           headers: {
    Authorization: `Bearer ${token}`,
  },
        });
        setUser(res.data[0]);
      }

      setEditData(null);
      alert("Profile updated successfully.");
      localStorage.removeItem("selectedEmployee")
      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleImagePreview = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>

      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          value={editData.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          placeholder="Enter your name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Phone:</label>
        <input
          type="text"
          value={editData.phone}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
          placeholder="Enter your phone number"
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={editData.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          placeholder="Enter your email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      {editData.role !== "admin" && (
        <div className="form-group">
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
        </div>
      )}

      <div className="form-group">
        <label>Profile Image</label>
        <input type="file" onChange={handleImagePreview} />

        {editData.image && !image && (
          <div className="image-preview">
            <label>Current Image:</label>
            <img
              src={`${getApiUrl("uploads")}/${editData.image}`}
              alt="Current Profile"
              className="preview-img"
            />
          </div>
        )}

        {image && (
          <div className="image-preview">
            <label>Selected Image:</label>
            <img
              src={URL.createObjectURL(image)}
              alt="Selected Profile"
              className="preview-img"
            />
          </div>
        )}
      </div>

      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default EditProfile;
