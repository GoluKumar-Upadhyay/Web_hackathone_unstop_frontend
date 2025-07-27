import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonButton,
  IonIcon
} from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Businessman_shopimg.css';
import UploadComponent from '../components/imageupload';

const Businessman_shopimg: React.FC = () => {
    const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("shopId");
    console.log("shopId from localStorage:", storedId);
    setShopId(storedId);
  }, []);

  if (!shopId) {
    return <div>Loading...</div>; // Or a spinner
  }
  

  return (
    <IonPage>
      
     

      <IonContent fullscreen className='business-shopimg-page'>
        <div>
        <UploadComponent shopId={shopId} successRedirectDelay={2000} skipUrl="/Businessman_signin"></UploadComponent>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Businessman_shopimg;
