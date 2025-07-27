import React ,{useState,useEffect}from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonImg, IonLabel, IonInput } from '@ionic/react';
import { useHistory} from 'react-router-dom';
import { useIonRouter } from '@ionic/react';
import axios from 'axios';
import './User_signup_helper_1.css';





const User_signup_helper_1: React.FC = () => {
  const ionRouter = useIonRouter(); 
  const [area, setArea] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  
  async function handleSubmit  (e : any)  {
    e.preventDefault();
    // Basic validation
    if (!area.trim()) {
      setError('Please enter your area name.');
      return;
    }
    if (!/^\d{6}$/.test(pinCode)) {
      setError('Please enter a valid 6-digit pin code.');
      return;
    }
    setError('');
    const phoneNumber = localStorage.getItem("phone");
    const response =  await  axios.post("http://localhost:3000/user/info", {pinCode , area , phoneNumber});
    if (response.status === 200) {
      localStorage.setItem('area', area);
      localStorage.setItem('pin', pinCode);
    
      // ✅ Add small delay before routing to ensure localStorage is saved
      setTimeout(() => {
        ionRouter.push("/User_home");
      }, 100); // 100ms delay
    }
  };

   
      

   
  

  return (
    <IonPage>
      
      <IonContent fullscreen className='user-signup-helper-1'>
      <div className="address-container">
      <form 
        onSubmit={handleSubmit}
        className="address-form"
      >
        <IonImg src='user.png' style={{height:'80px',widht:'80px'}}></IonImg>
        <IonLabel style={{}}>create you account</IonLabel>
        <h2 className="form-title">Enter Your Address</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="area" className="form-label">
            Area Name
          </label>
          <input
            id="area"
            style={{background:'white',color:'black'}}
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="form-input"
            placeholder="e.g., Downtown"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="pinCode" className="form-label">
            Pin Code
          </label>
          <input
            id="pinCode"
            type="text"
            style={{background:'white',color:'black'}}
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            className="form-input"
            placeholder="e.g., 560001"
            maxLength={6}
          />
        </div>
        
        <IonButton
          type="submit"
          className="submit-button"
        >
          Submit
        </IonButton>
      </form>
    </div>
        
       
      </IonContent>
    </IonPage>
  );
};

export default User_signup_helper_1;