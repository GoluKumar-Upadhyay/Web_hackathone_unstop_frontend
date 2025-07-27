import React, { useState, useRef, useEffect } from "react";
import { IonFooter, IonContent, IonPage, IonInput, IonLabel, IonTitle, IonButton } from '@ionic/react';
import { personOutline } from 'ionicons/icons';
import './B_forget.css'
import axios from "axios";
import { useIonRouter } from "@ionic/react";
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBJH-vZGOEu2Kpi_Rw6RGZSTR_nsP_0VSU",
    authDomain: "nearbux-ae614.firebaseapp.com",
    projectId: "nearbux-ae614",
    storageBucket: "nearbux-ae614.firebasestorage.app",
    messagingSenderId: "852185715667",
    appId: "1:852185715667:web:616be6d84d10fd5a861526"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const B_forget: React.FC = () => {
  const ionroute = useIonRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password, 4: Success
  const [success, setSuccess] = useState(false);
  // Reference for reCAPTCHA verifier
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Only initialize reCAPTCHA if we're on step 1
    if (currentStep === 1) {
      // Clear any existing reCAPTCHA
      clearRecaptcha();
      
      // Create a new container if needed
      if (!recaptchaContainerRef.current) {
        recaptchaContainerRef.current = document.getElementById('recaptcha-container');
      }
      
      // Create new reCAPTCHA
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': () => {
            // reCAPTCHA solved
            console.log("reCAPTCHA verified successfully");
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please refresh and try again.');
          }
        });
        
        // Render the reCAPTCHA
        recaptchaVerifierRef.current.render().catch(error => {
          console.error("Error rendering reCAPTCHA:", error);
          setError("Failed to load reCAPTCHA. Please refresh the page.");
        });
      } catch (err) {
        console.error("Error initializing reCAPTCHA:", err);
        setError("Failed to initialize verification. Please refresh the page.");
      }
    }
    
    // Cleanup function
    return () => {
      clearRecaptcha();
    };
  }, [currentStep]);

  const clearRecaptcha = () => {
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } catch (err) {
      console.error("Error clearing reCAPTCHA:", err);
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '').substring(0, 10);
    return `+91${cleaned}`;
  };

  // Handle phone number change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').substring(0, 10);
    setPhoneNumber(value);
  };

  // Handle OTP change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setOtp(value);
  };

  // Validate phone number
  const validatePhone = () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  // Send OTP
  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validatePhone()) {
      setLoading(false);
      return;
    }

    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA not initialized. Please refresh the page.");
      }
      
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      const appVerifier = recaptchaVerifierRef.current;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setCurrentStep(2);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(`Failed to send OTP: ${err.message || 'Unknown error'}`);
      
      // Don't try to recreate reCAPTCHA here - we'll handle that in the useEffect
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      
      // Successfully verified, move to password update step
      setCurrentStep(3);
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(`Verification failed: ${err.message || 'Invalid OTP'}`);
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate passwords
      if (!newPassword || newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Get current user token
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Authentication failed. Please try again.");
      }

      const idToken = await user.getIdToken(true);

      // Call backend API to update password
      const response = await axios.post(
        `http://localhost:3000/shop/updatepass`,
        {
          phoneNumber: formatPhoneNumber(phoneNumber),
          newPassword: newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        setCurrentStep(4);
        
        // Redirect to sign in page after a delay
        setTimeout(() => {
          ionroute.push("/Businessman_signin");
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Failed to update password');
      }
    } catch (err: any) {
      console.error("Error updating password:", err);
      let message = "Failed to update password";
      
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset to phone step
  const resetToPhoneStep = () => {
   
    setCurrentStep(1);
    setOtp('');
    setVerificationId('');
    setError(null);
  };

  if (success) {
    return (
      <div className="b-forget-success-card">
        <div className="b-forget-wave-container">
          <div className="b-forget-wave-circle"></div>
          <div className="b-forget-wave-circle delay1"></div>
          <div className="b-forget-wave-circle delay2"></div>
          <div className="b-forget-checkmark-circle">
            <div className="b-forget-checkmark">&#10003;</div>
          </div>
        </div>
        <h2 className="b-forget-success-heading">Password Updated!</h2>
        <p className="b-forget-success-message">Your password has been successfully updated.</p>
        
        <IonButton fill="clear" className="b-forget-btn" routerLink="/Businessman_signin">
          Sign in
        </IonButton>
      </div>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="b-forget-page">
        <form>
          <div className="b-forget-container">
            <div className="b-forget-card">
              {/* Logo Section */}
              <div className="b-forget-logo-container">
                <img src="logo.jpg" alt="Logo" className="b-forget-logo" />
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="b-forget-error-message">
                  {error}
                </div>
              )}
              
              {/* Step 1: Phone Number Input */}
              {currentStep === 1 && (
                <div>
                  <h2 className="b-forget-title">Reset Password</h2>
                  <p className="b-forget-subtitle">Enter your phone number to receive a verification code</p>
                  
                  <div className="b-forget-input-group">
                    <label className="b-forget-label" htmlFor="phoneNumber">
                      Phone Number
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="Enter 10 digit number"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className="b-forget-input"
                    />
                  </div>
                  
                  <div id="recaptcha-container" className="b-forget-recaptcha"></div>
                  
                  <button
                    onClick={sendOTP}
                    disabled={loading}
                    className="b-forget-primary-btn"
                    type="button"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                  
                  <p className="b-forget-footer-text">
                    Remember your password? <a href="/Businessman_signin" className="b-forget-link">Sign in</a>
                  </p>
                </div>
              )}
              
              {/* Step 2: OTP Verification */}
              {currentStep === 2 && (
                <div>
                  <h2 className="b-forget-title">Verify OTP</h2>
                  <p className="b-forget-subtitle">Enter the 6-digit code sent to your phone</p>
                  
                  <div className="b-forget-input-group">
                    <label className="b-forget-label" htmlFor="otp">
                      Verification Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={handleOtpChange}
                      className="b-forget-input"
                      placeholder="Enter 6-digit code"
                    />
                  </div>
                  
                  <button
                    onClick={verifyOTP}
                    disabled={loading}
                    className="b-forget-primary-btn"
                    type="button"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  
                  <div className="b-forget-text-center">
                    <button
                      onClick={resetToPhoneStep}
                      className="b-forget-secondary-btn"
                      type="button"
                    >
                      Change phone number?
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 3: Set New Password */}
              {currentStep === 3 && (
                <div>
                  <h2 className="b-forget-title">Set New Password</h2>
                  <p className="b-forget-subtitle">Create a new secure password for your account</p>
                  
                  <div className="b-forget-input-group">
                    <label className="b-forget-label" htmlFor="newPassword">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="b-forget-input"
                    />
                  </div>
                  
                  <div className="b-forget-input-group">
                    <label className="b-forget-label" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="b-forget-input"
                    />
                  </div>
                  
                  <button
                    onClick={updatePassword}
                    disabled={loading}
                    className="b-forget-primary-btn b-forget-update-btn"
                    type="button"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default B_forget;