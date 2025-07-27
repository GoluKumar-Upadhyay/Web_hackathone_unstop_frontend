import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonFooter,
  IonRouterLink,
  IonIcon,IonSegment,IonSegmentButton , IonLabel
} from '@ionic/react';
import {
  locationOutline,
  searchOutline,
  informationCircleOutline,
  personCircleOutline,
  cartOutline,
  homeOutline,
  walletOutline,
  scanOutline,
  menuOutline,
  bagHandleOutline
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './User_wallet.css';

const User_wallet: React.FC = () => {
  const history = useHistory();
  const location = useLocation(); 
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Simulate fetching from backend
    fetch("/api/getBalance")
      .then((res) => res.json())
      .then((data) => {
        setBalance(data.balance); // assuming { balance: 124.57 }
      })
      .catch(error => {
        console.error("Error fetching balance:", error);
      });
  }, []); // Added dependency array

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <IonPage>
      <IonHeader className='userwallet-header'>
        <h1 className='header-wallet-text'>Hello, Username</h1>
      </IonHeader>
      <IonContent fullscreen className='user-wallet'>
        <div className="user-wallet-icondiv">
          <IonIcon icon={walletOutline} className='user-walletheader-icon'></IonIcon>
          <h1 className='user-wallet-mywallet'>My Wallet</h1>
        </div>

        <div className="wallet-card">
          <h2 className="wallet-card-title">Total Balance</h2>
          <div className="wallet-card-balance">
            <img
              src="/rupee.png" 
              alt="coin"
              className="coin-icon"
            />
            <span className="balance-amount">{balance}</span>
            <img
              src="/user-interface.png" 
              alt="mastercard"
              className="mastercard-icon"
            />
          </div>
        </div>

            <h1 className="user-wallet-transactionlist">Transaction List</h1>
          <IonSegment  className="custom-wallet-segment">
          <IonSegmentButton value="custom" className="custom-wallet-segment-button">
            <IonLabel>All </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="segment" className="custom-wallet-segment-button">
            <IonLabel>Spent</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="buttons" className="custom-wallet-segment-button">
            <IonLabel>Received</IonLabel>
          </IonSegmentButton>
        </IonSegment>


      </IonContent>
      <IonFooter className='userwallet-footer'>
        <div className="userwallet-footernavbar">
          <IonRouterLink href='/User_home'>
            <div className="footerwallet-item" style={{ color: isActive('/User_home') ? 'blue' : 'black' }}>
              <IonIcon icon={homeOutline} className="footerwallet-icon" />
              <span className="footerwallet-text">Home</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/User_shop'>
            <div className="footerwallet-item" style={{ color: isActive('/User_shop') ? 'blue' : 'black' }}>
              <IonIcon icon={bagHandleOutline} className="footerwallet-icon" />
              <span className="footerwallet-text">Shops</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/User_wallet'>
            <div className="footerwallet-item" style={{ color: isActive('/User_wallet') ? 'blue' : 'black' }}>
              <IonIcon icon={walletOutline} className="footerwallet-icon" />
              <span className="footerwallet-text">Wallet</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/User_account'>
            <div className="footerwallet-item" style={{ color: isActive('/User_account') ? 'blue' : 'red' }}>
              <IonIcon icon={personCircleOutline} className="footerwallet-iconaccount" />
              <span className="footerwallet-textaccount">Account</span>
            </div>
          </IonRouterLink>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default User_wallet;