"use client";
import React, { useState, useRef, useContext, useEffect } from 'react';
import axios from 'axios';
import getApiUrl from '@/constants/endpoints';
import { useRouter } from 'next/navigation';
import AuthContext from '@/context/AuthContext';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/ui/breadcrumb';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { authentic } from '@/utils/firebase';

const breadcrumbItems = [
  { label: "Dashboard", href: "/" },
  { label: "Add Employee" }
];

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee',
    type: '',
    dob: '',
    image: '',
    createdby: 'admin'
  });

  type FormFields = {
    name: string;
    email: string;
    phone: string;
    password: string;
    type: string;
    dob: string;
    image: string;
  };

  const [errors, setErrors] = useState<Partial<FormFields>>({});
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const auth = useContext(AuthContext);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!auth?.user && !auth?.loading) {
      router.push("/");
    }
  }, [auth?.user, auth?.loading]);

  if (!auth?.user) return null;

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: '' }));
    } else {
      setFormData({ ...formData, [name]: value });

      let errorMsg = '';

      if (name === 'phone') {
        if (!value.trim()) errorMsg = 'Phone number is required';
        else if (!/^\d{10}$/.test(value)) errorMsg = 'Phone number must be 10 digits';
      }

      if (name === 'password') {
        if (!value.trim()) errorMsg = 'Password is required';
        else if (value.length < 6) errorMsg = 'Password must be at least 6 characters';
      }

      if (name === 'email') {
        if (!value.trim()) errorMsg = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Valid email is required';
      }

      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const validate = () => {
    const newErrors: Partial<FormFields> = {};
    let firstInvalid = "";

    const addError = (field: keyof FormFields, message: string) => {
      newErrors[field] = message;
      if (!firstInvalid) firstInvalid = field;
    };

    if (!formData.name.trim()) addError("name", "Name is required");
    if (!formData.email.trim()) addError("email", "Email is required");
    else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) addError("email", "Valid email is required");

    if (!formData.phone.trim()) addError("phone", "Phone number is required");
    else if (!formData.phone.match(/^\d{10}$/)) addError("phone", "Phone number must be 10 digits");

    if (!formData.password.trim()) addError("password", "Password is required");
    else if (formData.password.length < 6) addError("password", "Password must be at least 6 characters");

    if (!formData.type) addError("type", "Type is required");
    if (!formData.dob) addError("dob", "Date of birth is required");
    if (!formData.image) addError("image", "Image is required");

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, firstInvalid };
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { isValid, firstInvalid } = validate();

    if (!isValid) {
      type FieldKey = Exclude<keyof typeof formData, 'role' | 'createdby'>;

      const focusMap: Record<FieldKey, React.RefObject<any>> = {
        name: nameRef,
        email: emailRef,
        phone: phoneRef,
        password: passwordRef,
        type: typeRef,
        dob: dobRef,
        image: imageRef,
      };

      if (firstInvalid in focusMap) {
        focusMap[firstInvalid as FieldKey]?.current?.focus();
      }

      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key as keyof typeof formData]);
    }

    try {
      // await createUserWithEmailAndPassword(authentic, formData.email, formData.password);

      await axios.post(`${getApiUrl("register")}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("Registered successfully!");
      router.push('/');
    } catch (error: any) {
      setIsSubmitting(false);
      if (error.response) {
        setErrors((prev) => ({ ...prev, email: error.response.data.message }));
        emailRef.current?.focus();
      }
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <h2>Add Employee</h2>
      <form className="register-container" onSubmit={handleSubmit}>
        <label>Name:</label>
        <input ref={nameRef} name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Enter Name" />
        {errors.name && <span className="error">{errors.name}</span>}

        <label>Email:</label>
        <input ref={emailRef} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter Email" />
        {errors.email && <span className="error">{errors.email}</span>}

        <label>Phone Number:</label>
        <input ref={phoneRef} name="phone" type="number" value={formData.phone} onChange={handleChange} placeholder="Enter Phone Number" />
        {errors.phone && <span className="error">{errors.phone}</span>}

        <label>Password:</label>
        <input ref={passwordRef} name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter Password" />
        {errors.password && <span className="error">{errors.password}</span>}

        <label>Type:</label>
        <select ref={typeRef} name="type" value={formData.type} onChange={handleChange} disabled={formData.role === 'admin'}>
          <option value="">Select role type</option>
          <option value="Developer">Developer</option>
          <option value="Tester">Tester</option>
        </select>
        {errors.type && <span className="error">{errors.type}</span>}

        <label>Date of Birth:</label>
        <input ref={dobRef} type="date" name="dob" value={formData.dob} onChange={handleChange} max={today} />
        {errors.dob && <span className="error">{errors.dob}</span>}

        <label>Select Image:</label>
        <input ref={imageRef} type="file" name="image" accept="image/*" onChange={handleChange} />
        {errors.image && <span className="error">{errors.image}</span>}

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <span className="loader"></span> : 'Register'}
        </button>
      </form>
    </>
  );
};

export default AddEmployee;
