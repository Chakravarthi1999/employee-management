"use client";

import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import getApiUrl from "@/constants/endpoints";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const initializeAuth = async () => {
      const id = localStorage.getItem("userId");
      const storedToken = localStorage.getItem("token");

      if (id && storedToken) {
        try {
          const res = await axios.get(`${getApiUrl("getbyid")}/${id}`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.data && res.data.length > 0) {
            setUser(res.data[0]);
            setToken(storedToken);
          }
         
        } catch (error) {
          console.log("Auth initialization error:", error);
          localStorage.removeItem("userId");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("userId", userData.id);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    const confirmDelete = confirm("Are you sure you want to logout?");
    if (!confirmDelete) return;
    setUser(null);
    setToken(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
