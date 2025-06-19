"use client";

import React, { useState, useRef, useContext, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import AuthContext from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import getApiUrl from '@/constants/endpoints';
import { toast } from 'react-toastify';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { authentic } from '@/utils/firebase';

type FormErrors = {
  email?: string;
  password?: string;
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<FormErrors>>({});
  const [serverError, setServerError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useContext(AuthContext);
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  if (!auth) {
    throw new Error("AuthContext is undefined. Make sure your component is wrapped with AuthProvider.");
  }

  const { user, login, loading } = auth;

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const firebaseUser = await signInWithEmailAndPassword(authentic, email, password);
      const idToken = await firebaseUser.user.getIdToken();

      const res = await axios.post(getApiUrl("login"), { idToken });

      if (res.data.user && res.data.token) {
        login(res.data.user, res.data.token);
        toast.success("Login successful!");
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const firebaseError = error.code?.startsWith("auth");
      const message = firebaseError
        ? "Invalid Firebase credentials"
        : error.response?.data?.message || "Something went wrong.Please try again.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      setForgotError('Email is required');
      return;
    }

    try {
      await axios.post(getApiUrl('forgotPassword'), { email: forgotEmail });
      setForgotSuccess('A new password has been sent to your email');
      setForgotEmail('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Unable to send reset email';
      setForgotError(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');

    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  return (
    <>
      {!showForgotPassword ? (
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

          <p className="back-link" onClick={() => setShowForgotPassword(true)}>
            Forgot password?
          </p>

          <p className="link-text">
            Don't have an account? <Link href="/register">Register here</Link>
          </p>
        </form>
      ) : (
        <div className="forgot-box">
          <h2>Forgot Password</h2>
          <p>Enter your email and we’ll send you a random password.</p>

  <div className="input-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
          {forgotError && <span className="error">{forgotError}</span>}
          {forgotSuccess && <span className="success">{forgotSuccess}</span>}
</div>
          <button type="submit" onClick={handleForgotPassword}>
            Submit
          </button>

          <p className="back-link" onClick={() => setShowForgotPassword(false)}>
            ← Back to Login
          </p>
        </div>
      )}
    </>
  );
};

export default LoginForm;
