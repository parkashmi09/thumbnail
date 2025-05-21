import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, User, Mail, Phone, Camera, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    profileImage: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);
  
  const fetchUserProfile = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      toast.error('You need to be logged in');
      onClose();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://thumnail-maker.onrender.com/api/v1/user/getBy-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const userData = response.data.user;
      setUser(userData);
      
      // Split username into first and last name (if possible)
      let firstName = userData.userName;
      let lastName = '';
      
      if (userData.userName && userData.userName.includes(' ')) {
        const nameParts = userData.userName.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      
      setFormData({
        firstName,
        lastName,
        email: userData.email || '',
        mobileNumber: userData.mobileNumber || '',
        profileImage: null
      });
      
      if (userData.profileImage) {
        setPreviewImage(userData.profileImage);
      }
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profileImage: file
      });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!userId || !token) {
      toast.error('You need to be logged in');
      return;
    }

    try {
      setUpdating(true);
      
      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('userName', fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('mobileNumber', formData.mobileNumber);
      
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }
      
      const response = await axios.put(
        `https://thumnail-maker.onrender.com/api/v1/user/update/${userId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data) {
        toast.success('Profile updated successfully');
        // Update local storage
        localStorage.setItem('userName', fullName);
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="profile-modal-container" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="profile-modal-overlay" />
        </Transition.Child>

        <div className="profile-modal-wrapper">
          <div className="profile-modal-content-container">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="profile-modal-content">
                <Dialog.Title as="div" className="profile-modal-header">
                  <h3>General</h3>
                  <button
                    type="button"
                    className="profile-modal-close"
                    onClick={onClose}
                  >
                    <X size={20} />
                  </button>
                </Dialog.Title>

                {loading ? (
                  <div className="profile-modal-loading">
                    <Loader2 size={30} className="spinner" />
                    <p>Loading profile...</p>
                  </div>
                ) : (
                  <div className="profile-modal-body">
                    {/* Profile Photo */}
                    <div className="profile-photo-section">
                      <h4>Profile photo</h4>
                      <p className="file-info">We support PNGs, JPEGs and GIFs under 10MB</p>
                      
                      <div className="profile-photo-container">
                        <div className="profile-photo">
                          {previewImage ? (
                            <img src={previewImage} alt="Profile" />
                          ) : (
                            <div className="profile-initials">
                              {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}
                              {formData.lastName ? formData.lastName.charAt(0).toUpperCase() : ''}
                            </div>
                          )}
                        </div>
                        
                        <label htmlFor="profile-upload" className="upload-button">
                          Upload new picture
                        </label>
                        <input
                          type="file"
                          id="profile-upload"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* First Name */}
                      <div className="form-field">
                        <label htmlFor="firstName">First name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Your first name"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="form-field">
                        <label htmlFor="lastName">Last name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Your last name"
                        />
                      </div>

                      {/* Email */}
                      <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                        />
                        {!user?.isEmailVerified && (
                          <button type="button" className="verify-button">
                            Verify
                          </button>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="form-field">
                        <label htmlFor="mobileNumber">Phone</label>
                        {formData.mobileNumber ? (
                          <input
                            type="tel"
                            id="mobileNumber"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            placeholder="Your phone number"
                          />
                        ) : (
                          <button type="button" className="add-phone-button">
                            Add phone number
                          </button>
                        )}
                      </div>

                      {/* Account Deactivation */}
                      <div className="deactivate-section">
                        <div className="deactivate-text">
                          <h4>Deactivate account</h4>
                          <p>This will remove you from all workspaces</p>
                        </div>
                        <button type="button" className="deactivate-button">
                          Deactivate account
                        </button>
                      </div>

                      {/* Update button */}
                      <div className="form-action">
                        <button 
                          type="submit" 
                          className="update-button"
                          disabled={updating}
                        >
                          {updating ? (
                            <>
                              <Loader2 size={16} className="spinner" />
                              <span>Updating...</span>
                            </>
                          ) : 'Update'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProfileModal; 