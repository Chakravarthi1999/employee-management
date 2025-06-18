"use client";

import React, { useContext, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import getApiUrl from "@/constants/endpoints";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/ui/breadcrumb";

const breadcrumbItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Change Password" },
];

type ProfileErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const ChangePassword = () => {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [loading, setLoading] = useState(false);

  if (!auth || !auth.user) return null;
  const userId = auth.user.id;

  const validateForm = (): boolean => {
    const newErrors: ProfileErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await axios.put(`${getApiUrl("changePassword")}/${userId}`, {
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully");
      router.push("/dashboard");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bread">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="edit-profile-container">
        <h2>Change Password</h2>

        <label>Current Password:</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        {errors.currentPassword && (
          <span className="error">{errors.currentPassword}</span>
        )}

        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
        {errors.newPassword && (
          <span className="error">{errors.newPassword}</span>
        )}

        <label>Confirm New Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}

        <button onClick={handleUpdate} type="submit" disabled={loading}>
          {loading ? "Updating..." : "Change Password"}
        </button>
      </div>
    </>
  );
};

export default ChangePassword;
