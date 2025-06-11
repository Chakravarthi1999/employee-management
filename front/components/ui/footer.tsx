'use client';

import AuthContext from '@/context/AuthContext';
import React, { useContext } from 'react';

const Footer = () => {
const auth = useContext(AuthContext);

if (!auth) {
  throw new Error("AuthContext is undefined. Make sure your component is wrapped with AuthProvider.");
}

const { user } = auth;
  if (!user) return null;
  return (
   <footer style={{ 
  textAlign: 'center', 
  padding: '1rem', 
  background: '#ddd', 
}}>
  <p>© 2025 Role-Based Dashboard. All rights reserved.</p>
</footer>

  );
};

export default Footer;
