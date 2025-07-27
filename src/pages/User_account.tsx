import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonMenu,
  IonMenuToggle,
  IonIcon,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonInput,
  IonToast
} from '@ionic/react';
import './User_account.css'
import { chevronBackOutline, logOutOutline, pencilOutline, checkmarkOutline } from 'ionicons/icons';
import { useHistory} from 'react-router-dom';

const User_account: React.FC = () => {
    const [editMode, setEditMode] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [profile, setProfile] = useState({
      name:"",
      phone: "",
      pin: "",
      address: "",
      areaname: "",
      shopTimeFrom: "10:00",
      shopTimeTo: "20:00",
      coinValue: "",
    });

    // ✅ Load from localStorage on first render
    useEffect(() => {
      // Debug: Log all stored values
      console.table({
        name: localStorage.getItem("name"),
        phone: localStorage.getItem("phone"),
        pin: localStorage.getItem("pin"),
        address: localStorage.getItem("address"),
        areaname: localStorage.getItem("area"),
        shopTimeFrom: localStorage.getItem("shopTimeFrom"),
        shopTimeTo: localStorage.getItem("shopTimeTo"),
        coinValue: localStorage.getItem("coinValue"),
      });
  
      setProfile({
        name: localStorage.getItem("name")|| "",
        phone: localStorage.getItem("phone") || "",
        pin: localStorage.getItem("pin") || "",
        address: localStorage.getItem("address") || "",
        areaname: localStorage.getItem("area") || "",
        shopTimeFrom: localStorage.getItem("shopTimeFrom") || "10:00",
        shopTimeTo: localStorage.getItem("shopTimeTo") || "20:00",
        coinValue: localStorage.getItem("coinValue") || "",
      });
    }, []);
  
    const handleChange = (field: string, value: string) => {
      setProfile({ ...profile, [field]: value });
    };

    const validatePin = (pin: string): boolean => {
      return /^\d{6}$/.test(pin);
    };

    const handleSave = () => {
      // Validate PIN before saving
      if (!validatePin(profile.pin)) {
        setToastMessage('PIN must be exactly 6 digits');
        setShowToast(true);
        return;
      }

      

      setEditMode(false);
      setToastMessage('Profile saved successfully');
      setShowToast(true);
    };

    const toggleEditMode = () => {
      if (editMode) {
        handleSave();
      } else {
        setEditMode(true);
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('shopId');
      localStorage.removeItem('ownerId');
      window.location.href = '/User_login';
    };

  return (
   <IonPage>
    <IonHeader className='User_account-b-header-tag'>
        <div className="User_account-bac-icon-b-page">
            <IonButton routerLink='/User_home' fill='clear'>
              <IonIcon className='User_account-b-page-b-icon' icon={chevronBackOutline}></IonIcon>
            </IonButton>
        </div>
       <div className="User_account-b-page-header-content">My profile</div>
    </IonHeader>
    
    <IonContent fullscreen className='User_account-b-account'>
        <br />
        <div className="User_account-a-holder-img">
            <div className="User_account-b-page-a-img">
            <img
                    src="https://pplx-res.cloudinary.com/image/private/user_uploads/63485613/bfe2e61a-2386-43b1-9ae8-07aa7abce054/a1.png.jpg"
                    alt="Shop"
                    className="User_account-b-page-img-upload"
                    />  
            </div>
            <div className="User_account-b-page-a-name">{profile.name}</div>
        </div><br /> 
        
        <div className="User_account-b-page-personal-info">
            <div className="User_account-info-b-page">Personal Information</div>
            <div className="User_account-b-page-edit-icon">
                <IonButton fill='clear' onClick={toggleEditMode}>
                  <IonIcon 
                    className='User_account-b-page-pencil' 
                    icon={editMode ? checkmarkOutline : pencilOutline}>
                  </IonIcon>
                </IonButton>
            </div>
        </div>
        
        <form>
            <div className="User_account-b-page-take-data">
                <div className="User_account-b-page-dataentering">
                    <IonTitle className='User_account-b-page-datafont'>Phone Number</IonTitle>
                    <IonInput 
                      className='User_account-b-page-account-input'
                      type='text'
                      value={profile.phone} 
                      onIonInput={(e) => handleChange('phone', e.detail.value!)}
                      disabled={!editMode}>
                    </IonInput>
                </div>
                
                
                
                <div className="User_account-b-page-dataentering">
                    <IonTitle className='User_account-b-page-datafont'>Pin code</IonTitle>
                    <IonInput 
                      className='User_account-b-page-account-input'
                      type='text'
                      value={profile.pin}
                      onIonInput={(e) => handleChange('pin', e.detail.value!)}
                      disabled={!editMode}
                      maxlength={6}
                      minlength={6}
                      placeholder="Enter 6-digit PIN">
                    </IonInput>
                </div>
                
                <div className="User_account-b-page-dataentering">
                    <IonTitle className='User_account-b-page-datafont'>Area name</IonTitle>
                    <IonInput 
                      className='User_account-b-page-account-input'
                      type='text'
                      value={profile.areaname}
                      onIonInput={(e) => handleChange('areaname', e.detail.value!)}
                      disabled={!editMode}>
                    </IonInput>
                </div>
            </div>

            <div className="User_account-b-page-shop-time-container">
                <div className="User_account-b-page-others-label">Others</div>
            </div>
                
            <IonButton fill='clear' className='User_account-b-page-help-and-sp'>Help & Support</IonButton><br />
            <IonButton fill='clear' className='User_account-b-page-help-and-sp'>Terms & Condition</IonButton><br />
                
            <div className="User_account-b-page-logout-btn">
                <IonButton className='User_account-b-page-style-l-btn' onClick={handleLogout}>Logout
                    <IonIcon className='User_account-logouticon-b-page' icon={logOutOutline}></IonIcon>
                </IonButton>
            </div>
        </form>
        <br /><br />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
    </IonContent>
   </IonPage>
  );
};

export default User_account;
