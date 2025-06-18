"use client";
import React, { useEffect, useRef, useState } from 'react';
import getApiUrl from '@/constants/endpoints';

interface NotificationFormData {
  title: string;
  description: string;
  image: File | string | null;
}

interface NotificationModalProps {
  onClose: () => void;
  notifForm: NotificationFormData;
  setNotifForm: React.Dispatch<React.SetStateAction<NotificationFormData>>;
  editMode: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  onClose,
  notifForm,
  setNotifForm,
  editMode,
  onSubmit,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    image?: string;
  }>({});

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode && notifForm.image && typeof notifForm.image === 'string') {
      setImagePreview(`${getApiUrl("uploads")}/${notifForm.image}`);
    }
  }, [notifForm.image, editMode]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!notifForm.title.trim()) {
      newErrors.title = "Title is required.";
    }

    if (!notifForm.description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (!editMode && !notifForm.image) {
      newErrors.image = "Image is required.";
    }

    setErrors(newErrors);

    if (newErrors.title) {
      titleRef.current?.focus();
    } else if (newErrors.description) {
      descRef.current?.focus();
    } else if (newErrors.image) {
      imageRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "image" && (e.target as HTMLInputElement).files?.length) {
      const file = (e.target as HTMLInputElement).files![0];
      setNotifForm({ ...notifForm, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setNotifForm({ ...notifForm, [name]: value });
    }

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{editMode ? "Edit Notification" : "Create Notification"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              ref={titleRef}
              type="text"
              name="title"
              value={notifForm.title}
              onChange={handleChange}
              placeholder="Enter title"
            />
            {errors.title && <p className="error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              ref={descRef}
              name="description"
              value={notifForm.description}
              onChange={handleChange}
              placeholder="Enter description"
            />
            {errors.description && <p className="error">{errors.description}</p>}
          </div>

          <div className="form-group">
            <label>Image:</label>
            <input
              ref={imageRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
            {errors.image && <p className="error">{errors.image}</p>}
            {imagePreview && (
              <div className="image-preview">
                <label>Selected Image:</label>
                <img src={imagePreview} alt="Preview" className="preview-img" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editMode ? "Update" : "Create"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;
