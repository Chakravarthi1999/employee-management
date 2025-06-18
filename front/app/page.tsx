"use client"

import React, { useState, useRef, useContext, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import AuthContext from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import getApiUrl from '@/constants/endpoints';
import { toast } from 'react-toastify';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { authentic } from '@/utils/firebase';
type FormErrors ={
  email?: string;
  password?: string;
 
}
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const [errors, setErrors] = useState<Partial<FormErrors>>({});
  const [serverError, setServerError] = useState('');
const auth = useContext(AuthContext);

if (!auth) {
  throw new Error("AuthContext is undefined. Make sure your component is wrapped with AuthProvider.");
}

const { user,login,loading } = auth;  const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false); 

  const emailRef = useRef(null);
  const passwordRef = useRef(null);




useEffect(() => {
  if (!loading) {
    if (user) {
      router.push('/dashboard');
    }
  }
}, [user, loading]);

  const validate = () => {
const newErrors: Partial<FormErrors> = {};
    let firstInvalid = "";

 const addError = (field: keyof FormErrors, message: string) => {
  newErrors[field] = message;
  if (!firstInvalid) firstInvalid = field;
};


    if (!email.trim()) {
      addError('email', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addError('email', 'Enter a valid email address');
    }

    if (!password.trim()) {
      addError('password', 'Password is required');
    }

    setErrors(newErrors);
    setServerError('');

    return { isValid: Object.keys(newErrors).length === 0, firstInvalid };
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    const { isValid, firstInvalid } = validate();

  if (!isValid) {
  const focusMap: Record<keyof FormErrors, React.RefObject<any>> = {
    email: emailRef,
    password: passwordRef,
   
  };

  focusMap[firstInvalid as keyof typeof focusMap]?.current?.focus();
  return;
}

 setIsSubmitting(true); 

    try {
        const firebaseUser =await signInWithEmailAndPassword(authentic, email, password);
const idToken = await firebaseUser.user.getIdToken();
    
      const res = await axios.post(`${getApiUrl("login")}`, {idToken});
      if (res.data.user&&res.data.token ) {
        login(res.data.user, res.data.token);
        setIsSubmitting(false); 
toast.success("Login successful!");

     router.push('/dashboard');
      } 
    }catch (error:any) {
  setIsSubmitting(false); 
  console.error('Login error:', error);

 const firebaseError = error.code?.startsWith("auth");
  const message = firebaseError
    ? "Invalid Firebase credentials"
    : error.response?.data?.message || "Something went wrong. Please try again.";
  setServerError(message);
}

}

  

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');

    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  return (
  

    <form className="login-container" onSubmit={handleSubmit}>
      <h2>Login</h2>

      <label>Email:</label>
      <input
        ref={emailRef}
        type="email"
        name="email"
        value={email}
        onChange={handleChange}
        placeholder="Enter your email"
      />
      {errors.email && <span className="error">{errors.email}</span>}

      <label>Password:</label>
      <input
        ref={passwordRef}
        type="password"
        name="password"
        value={password}
        onChange={handleChange}
        placeholder="Enter your password"
      />
      {errors.password && <span className="error">{errors.password}</span>}

      {serverError && <span className="error server-error">{serverError}</span>}

<button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <span className="loader"></span> : 'Login'}
      </button>
      <p className="link-text">
        Do not have an account? <Link href="/register">Register here</Link>
      </p>
    </form>
   

 
  
  );
};

export default LoginForm;
