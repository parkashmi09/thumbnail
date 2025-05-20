import React, { Fragment, useState, useRef, useEffect, useCallback, memo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { X, Eye, EyeOff, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthModals.css';
import Logo from '../../assets/images/LOGO.png';
import googleIcon from '../../assets/images/ggogle.png';
import { motion } from 'framer-motion';
import axios from 'axios';
import LoginSuccessModal from './LoginSuccessModal';

// API URLs
const API_BASE_URL = 'https://thumnail-maker.onrender.com/api/v1';
const SIGN_UP_URL = `${API_BASE_URL}/user/signUp`;
const SIGN_IN_URL = `${API_BASE_URL}/user/signIn`;
const GET_USER_URL = `${API_BASE_URL}/user/getBy-id`;
const MOBILE_LOGIN_URL = `${API_BASE_URL}/user/login-with-mobile`;
const VERIFY_OTP_URL = `${API_BASE_URL}/user/verify-otp`;
const GOOGLE_AUTH_URL = `${API_BASE_URL}/google`;

// Validation schemas
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
    .required('Required'),
  password: Yup.string()
    .min(8, 'Must be at least 8 characters')
    .required('Required'),
});

const OtpSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
    .required('Required'),
});

// OTP input component with 6 digits
const OtpInputField = memo(({ value, onChange, hasError }) => {
  const inputRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  
  // Initialize or update otpValues when value changes
  useEffect(() => {
    if (value) {
      const valueArray = value.toString().split('').slice(0, 6);
      const newOtpValues = Array(6).fill('');
      valueArray.forEach((digit, index) => {
        if (index < 6) newOtpValues[index] = digit;
      });
      setOtpValues(newOtpValues);
    }
  }, [value]);
  
  const handleChange = (index, e) => {
    const val = e.target.value;
    // Only allow one digit
    if (val && !/^\d*$/.test(val)) return;
    
    // Update the OTP value at the current index
    const newOtpValues = [...otpValues];
    newOtpValues[index] = val.slice(-1); // Take only the last character if multiple were pasted
    setOtpValues(newOtpValues);
    
    // Call the onChange with the complete OTP
    onChange(newOtpValues.join(''));
    
    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits
    
    const digits = pastedData.split('').slice(0, 6);
    const newOtpValues = [...otpValues];
    
    digits.forEach((digit, index) => {
      if (index < 6) newOtpValues[index] = digit;
    });
    
    setOtpValues(newOtpValues);
    onChange(newOtpValues.join(''));
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtpValues.findIndex(val => !val);
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
      inputRefs.current[nextEmptyIndex].focus();
    } else if (digits.length < 6) {
      inputRefs.current[digits.length].focus();
    } else {
      inputRefs.current[5].focus();
    }
  };
  
  return (
    <div className={`otp-input-container ${hasError ? 'has-error' : ''}`}>
      {Array(6).fill(0).map((_, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          className={`otp-digit ${otpValues[index] ? 'filled' : ''}`}
          value={otpValues[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : null}
          maxLength={1}
          autoComplete="off"
        />
      ))}
    </div>
  );
});

// Common Google sign-in handler
const handleGoogleSignIn = () => {
  window.location.href = GOOGLE_AUTH_URL;
};

// Common data fetching functions
const fetchUserData = async (userId) => {
  try {
    const response = await axios.get(`${GET_USER_URL}/${userId}`);
    const userData = response.data.user;
    
    // Store user data in localStorage
    localStorage.setItem('userName', userData.userName);
    if (userData.email) localStorage.setItem('userEmail', userData.email);
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Reusable Modal wrapper component
const ModalWrapper = memo(({ isOpen, onClose, children }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="auth-modal" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="modal-overlay" />
      </Transition.Child>

      <div className="modal-container">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          {children}
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
));

// Reusable Logo component
const LogoHeader = memo(() => (
  <motion.div
    className="modal-logo-container"
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.5, type: 'spring', bounce: 0.3 }}
  >
    <img src={Logo} alt="Logo" className="modal-logo" />
  </motion.div>
));

// Reusable Google button component
const GoogleButton = memo(({ delay = 0.42 }) => (
  <>
    <motion.div className="divider" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay - 0.04 }}>
      <span>OR</span>
    </motion.div>
    <motion.button 
      type="button" 
      className="google-button"
      onClick={handleGoogleSignIn}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <img src={googleIcon} alt="Google" />
      Continue with Google
    </motion.button>
  </>
));

// Password field component with toggle
const PasswordField = memo(({ name, placeholder, errors, touched }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <>
      <div className="password-field-container">
        <Field
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder || "Password"}
          className="form-input"
        />
        <button 
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex="-1"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {errors && touched && <div className="error">{errors}</div>}
    </>
  );
});

// Password login form component
const PasswordLoginForm = memo(({ handleSubmit, isLoading }) => (
  <Formik
    initialValues={{ email: '', password: '' }}
    validationSchema={LoginSchema}
    onSubmit={handleSubmit}
  >
    {({ errors, touched, isSubmitting }) => (
      <Form className="auth-form">
        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Field
            name="email"
            type="email"
            placeholder="Email"
            className="form-input"
          />
          {errors.email && touched.email && (
            <div className="error">{errors.email}</div>
          )}
        </motion.div>
        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
        >
          <PasswordField 
            name="password" 
            errors={errors.password}
            touched={touched.password}
          />
          <div className="forgot-password-link">
            <a href="#" onClick={e => { e.preventDefault(); toast('Forgot password clicked!'); }}>Forgot Password?</a>
          </div>
        </motion.div>
        <motion.button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || isLoading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.3 }}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </motion.button>
        <GoogleButton />
      </Form>
    )}
  </Formik>
));

// OTP login form component
const OtpLoginForm = memo(({ handleSendOtp, handleVerifyOtp, showOtp, otpValue, setOtpValue, otpTimer, isLoading }) => (
  <Formik
    initialValues={{ phone: '', showOtp: false }}
    validationSchema={OtpSchema}
    onSubmit={handleVerifyOtp}
  >
    {({ errors, touched, isSubmitting, values, setFieldValue }) => (
      <Form className="auth-form">
        <motion.div
          className="form-group phone-group"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="phone-input-wrapper">
            <span className="country-code">+91</span>
            <Field
              name="phone"
              type="tel"
              placeholder="Phone Number"
              className="form-input phone-input"
              maxLength={10}
              disabled={showOtp}
              onChange={(e) => {
                setFieldValue('phone', e.target.value);
              }}
            />
          </div>
          {errors.phone && touched.phone && (
            <div className="error">{errors.phone}</div>
          )}
        </motion.div>
        {/* Show OTP input if OTP sent */}
        {showOtp && (
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22, duration: 0.4 }}
          >
            <label className="form-label">Enter OTP</label>
            <OtpInputField 
              value={otpValue}
              onChange={(val) => setOtpValue(val)}
              hasError={false}
            />
            <div className="otp-actions">
              <button
                type="button"
                className="resend-otp-btn"
                disabled={otpTimer > 0}
                onClick={() => handleSendOtp(values.phone, setFieldValue)}
              >
                Resend OTP
              </button>
              {otpTimer > 0 && (
                <div className="otp-timer">
                  <Clock size={14} className="otp-timer-icon" />
                  <span>{otpTimer}s</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        <motion.button
          type="button"
          className="submit-button"
          disabled={isSubmitting || (showOtp && otpValue.length !== 6) || isLoading}
          onClick={async (e) => {
            if (!showOtp) {
              // Send OTP
              if (!values.phone || errors.phone) return;
              await handleSendOtp(values.phone, setFieldValue);
            } else {
              // Verify OTP
              await handleVerifyOtp(values);
            }
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.3 }}
        >
          {isLoading ? 'Processing...' : (showOtp ? 'Verify OTP' : 'Continue')}
        </motion.button>
        <GoogleButton />
      </Form>
    )}
  </Formik>
));

// Registration form component
const RegistrationForm = memo(({ handleSubmit, isLoading }) => (
  <Formik
    initialValues={{
      name: '',
      email: '',
      mobile: '',
      password: '',
    }}
    validationSchema={RegisterSchema}
    onSubmit={handleSubmit}
  >
    {({ errors, touched, isSubmitting }) => (
      <Form className="auth-form">
        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Field
            name="name"
            type="text"
            placeholder="Full Name"
            className="form-input"
          />
          {errors.name && touched.name && (
            <div className="error">{errors.name}</div>
          )}
        </motion.div>
        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
        >
          <Field
            name="email"
            type="email"
            placeholder="Email"
            className="form-input"
          />
          {errors.email && touched.email && (
            <div className="error">{errors.email}</div>
          )}
        </motion.div>
        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.29, duration: 0.4 }}
        >
          <Field
            name="mobile"
            type="tel"
            placeholder="Mobile Number"
            className="form-input"
          />
          {errors.mobile && touched.mobile && (
            <div className="error">{errors.mobile}</div>
          )}
        </motion.div>
        <motion.div
          className="form-group"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.36, duration: 0.4 }}
        >
          <PasswordField 
            name="password" 
            errors={errors.password}
            touched={touched.password}
          />
        </motion.div>
        <motion.button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || isLoading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </motion.button>
        <GoogleButton delay={0.58} />
      </Form>
    )}
  </Formik>
));

// Main login modal component
export const LoginModal = ({ isOpen, onClose, redirectAfterLogin, onLoginSuccess }) => {
  const [tab, setTab] = useState('password'); // 'password' or 'otp'
  const [showOtp, setShowOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  // Send OTP to phone number
  const handleSendOtp = useCallback(async (phone, setFieldValue) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(MOBILE_LOGIN_URL, {
        mobileNumber: parseInt(phone, 10)
      });
      
      if (response.data.success) {
        setOtpSent(true);
        setShowOtp(true);
        setMobileNumber(phone);
        setIsRegistered(response.data.isRegistered);
        setFieldValue('showOtp', true);
        
        // Start timer
        setOtpTimer(30);
        let timer = 30;
        const interval = setInterval(() => {
          timer -= 1;
          setOtpTimer(timer);
          if (timer <= 0) clearInterval(interval);
        }, 1000);
        
        toast.success(response.data.message || 'OTP sent successfully!');
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify OTP
  const handleVerifyOtp = useCallback(async (values) => {
    try {
      setIsLoading(true);
      
      // Verify OTP with the server
      const response = await axios.post(VERIFY_OTP_URL, {
        mobileNumber: parseInt(mobileNumber, 10),
        otp: otpValue
      });
      
      if (response.data.success) {
        // Store token and user data
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user._id);
        localStorage.setItem('userName', user.userName);
        
        // Set user data for the success modal
        setUserData({
          userName: user.userName,
          _id: user._id
        });
        
        // Show success modal
        setShowSuccessModal(true);
        toast.success(response.data.message || 'Login successful!');
      } else {
        toast.error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  }, [mobileNumber, otpValue]);

  // Handle password login
  const handlePasswordLogin = useCallback(async (values, { setSubmitting }) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(SIGN_IN_URL, {
        email: values.email,
        password: values.password
      });
      
      const { token, id } = response.data;
      
      // Store token and ID in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', id);
      
      // Fetch user data
      const userData = await fetchUserData(id);
      setUserData(userData);
      
      // Show success modal
      setShowSuccessModal(true);
      setSubmitting(false);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  }, []);
  
  // Handle registration form submission
  const handleRegistration = useCallback(async (values, { setSubmitting }) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(SIGN_UP_URL, {
        userName: values.name,
        email: values.email,
        password: values.password,
        mobileNumber: values.mobile
      });
      
      toast.success(response.data.message || 'Registration successful!');
      setSubmitting(false);
      
      // Automatically log in the user after successful registration
      try {
        const loginResponse = await axios.post(SIGN_IN_URL, {
          email: values.email,
          password: values.password
        });
        
        const { token, id } = loginResponse.data;
        
        // Store token and ID in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', id);
        
        // Fetch and store user data
        const userData = await fetchUserData(id);
        setUserData(userData);
        
        // Show success modal
        setShowSuccessModal(true);
        
      } catch (loginError) {
        console.error('Auto-login failed after registration:', loginError);
        // Not showing this error to user since registration was successful
        onClose(); // Close modal if login fails
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onClose]);
  
  // Final close handler (after success)
  const handleFinalClose = useCallback(() => {
    setShowSuccessModal(false);
    
    // Call onLoginSuccess if provided
    if (onLoginSuccess) {
      onLoginSuccess();
    } else if (redirectAfterLogin) {
      // Redirect if path is provided
      window.location.href = redirectAfterLogin;
    } else {
      // Otherwise just close the modal
      onClose();
    }
  }, [onClose, onLoginSuccess, redirectAfterLogin]);

  // Toggle between login and register modes
  const toggleMode = useCallback(() => {
    setMode(mode === 'login' ? 'register' : 'login');
    setTab('password'); // Reset to password tab when switching modes
    setShowOtp(false); // Hide OTP input when switching modes
  }, [mode]);

  return (
    <>
      <ModalWrapper isOpen={isOpen && !showSuccessModal} onClose={onClose}>
        <Dialog.Panel
          as={motion.div}
          className="modal-panel classy-modal-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, type: 'spring', bounce: 0.18 }}
        >
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
          
          <LogoHeader />
          
          {/* Main Mode Switcher */}
          {/* <motion.div
            className="modal-tab-switcher main-mode-switcher"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4 }}
          >
            <button
              className={`modal-tab-btn${mode === 'login' ? ' active' : ''}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`modal-tab-btn${mode === 'register' ? ' active' : ''}`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </motion.div> */}
          
          {mode === 'login' ? (
            <>
              {/* Login Tab Switcher */}
              <motion.div
                className="modal-tab-switcher"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
              >
                <button
                  className={`modal-tab-btn${tab === 'password' ? ' active' : ''}`}
                  onClick={() => { setTab('password'); setShowOtp(false); }}
                >
                  Password
                </button>
                <button
                  className={`modal-tab-btn${tab === 'otp' ? ' active' : ''}`}
                  onClick={() => { setTab('otp'); setShowOtp(false); }}
                >
                  Login with OTP
                </button>
              </motion.div>
              
              <Dialog.Title className="modal-title">
                Welcome To Thumbnail Guru
              </Dialog.Title>
              <div className="modal-subtitle">Please enter your credentials to login</div>
              
              {/* Render appropriate form based on selected tab */}
              {tab === 'password' ? (
                <PasswordLoginForm 
                  handleSubmit={handlePasswordLogin} 
                  isLoading={isLoading} 
                />
              ) : (
                <OtpLoginForm 
                  handleSendOtp={handleSendOtp}
                  handleVerifyOtp={handleVerifyOtp}
                  showOtp={showOtp}
                  otpValue={otpValue}
                  setOtpValue={setOtpValue}
                  otpTimer={otpTimer}
                  isLoading={isLoading}
                />
              )}
              
              <div className="mode-switch-text">
                Don't have an account? <button type="button" onClick={toggleMode} className="mode-switch-btn">Register now</button>
              </div>
            </>
          ) : (
            <>
              <Dialog.Title className="modal-title">
                Create Account
              </Dialog.Title>
              <div className="modal-subtitle">Join us and get started with your journey</div>
              
              <RegistrationForm 
                handleSubmit={handleRegistration}
                isLoading={isLoading}
              />
              
              <div className="mode-switch-text">
                Already have an account? <button type="button" onClick={toggleMode} className="mode-switch-btn">Login now</button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </ModalWrapper>
      
      {/* Success Modal */}
      <LoginSuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleFinalClose}
        userName={userData?.userName}
      />
    </>
  );
};

// Registration modal component
export const RegisterModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Handle registration form submission
  const handleSubmit = useCallback(async (values, { setSubmitting }) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(SIGN_UP_URL, {
        userName: values.name,
        email: values.email,
        password: values.password,
        mobileNumber: values.mobile
      });
      
      toast.success(response.data.message || 'Registration successful!');
      setSubmitting(false);
      
      // Automatically log in the user after successful registration
      try {
        const loginResponse = await axios.post(SIGN_IN_URL, {
          email: values.email,
          password: values.password
        });
        
        const { token, id } = loginResponse.data;
        
        // Store token and ID in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', id);
        
        // Fetch and store user data
        const userData = await fetchUserData(id);
        setUserData(userData);
        
        // Show success modal
        setShowSuccessModal(true);
        
      } catch (loginError) {
        console.error('Auto-login failed after registration:', loginError);
        // Not showing this error to user since registration was successful
        onClose(); // Close modal if login fails
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onClose]);
  
  // Final close handler (after success)
  const handleFinalClose = useCallback(() => {
    setShowSuccessModal(false);
    onClose();
  }, [onClose]);

  return (
    <>
      <ModalWrapper isOpen={isOpen && !showSuccessModal} onClose={onClose}>
        <Dialog.Panel
          as={motion.div}
          className="modal-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, type: 'spring', bounce: 0.18 }}
        >
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
          
          <LogoHeader />
          
          <Dialog.Title className="modal-title">
            Create Account
          </Dialog.Title>
          
          <RegistrationForm 
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Dialog.Panel>
      </ModalWrapper>
      
      {/* Success Modal */}
      <LoginSuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleFinalClose}
        userName={userData?.userName}
      />
    </>
  );
}; 