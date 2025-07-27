import React, {useState, useEffect} from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonImg, IonLabel, IonInput ,IonIcon} from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { colorFill,eyeOutline ,eyeOffOutline, textOutline} from 'ionicons/icons';
import './User_signup.css'

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
const db = getFirestore(app);
  
interface FormData {
    name: string;
    username: string;
    phoneNumber: string;
    password: string;
    companyLogo?: File | null;
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const User_signup: React.FC = () => {
  const ionRouter = useIonRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    phoneNumber: '',
    password: '',
    companyLogo: null
  });
        
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    // Initialize recaptcha on component mount
    setupRecaptcha();
    
    return () => {
      // Clean up recaptcha on unmount
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
        }
      } catch (err) {
        console.error("Error clearing reCAPTCHA:", err);
      }
    };
  }, []);

  const setupRecaptcha = () => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          setError('reCAPTCHA expired. Please refresh the page.');
        }
      });
    } catch (err: any) {
      console.error("Error setting up reCAPTCHA:", err);
      setError(`reCAPTCHA setup error: ${err.message || 'Unknown error'}`);
    }
  };

  // Handle form input changes
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        companyLogo: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOtpChange = (e: any) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setOtp(value);
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    return cleaned;
  };

  // Send OTP
  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.username || !formData.phoneNumber || !formData.password) {
        throw new Error("All fields are required");
      }
      
      const formattedPhoneNumber = formatPhoneNumber(formData.phoneNumber);
      
      if (!window.recaptchaVerifier) {
        setupRecaptcha();
      }
      
      const appVerifier = window.recaptchaVerifier;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(`Failed to send OTP: ${err.message || 'Unknown error'}`);
      
      // Reset reCAPTCHA
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
        }
        setupRecaptcha();
      } catch (clearErr) {
        console.error("Error clearing reCAPTCHA:", clearErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }
  
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
  
      const idToken = await user.getIdToken(/* forceRefresh */ true);
  
      const { name, username, phoneNumber, password } = formData;
      const payload = { name, username, phoneNumber, password };
  
      const response = await axios.post(
        'http://localhost:3000/user/signup',
        payload,
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );
  
      if (response.status === 200) {
        localStorage.setItem("phone", phoneNumber);
        localStorage.setItem('username', username);
        localStorage.setItem('name', name);
        setSuccess(true);
        
        // Use setTimeout for navigation after success message display
        setTimeout(() => {
          ionRouter.push('/User_signup_helper_1');
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Signup failed');
      }
    } catch (err: any) {
      console.error("Error verifying OTP or signing up:", err);
      setError(`Signup error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '28rem'
        }}>
          <div style={{textAlign: 'center'}}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#16a34a',
              marginBottom: '1rem'
            }}>Signup Successful!</h2>
            <p style={{color: '#374151'}}>Thank you for registering with us.</p>
            <p style={{color: '#4b5563', marginTop: '1rem'}}>Redirecting to info page...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <IonPage>
      <IonContent fullscreen className='User_signup_pages'>
        
        <form onSubmit={!otpSent ? sendOTP : verifyOTP} style={{
          width: '100%',
          maxWidth: '450px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '0.75rem',
           
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}>
            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #f87171',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                marginBottom: '1rem',
                width: '100%'
              }}>
                {error}
              </div>
            )}

            {!otpSent ? (
              <>
                <IonImg 
                  src='user.png' 
                  style={{
                    height: '80px',
                    width: '80px',
                    marginBottom: '1rem'
                  }}
                />
                <h1 style={{
                  color: 'black',
                  fontFamily: 'sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>Signup</h1>
                <p style={{
                  fontSize: '14px',
                  color: 'black',
                  marginBottom: '1.5rem'
                }}>Create an Account just a few second!</p>
          
                <div style={{
                  width: '100%',
                  marginBottom: '1rem'
                }}>
                  <IonLabel style={{
                    color: 'black',
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>Full Name</IonLabel>
                  <IonInput
                  className='input-styling-in-signup'
                    name="name"
                    value={formData.name}
                    onIonChange={(e) => setFormData({...formData, name: e.detail.value || ''})}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '2px 4px',
                      width: '100%',
                      backgroundColor: '#f9fafb',
                      color:'black',
                      textIndent:'10px'
                    }} 
                    type='text'
                  />
                </div>
          
                <div style={{
                  width: '100%',
                  marginBottom: '1rem'
                }}>
                  <IonLabel style={{
                    color: 'black',
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>Username</IonLabel>
                  <IonInput
                  
                    className='input-styling-in-signup'
                    name="username"
                    value={formData.username}
                    onIonChange={(e) => setFormData({...formData, username: e.detail.value || ''})}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      width: '100%',
                      backgroundColor: '#f9fafb',
                      color:'black',
                      textIndent:'10px'
                    }} 
                    type='text'
                  />
                </div>
          
                <div style={{
                  width: '100%',
                  marginBottom: '1rem'
                }}>
                  <IonLabel style={{
                    color: 'black',
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>Phone Number (with country code)</IonLabel>
                  <IonInput
                  className='input-styling-in-signup'
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onIonChange={(e) => setFormData({...formData, phoneNumber: e.detail.value || ''})}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      paddingLeft:'10px',
                      width: '100%',
                      backgroundColor: '#f9fafb',
                      color:'black',
                      textIndent:'10px'

                    }}
                    placeholder="+91.........."
                  />
                </div>
          
                <div style={{ width: '100%', marginBottom: '1rem' }}>
                  <IonLabel
                    style={{
                      color: 'black',
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    Password
                  </IonLabel>

                  {/* Wrapper to position icon correctly */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <IonInput
                      className="input-styling-in-signup"
                      name="password"
                      value={formData.password}
                      onIonChange={(e) =>
                        setFormData({ ...formData, password: e.detail.value || '' })
                      }
                      style={{
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        textIndent:'10px',
                        paddingRight: '40px', // space for icon
                        width: '100%',
                        backgroundColor: '#f9fafb',
                        color: 'black',
                        height: '40px',
                      }}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                    />

                    {/* Eye icon positioned inside the input */}
                    <IonIcon
                      icon={showPassword ? eyeOffOutline : eyeOutline}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        fontSize: '22px',
                        color: 'black',
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                    />
                  </div>
                </div>
                <div id="recaptcha-container" style={{marginBottom: '1rem', width: '100%'}}></div>
          
                <IonButton
                  expand="block"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    margin: '0.5rem auto',
                    '--background': '#3b82f6',
                    '--color': 'white'
                  }}
                >
                  {loading ? 'Sending...' : 'Get OTP'}
                </IonButton>
              </>
            ) : (
              <div style={{width: '100%'}}>
                <div style={{marginBottom: '1.5rem', width: '100%'}}>
                  <label style={{
                    display: 'block',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }} htmlFor="otp">
                    Enter OTP
                  </label>
                  <input
                  className='input-styling-in-signup'
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={handleOtpChange}
                    style={{
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      appearance: 'none',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      color: '#374151',
                      lineHeight: '1.5',
                      outline: 'none',
                      background:'white'
                      
                      
                    }}
                    placeholder="Enter 6-digit code"
                  />
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      outline: 'none',
                      width: '100%',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      border: 'none'
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Signup'}
                  </button>
                </div>
              </div>
            )}

            {otpSent && (
              <div style={{
                marginTop: '1rem',
                textAlign: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  style={{
                    color: '#3b82f6',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Change phone number?
                </button>
              </div>
            )}
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default User_signup;