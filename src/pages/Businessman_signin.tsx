import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useIonRouter } from "@ionic/react";
import { IonHeader, IonContent, IonPage, IonImg } from '@ionic/react';
import './Businessman_signin.css'

const Businessman_signin: React.FC = () => {
  const IonRouter = useIonRouter()
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [inputType, setInputType] = useState<'phone' | 'username'>('username');
  const [animateForm, setAnimateForm] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAnimateForm(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Determine if input is phone number (exactly 10 digits) or username
    if (/^\d{10}$/.test(value)) {
      setInputType('phone');
    } else {
      setInputType('username');
    }
  };

  async function validate() {
    if (!input.trim()) {
      setError(inputType === 'phone' ? "Phone number is required" : "Username is required");
      return false;
    }
    
    if (!passwordRef.current?.value?.trim()) {
      setError("Password is required");
      return false;
    }
    
    // Additional validation for username format
    if (inputType === 'username' && !/^[a-zA-Z0-9_]{3,20}$/.test(input.trim())) {
      setError("Username must be 3-20 characters (letters, numbers, underscores)");
      return false;
    }
    
    return true;
  }

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isValid = await validate();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      let userInput = input.trim();
      const password = passwordRef.current?.value?.trim();

      // Format phone number if needed
      if (inputType === 'phone') {
        userInput = '+91' + userInput; // Always send with country code
      }

      console.log('Sending login request:', { 
        userInput, 
        inputType,
        passwordLength: password?.length 
      });

      const response = await axios.post(`http://localhost:3000/shop/signin`, { 
        userInput, 
        password 
      });

      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("shopId", response.data.shopId);
        localStorage.setItem("ownerId", response.data.ownerId);
        
        IonRouter.push('/businessman_Home');
      }
    } catch (e: any) {
      console.error('Login error:', e);
      const message = e.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader></IonHeader>
      <IonContent fullscreen className="b-signin-businessman-signin-page">
        <div className="b-signin-page">
          <div className="b-signin-logo-containers">
            <div className="b-signin-logo-container-box">
              <IonImg src="logo.jpg" className="b-signin-img-fix"></IonImg>
            </div>
          </div>
          <h1 className="b-signin-welcome-back-in">Welcome back</h1>
          <h1 className="b-signin-sname">Sign in to your account</h1>
          <form onSubmit={signIn}>
            <div className="b-signin-input-group">
              <label className="b-signin-input-label">
                Username or Phone
                {input && (
                  <span className="b-signin-input-type-indicator">
                    ({inputType === 'phone' ? 'Phone Number' : 'Username'})
                  </span>
                )}
              </label>
              <div className="b-signin-input-wrapper">
                <div className="b-signin-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="b-signin-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  value={input}
                  onChange={handleInputChange} 
                  type="text" 
                  className="b-signin-input-field" 
                  placeholder={inputType === 'phone' ? "Enter 10-digit phone number" : "Enter username"}
                  maxLength={inputType === 'phone' ? 10 : 20}
                />
              </div>
              {inputType === 'phone' && input.length === 10 && (
                <div className="b-signin-phone-preview">
                 
                </div>
              )}
            </div>

            <div className="b-signin-form-group">
              <div className="b-signin-form-label-row">
                <label className="b-signin-form-label">Password</label>
                <span 
                  onClick={() => IonRouter.push("/B_forget")} 
                  className="b-signin-forgot-password"
                >
                  Forgot password?
                </span>
              </div>

              <div className="b-signin-form-input-wrapper">
                <div className="b-signin-form-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" className="b-signin-form-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                <input 
                  ref={passwordRef} 
                  type={showPassword ? "text" : "password"}
                  className="b-signin-form-input" 
                  placeholder="Enter your password"
                  minLength={6}
                />

                <div className="b-signin-form-icon-right">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="b-signin-form-eye-toggle"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="b-signin-form-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="b-signin-form-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="b-signin-error-container">
                <p className="b-signin-error-text">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="b-signin-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="b-signin-spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="b-signin-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="b-signin-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
            
            <div className="b-signin-signup-footer">
              <p className="b-signin-signup-footer-text">
                Don't have an account?{' '}
                <a href="/businessman_signup" className="b-signin-signup-footer-link">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Businessman_signin;