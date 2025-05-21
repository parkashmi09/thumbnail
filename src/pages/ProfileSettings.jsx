import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { User, Mail, Camera, X, Loader2, Loader2Icon } from 'lucide-react';
import Header from '../components/Header/Header';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    mobileNumber: '',
    profileImage: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [verification, setVerification] = useState({
    email: false,
    mobile: false
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        toast.error('You need to be logged in');
        navigate('/');
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
        setFormData({
          userName: userData.userName || '',
          email: userData.email || '',
          mobileNumber: userData.mobileNumber || '',
          profileImage: null
        });
        
        if (userData.profileImage) {
          setPreviewImage(userData.profileImage);
        }
        
        setVerification({
          email: userData.isEmailVerified || false,
          mobile: userData.isMobileVerified || false
        });
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

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

  const removeImage = () => {
    setFormData({
      ...formData,
      profileImage: null
    });
    setPreviewImage(null);
  };

  const validateForm = () => {
    let isValid = true;
    const errors = [];

    if (!formData.userName.trim()) {
      errors.push('Username is required');
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.push('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email is invalid');
      isValid = false;
    }

    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      errors.push('Mobile number must be 10 digits');
      isValid = false;
    }

    if (!isValid) {
      errors.forEach(error => toast.error(error));
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!userId || !token) {
      toast.error('You need to be logged in');
      navigate('/');
      return;
    }

    try {
      setUpdating(true);
      
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('userName', formData.userName);
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
        // Update local storage if username changed
        if (formData.userName !== user.userName) {
          localStorage.setItem('userName', formData.userName);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <div className="profile-settings-container loading">
          <div className="loading-spinner">
            <User size={40} />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <Toaster position="top-center" />
      
      <div className="profile-container">
        <div className="profile-settings-container">
          <div className="profile-header">
            <h1 className="profile-title">Profile Settings</h1>
            <p className="profile-subtitle">Manage your account and preferences</p>
          </div>
          
          <div className="profile-content">
            <div className="profile-section">
              <div className="section-label">
                <User size={16} />
                <span>PROFILE PHOTO</span>
              </div>
              
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="profile-image" />
                  ) : (
                    <div className="profile-image-placeholder">
                      <User size={40} color="#999" />
                    </div>
                  )}
                  
                  <div className="profile-image-overlay">
                    <label htmlFor="profile-upload" className="upload-button">
                      <Camera size={14} />
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
              </div>
            </div>
            
            <div className="profile-section">
              <div className="section-label">
                <div className="shield-icon"></div>
                <span>ACCOUNT INFORMATION</span>
              </div>
              
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="userName">
                    <User size={16} />
                    <span>Username</span>
                  </label>
                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={16} />
                    <span>Email</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                  {!verification.email && (
                    <div className="unverified-badge">
                      <X size={12} />
                      <span>Unverified</span>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="mobileNumber">
                    <span>Mobile Number</span>
                  </label>
                  <input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Your mobile number"
                  />
                  {!verification.mobile && (
                    <div className="unverified-badge">
                      <X size={12} />
                      <span>Unverified</span>
                    </div>
                  )}
                </div>
                
                <div className="save-button-container">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        {/* <Loader2Icon size={8} /> */}
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 