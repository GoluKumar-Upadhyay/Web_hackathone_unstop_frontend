import React, { useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonImg,
  useIonRouter
} from '@ionic/react';
import './Divider.css';

const Divider: React.FC = () => {
  const router = useIonRouter();

  useEffect(() => {
    const phone = localStorage.getItem('phone');
    const role = localStorage.getItem('role'); // Should be 'owner' or 'customer'

    if (phone && role) {
      // ✅ Auto-redirect user based on role
      if (role === 'owner') {
        router.push('/Businessman_Home', 'root');
      } else if (role === 'customer') {
        router.push('/User_home', 'root');
      }
    }
  }, [router]);

  return (
    <IonPage>
      <IonContent fullscreen className="divider-page">
        <div className="usercontent-container">
          <div className="app-logo">
            <IonImg src="/user.png" className="logo-img" />
          </div>
          <h1 className="nearbux">Nearshops</h1>
          <div className="dividerbutton-container">
            <h1 className="welcome-in-nearbux">Hello, Welcome!</h1>
            <p className="acknowledge">Choose how you'd like to use NearShops</p>
            <br /><br />

            <IonButton expand="full" className="app-button" onClick={() => {
              localStorage.setItem('role', 'owner');
              router.push('/Businessman_Home', 'forward');
            }}>
              <div className="app-button-content">
                <img src="/business-icon.png" alt="Business" className="app-icon" />
                <span>I'm a Business Owner</span>
              </div>
            </IonButton>
            <br />
            <IonButton expand="full" className="app-button" onClick={() => {
              localStorage.setItem('role', 'customer');
              router.push('/User_home', 'forward');
            }}>
              <div className="app-button-content">
                <img src="/customer.png" alt="Customer" className="app-icon" />
                <span>I'm a Customer</span>
              </div>
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Divider;
