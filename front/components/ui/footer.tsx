'use client';

import React, { useContext } from 'react';
import AuthContext from '@/context/AuthContext';

const Footer = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext is undefined. Make sure your component is wrapped with AuthProvider.");
  }

  const { user } = auth;

  if (!user) return null;

  return (
    <footer className='footer'>
      <p>© 2025 Role-Based Dashboard. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
