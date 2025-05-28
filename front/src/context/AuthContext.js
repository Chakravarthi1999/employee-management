// context/AuthContext.jsx
"use client";

import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import getApiUrl from "@/constants/endpoints";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   const storedToken = localStorage.getItem("token");

  //   if (storedUser) setUser(JSON.parse(storedUser));
  //   if (storedToken) setToken(storedToken);

  //   setLoading(false);
  // }, []);

  const login = async (userData, token) => {
   
     setUser(userData);
    setToken(token);
    // setLoading(false);

    // localStorage.setItem("user", JSON.stringify(userData));
    // localStorage.setItem("token", token);
  };

  const logout = () => {
    const confirmDelete = confirm("Are you sure you want to logout?");
    if (!confirmDelete) return;
    setUser(null);
    setToken(null);
    // localStorage.removeItem("user");
    // localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout }}>
      {  children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
