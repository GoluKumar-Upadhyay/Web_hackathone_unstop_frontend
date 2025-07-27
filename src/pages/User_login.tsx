import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonButton, 
  IonInput, 
  IonLabel,
  IonToast
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './User_login.css';

const User_login: React.FC = () => {
  const history = useHistory();
  const [userInput, setUserInput] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      history.replace('/User_home');
    }
  }, [history]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (!userInput || !password) {
      setToastMessage('Please enter both username/phone and password');
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    console.log('Starting login process...');

    try {
      console.log('Sending login data:', { userInput, password });
      
      const response = await fetch('http://localhost:3000/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userInput, 
          password 
        }),
      });

      const data = await response.json();
      console.log('Response received:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.token) {
        throw new Error('No token received from server');
      }

     
      console.log('Login successful! Token received');
      localStorage.setItem('authToken', data.token);
      localStorage.setItem("username",data.userInput);
      localStorage.setItem("username",data.userId);
      
      // Set success state and show success message
      setIsSuccess(true);
      setToastMessage('Login successful! Redirecting...');
      setShowToast(true);
      
      // Delay navigation to allow state updates to complete
      setTimeout(() => {
        console.log('Navigating to User_home');
        history.replace('/User_home');
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      setToastMessage(error instanceof Error ? error.message : 'Login failed. Please try again.');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    history.push('/User_signup');
  };

  const handleForgotPassword = () => {
    history.push('/forgot-password');
  };

  return (
    <IonPage>
      <IonContent fullscreen className='user_login'>
        <form onSubmit={handleLogin}>
          <div className="loginpage">
            <div className="avtar"></div>
            <h1 className='loginfont'>Login</h1>
            <br></br>
            <div className="input-container">
              <IonLabel position="stacked" className='Labeluser_signup'>Username or Phone</IonLabel>
              <IonInput 
                name='userInput' 
                value={userInput}
                onIonChange={e => setUserInput(e.detail.value || '')}
                placeholder='Email or Phone' 
                className='inputs'
                disabled={isLoading || isSuccess}
              ></IonInput>
              
              <IonLabel position="stacked" className='Labeluser_signup'>Password</IonLabel>
              <IonInput 
                name='password' 
                type="password"
                value={password}
                onIonChange={e => setPassword(e.detail.value || '')}
                placeholder='Password' 
                className='inputs'
                disabled={isLoading || isSuccess}
              ></IonInput>
            </div>
            
            <div className="forget">
              <p id='forgetpassword' onClick={handleForgotPassword}>Forget Password?</p>
            </div>
            <br /><br />
            
            <IonButton 
              className='loginbtn' 
              type="submit"
              disabled={isLoading || isSuccess}
            >
              {isLoading ? 'Logging in...' : isSuccess ? 'Success!' : 'Login'}
            </IonButton>
            <br />
            
            <div className="banner">
              <div className="item">
                <div className="icon secure-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <span className="text">Secured</span>
              </div>
              
              <div className="item">
                <div className="icon privacy-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <span className="text">Privacy Protected</span>
              </div>
            </div>
            
            <div className="signup-link">
              <p className='signup'>Don't have an account? <span onClick={navigateToSignup} className='textsignup'>Sign Up</span></p>
            </div>
          </div>
        </form>
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color={isSuccess ? "success" : "danger"}
        />
      </IonContent>
    </IonPage>
  );
};

export default User_login;