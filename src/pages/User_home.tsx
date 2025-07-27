import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonGrid, IonRow, IonCol, IonButton } from '@ionic/react';
import { briefcase, people, notifications, settings, time, sunny, checkmarkCircle, trendingUp } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

import {
  refreshOutline,
  locationOutline,
  searchOutline,
  micOutline,
  timeOutline,
  informationCircleOutline,
  personCircleOutline,
  serverOutline,
  cartOutline,
  homeOutline,
  walletOutline,
  scanOutline,menuOutline,
  bagHandleOutline,closeOutline,personOutline,settingsOutline,notificationsOutline,heartOutline,logOutOutline
} from 'ionicons/icons';

import './User_home.css';



const User_home: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
    const [animateContent, setAnimateContent] = useState(false);
    const history = useHistory();
  
    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      setTimeout(() => setAnimateContent(true), 100);
      return () => clearInterval(timer);
    }, []);
  
    const navigateToshop = () => {
      history.push('/User_account');
    };
  
    
    const navigateToAccount = () => {
      history.push('/User_account');
    };
  
    const headerStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, #2E8B57 0%, #228B22 100%)',
      boxShadow: '0 4px 20px rgba(46, 139, 87, 0.3)',
    };
  
    const contentStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, #98FB98 0%, #90EE90 100%)',
      minHeight: '100vh',
      padding: '20px',
    };
  
    const welcomeStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      borderRadius: '24px',
      padding: '32px 24px',
      marginBottom: '24px',
      textAlign: 'center',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255,255,255,0.3)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      transform: animateContent ? 'translateY(0)' : 'translateY(30px)',
      opacity: animateContent ? 1 : 0,
      transition: 'all 0.8s ease-out',
    };
  
    const featureBoxStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)',
      borderRadius: '18px',
      padding: '20px',
      margin: '8px',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      height: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    };
  
    const businessHighlights = [
      { label: 'Business Status', value: '🟢 Active', color: '#4CAF50' },
      { label: 'Today\'s Priority', value: '📦 Stock Check', color: '#2196F3' },
      { label: 'Weather Today', value: '☀️ 28°C', color: '#FF9800' },
      { label: 'Your Mood', value: '💪 Confident', color: '#9C27B0' },
    ];
  
    const businessFeatures = [
      { icon: briefcase, title: 'Inventory Management', subtitle: 'Track your products', color: '#667eea' },
      { icon: people, title: 'Customer Care', subtitle: 'Support your clients', color: '#764ba2' },
      { icon: notifications, title: 'Business Updates', subtitle: 'Stay informed', color: '#a8edea' },
      { icon: settings, title: 'Preferences', subtitle: 'Customize settings', color: '#fed6e3' },
    ];
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar style={headerStyle}>
            <IonTitle style={{ 
              color: 'black', 
              textAlign: 'center', 
              fontWeight: '600',
              fontSize: '20px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              NearBy Shops
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonContent style={contentStyle}>
          
          <div style={welcomeStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 style={{ 
                margin: 0, 
                background: 'linear-gradient(135deg, #2E8B57 0%, #228B22 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '32px',
                fontWeight: '700'
              }}>
              
              </h1>
              <div style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                  <IonIcon icon={time} />
                  {currentTime.toLocaleTimeString()}
                </div>
                <div>{currentTime.toLocaleDateString()}</div>
              </div>
            </div>
            
            <p style={{ 
              color: '#555', 
              marginBottom: '24px', 
              fontSize: '18px',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              Ready to make today count? Your business empire awaits your next move! 🚀
            </p>
            
            
            <IonGrid style={{ padding: 0 }}>
              <IonRow>
                {businessHighlights.map((highlight, index) => (
                  <IonCol size="6" key={index}>
                    <div style={{
                      background: `linear-gradient(135deg, ${highlight.color}15 0%, ${highlight.color}08 100%)`,
                      borderRadius: '16px',
                      padding: '16px',
                      textAlign: 'center',
                      border: `2px solid ${highlight.color}20`,
                      transform: animateContent ? 'scale(1)' : 'scale(0.9)',
                      opacity: animateContent ? 1 : 0,
                      transition: `all 0.6s ease-out ${index * 0.1 + 0.2}s`,
                    }}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        marginBottom: '6px',
                        color: highlight.color
                      }}>
                        {highlight.value}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        fontWeight: '500'
                      }}>
                        {highlight.label}
                      </div>
                    </div>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
  
          
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ 
              color: '#2E8B57', 
              textAlign: 'center', 
              marginBottom: '20px',
              fontSize: '24px',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(255,255,255,0.8)'
            }}>
              Purchasing Raw-Material 📊
            </h2>
            
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    margin: '8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(46, 139, 87, 0.2)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }} 
                  onClick={navigateToshop}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#32CD32',
                      marginRight: '12px',
                      boxShadow: '0 0 8px rgba(50, 205, 50, 0.5)',
                    }}></div>
                    <IonIcon icon={briefcase} style={{ 
                      fontSize: '24px', 
                      color: '#32CD32',
                      marginRight: '12px'
                    }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '18px', 
                        fontWeight: '600',
                        color: '#32CD32'
                      }}>
                        Shops
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '13px', 
                        color: '#666',
                        fontWeight: '400'
                      }}>
                        NearBy shops
                      </p>
                    </div>
                  </div>
                </IonCol>
                
                
                
                <IonCol size="12">
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    margin: '8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(60, 179, 113, 0.2)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }} 
                  onClick={navigateToAccount}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#3CB371',
                      marginRight: '12px',
                      boxShadow: '0 0 8px rgba(60, 179, 113, 0.5)',
                    }}></div>
                    <IonIcon icon={settings} style={{ 
                      fontSize: '24px', 
                      color: '#3CB371',
                      marginRight: '12px'
                    }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '18px', 
                        fontWeight: '600',
                        color: '#3CB371'
                      }}>
                        Account Settings
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '13px', 
                        color: '#666',
                        fontWeight: '400'
                      }}>
                        Profile & App Preferences
                      </p>
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
  
          
          
        </IonContent>
      </IonPage>
  );
};

export default User_home;