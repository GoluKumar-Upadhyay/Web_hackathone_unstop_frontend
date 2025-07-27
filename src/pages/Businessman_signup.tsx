import React, { useState, useEffect, useRef } from "react";
import { IonHeader, IonContent, IonPage, IonImg } from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import "./Businessman_signup.css";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBJH-vZGOEu2Kpi_Rw6RGZSTR_nsP_0VSU",
  authDomain: "nearbux-ae614.firebaseapp.com",
  projectId: "nearbux-ae614",
  storageBucket: "nearbux-ae614.firebasestorage.app",
  messagingSenderId: "852185715667",
  appId: "1:852185715667:web:616be6d84d10fd5a861526",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface FormData {
  name: string;
  username: string;
  phoneNumber: string;
  password: string;
  companyLogo?: File | null;
}

const Businessman_signup: React.FC = () => {
  const ionrouter = useIonRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    phoneNumber: "",
    password: "",
    companyLogo: null,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const shopId = localStorage?.getItem("shopId");
      const ownerId = localStorage?.getItem("ownerId");
      const token = localStorage?.getItem("token");
      
      if (shopId && ownerId && token) {
        // Show option instead of auto-redirect
        setError("You are already logged in. Click here to go to dashboard or clear session to signup again.");
      }
    } catch (err) {
      console.error("Error accessing localStorage:", err);
    }
  };

  const logout = () => {
    try {
      localStorage?.removeItem("shopId");
      localStorage?.removeItem("ownerId");
      localStorage?.removeItem("token");
      localStorage?.removeItem("phone");
      setError(null);
      console.log("Session cleared successfully");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const goToDashboard = () => {
    ionrouter.push("/Businessman_Home");
  };

  useEffect(() => {
    if (!otpSent) {
      initializeRecaptcha();
    }
    return () => {
      clearRecaptcha();
    };
  }, [otpSent]);

  const initializeRecaptcha = () => {
    clearRecaptcha();
    setTimeout(() => {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "normal",
          callback: () => setError(null),
          "expired-callback": () => setError("reCAPTCHA expired. Please refresh the page."),
        });
        recaptchaVerifierRef.current.render();
      } catch (err) {
        console.error("Error initializing reCAPTCHA:", err);
        setError("Failed to initialize reCAPTCHA. Please refresh the page.");
      }
    }, 500);
  };

  const clearRecaptcha = () => {
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      const container = document.getElementById("recaptcha-container");
      if (container) container.innerHTML = "";
    } catch (err) {
      console.error("Error clearing reCAPTCHA:", err);
    }
  };

  // Handle Enter key press to prevent unwanted form submission
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 6);
    setOtp(value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, "").substring(0, 10);
    return `+91${cleaned}`;
  };

  const validateInputs = async (): Promise<boolean> => {
    const { name, username, phoneNumber, password } = formData;

    if (!name || !username || !phoneNumber || !password) {
      setError("All fields are required");
      return false;
    }

    if (/^\d+$/.test(username)) {
      setError("Username cannot be only numbers");
      return false;
    }

    if (username.includes(" ")) {
      setError("Username cannot contain spaces.");
      return false;
    }

    if (username.length > 9) {
      setError("Username should be within 9 characters");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    const phonePattern = /^\+91\d{10}$/;
    if (!phonePattern.test(formatPhoneNumber(phoneNumber))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }

    try {
      const res = await axios.post(`http://localhost:3000/shop/validate`, {
        username,
        phoneNumber: formatPhoneNumber(phoneNumber),
      });

      if (res.data?.usernameExists) {
        setError("Username already taken");
        return false;
      }

      if (res.data?.phoneExists) {
        setError("Phone number already registered");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Validation error:", err);
      setError("Server error during validation");
      return false;
    }
  };

  const sendOTP = async () => {
    setLoading(true);
    setError(null);

    const isValid = await validateInputs();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      if (!formData.name || !formData.username || !formData.phoneNumber || !formData.password) {
        throw new Error("All fields are required");
      }
      
      const formattedPhoneNumber = formatPhoneNumber(formData.phoneNumber);
      
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA not initialized. Please refresh the page.");
      }
      
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhoneNumber, 
        recaptchaVerifierRef.current
      );
      
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(`Failed to send OTP: ${err.message || 'Unknown error'}`);
      
      // Re-initialize reCAPTCHA if there was an error
      initializeRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const idToken = await user.getIdToken(true);

      const { name, username, phoneNumber, password } = formData;
      
      const payload = { 
        name, 
        username, 
        phoneNumber: formatPhoneNumber(phoneNumber), 
        password 
      };

      const response = await axios.post(
        `http://localhost:3000/shop/signup`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      if (response.status === 200) {
        try {
          localStorage?.setItem("phone", formatPhoneNumber(phoneNumber));
        } catch (err) {
          console.error("Error saving to localStorage:", err);
        }
        
        setSuccess(true);
        
        setTimeout(() => {
          ionrouter.push("/Businessman_shopinfo");
        }, 2000);
      } else {
        throw new Error(response.data?.message || 'Signup failed');
      }
    } catch (err: any) {
      console.error("Error verifying OTP or signing up:", err);
      let message = "Signup error occurred";
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.error?.[0]?.message) {
        message = err.response.data.error[0].message;
      } else if (err.message) {
        message = err.message;
      }
    
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoneNumber = () => {
    setOtpSent(false);
    setError(null);
    setOtp("");
    setVerificationId("");
  };

  // Handle form submission properly
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otpSent) {
      sendOTP();
    } else {
      verifyOTP();
    }
  };

  // Show success screen if signup is successful
  if (success) {
    return (
      <IonPage>
        <IonHeader></IonHeader>
        <IonContent fullscreen className="businessman-signup-page">
          <div className="b-signup-success-card">
            <div className="b-signup-wave-container">
              <div className="b-signup-wave-circle"></div>
              <div className="b-signup-wave-circle delay1"></div>
              <div className="b-signup-wave-circle delay2"></div>
              <div className="b-signup-checkmark-circle">
                <div className="b-signup-checkmark">&#10003;</div>
              </div>
            </div>
            <h2 className="b-signup-success-heading">Signup Successful!</h2>
            <p className="b-signup-success-message">Thank you for registering with us.</p>
            <div className="b-signup-done-button">Redirecting you shortly...</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader></IonHeader>
      <IonContent fullscreen className="businessman-signup-page">
        <div className="b-signup-logo-container">
          <IonImg className="b-signup-l-img" src="/logo.jpg"></IonImg>
        </div>
        <div className="b-signup-container">
          <div className="b-signup-box">
            {error && (
              <div className="b-signup-error">
                {error}
                {error.includes("already logged in") && (
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={goToDashboard} className="b-signup-link" style={{ marginRight: '10px' }}>
                      Go to Dashboard
                    </button>
                    <button onClick={logout} className="b-signup-link">
                      Clear Session
                    </button>
                  </div>
                )}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleFormSubmit}>
                <h2 className="b-signup-title">Create an Account</h2>

                <div className="b-signup-field">
                  <label htmlFor="name" className="b-signup-label">Full Name</label>
                  <div className="b-signup-input-wrapper">
                    <span className="b-signup-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="b-signup-input"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="b-signup-field">
                  <label htmlFor="username" className="b-signup-label">Username</label>
                  <div className="b-signup-input-wrapper">
                    <span className="b-signup-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"></path>
                      </svg>
                    </span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      maxLength={9}
                      className="b-signup-input"
                      placeholder="Create a username"
                    />
                  </div>
                </div>

                <div className="b-signup-field">
                  <label htmlFor="phoneNumber" className="b-signup-label">Phone Number</label>
                  <div className="b-signup-input-wrapper">
                    <span className="b-signup-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </span>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                      placeholder="Enter 10 digit number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="b-signup-input"
                    />
                  </div>
                </div>

                <div className="b-signup-field">
                  <label htmlFor="password" className="b-signup-label">Password</label>
                  <div className="b-signup-password-wrapper">
                    <span className="b-signup-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <circle cx="12" cy="16" r="1"></circle>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      maxLength={16}
                      value={formData.password}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="b-signup-input"
                      placeholder="Create a password"
                    />
                    <button type="button" onClick={togglePasswordVisibility} className="b-signup-toggle-password">
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div id="recaptcha-container" className="b-signup-recaptcha"></div>

                <button
                  type="submit"
                  disabled={loading}
                  className="b-signup-button"
                >
                  {loading ? 'Sending OTP...' : 'Get OTP'}
                </button>

                <p className="b-signup-footer">
                  Already have an account? <a href='/Businessman_signin' className="b-signup-link">Sign in</a>
                </p>

                <div className="b-signup-divider"></div>
              </form>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <h2 className="b-signup-title">Verify Your Number</h2>

                <div className="b-signup-field">
                  <label htmlFor="otp" className="b-signup-label">
                    Enter OTP sent to {formatPhoneNumber(formData.phoneNumber)}
                  </label>
                  <div className="b-signup-input-wrapper">
                    <span className="b-signup-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                        <polyline points="3,5 12,12 21,5"></polyline>
                      </svg>
                    </span>
                    <input
                      id="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={handleOtpChange}
                      onKeyPress={handleKeyPress}
                      className="b-signup-input"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="b-signup-button"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign Up'}
                </button>

                <div className="b-signup-resend">
                  <button type="button" onClick={handleChangePhoneNumber} className="b-signup-link">
                    Change phone number?
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {success && (
          <div className="success-card">
            <div className="b-signup-wave-container">
              <div className="b-signup-wave-circle"></div>
              <div className="b-signup-wave-circle delay1"></div>
              <div className="b-signup-wave-circle delay2"></div>
              <div className="b-signup-checkmark-circle">
                <div className="b-signup-checkmark">&#10003;</div>
              </div>
            </div>
            <h2 className="b-signup-success-heading">Signup Successful!</h2>
            <p className="b-signup-success-message">Thank you for registering with us.</p>
            <div className="b-signup-done-button">Redirecting you shortly...</div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Businessman_signup;