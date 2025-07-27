import React, { useState } from "react";
import { 
  IonHeader, 
  IonContent, 
  IonPage, 
  IonImg, 
  IonItem, 
  IonLabel,
  IonDatetimeButton,
  IonModal,
  IonDatetime, 
  IonInput, 
  IonButton
} from '@ionic/react';
import './Businessman_shopinfo.css';
import { useIonRouter } from "@ionic/react";
import axios from "axios";

interface FormData {
  shopName: string;
  tagline: string;
  pin: string;
  localArea: string;
  coinValue: string;
  ownerId: string;
  opens: string;
  closes: string;
}

const Businessman_shopinfo: React.FC = () => {
  const ionrouter = useIonRouter();
  const [formData, setFormData] = useState<FormData>({
    shopName: '',
    tagline: '',
    pin: '',
    localArea: '',
    coinValue: '',
    ownerId: '',
    opens: '',
    closes: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: CustomEvent) => {
    const target = e.target as HTMLIonInputElement;
    const { name, value } = target;
    if (name && value !== undefined) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value; // This will be in HH:MM format
    console.log(`Time input changed for ${fieldName}:`, value);
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  // Helper function to convert time string to minutes for comparison
  const timeToMinutes = (timeString: string): number => {
    if (!timeString) return -1; // Return -1 for empty strings to handle validation
    
    try {
      // Handle HH:MM format directly (from HTML time input)
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          return hours * 60 + minutes;
        }
      }
      
      // Handle ISO datetime format (fallback)
      let timeOnly = timeString;
      if (timeString.includes('T')) {
        timeOnly = timeString.split('T')[1];
      }
      if (timeOnly.includes('+') || timeOnly.includes('Z')) {
        timeOnly = timeOnly.split(/[+Z]/)[0];
      }
      
      const timeParts = timeOnly.split(':');
      if (timeParts.length < 2) return -1;
      
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return -1;
      }
      
      return hours * 60 + minutes;
    } catch (error) {
      console.error('Error parsing time:', error);
      return -1;
    }
  };

  // Helper function to format time for display and backend
  const formatTimeForBackend = (timeString: string): string => {
    if (!timeString) return '';
    
    try {
      // If it's already in HH:MM format, validate and return
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':').map(Number);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          return timeString;
        }
      }
      
      // Handle ISO datetime format
      let timeOnly = timeString;
      if (timeString.includes('T')) {
        timeOnly = timeString.split('T')[1];
      }
      if (timeOnly.includes('+') || timeOnly.includes('Z')) {
        timeOnly = timeOnly.split(/[+Z]/)[0];
      }
      
      // Validate the extracted time
      const timeParts = timeOnly.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      return '';
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  // Helper function to convert 24-hour to 12-hour format for display
  const formatTimeForDisplay = (timeString: string): string => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const beforesubmitcheck = async (): Promise<number> => {
    // Check for empty required fields
    if (!formData.shopName.trim()) {
      setError("Shop name is required");
      return 1;
    }
    
    if (!formData.tagline.trim()) {
      setError("Tagline is required");
      return 1;
    }
    
    if (!formData.pin.trim()) {
      setError("PIN code is required");
      return 1;
    }
    
    if (!formData.localArea.trim()) {
      setError("Local area is required");
      return 1;
    }
    
    if (!formData.coinValue.trim()) {
      setError("Coin value is required");
      return 1;
    }
    
    if (!formData.opens) {
      setError("Opening time is required");
      return 1;
    }
    
    if (!formData.closes) {
      setError("Closing time is required");
      return 1;
    }
    
    // Validate coin value
    const value = parseInt(formData.coinValue);
    if (isNaN(value) || value > 10 || value < 5) {
      setError('Value of coin can be only from 5 to 10');
      return 1;
    }

    // Validate PIN code (should be 6 digits)
    if (formData.pin.length !== 6 || !/^\d{6}$/.test(formData.pin)) {
      setError('PIN code must be exactly 6 digits');
      return 1;
    }

    // Validate time format and logic
    const opensMinutes = timeToMinutes(formData.opens);
    const closesMinutes = timeToMinutes(formData.closes);
    
    if (opensMinutes === -1) {
      setError('Invalid opening time format. Please select a valid time.');
      return 1;
    }
    
    if (closesMinutes === -1) {
      setError('Invalid closing time format. Please select a valid time.');
      return 1;
    }
    
    if (opensMinutes >= closesMinutes) {
      setError('Opening time must be before closing time');
      return 1;
    }

    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const phone = localStorage.getItem('phone');
      if (!phone) {
        setError('Phone number not found. Please login again.');
        setLoading(false);
        return;
      }
  
      const validationResult = await beforesubmitcheck();
      if (validationResult) {
        setLoading(false);
        return;
      }
  
      // Get ownerId from backend
      const ownerRes = await axios.post('http://localhost:3000/shop/id', { phone });
      const ownerId = parseInt(ownerRes.data.message);
  
      // Format opens and closes as ISO DateTime
      const today = new Date().toISOString().split("T")[0]; // e.g., "2025-05-31"
      const formattedOpens = new Date(`${today}T${formData.opens}:00`).toISOString();
      const formattedCloses = new Date(`${today}T${formData.closes}:00`).toISOString();
  
      const payload = {
        shopName: formData.shopName,
        tagline: formData.tagline,
        pin: formData.pin,
        localArea: formData.localArea,
        coinValue: parseInt(formData.coinValue),
        ownerId: ownerId,
        opens: formattedOpens,
        closes: formattedCloses
      };
  
      console.log("Payload:", payload);
  
      const res = await axios.post('http://localhost:3000/shop/info', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(res.data.message || 'Failed to submit shop information');
      }
  
      localStorage.setItem('ownerId', ownerId.toString());
      localStorage.setItem('shopId', res.data.id?.toString());
  
      ionrouter.push('/Businessman_shopimg');
  
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <IonPage>
      <IonContent fullscreen className="businessman-shopinfo">
        <div className="b-shopinfo-logo-container">
          <div className="b-shopinfo-logoes">
            <IonImg src="logo.jpg" className="b-shopinfo-logo-size" />
          </div>
        </div>
        <br /><br />
        
        {error && (
          <div className="error-message" style={{ color: 'red', padding: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <h1 className="b-shopinfo-b-info">Business Information</h1>
          <br /><br />
          
          <div className="shopinfo--field-container">
            <IonLabel>Shop Name</IonLabel>
            <IonInput 
              type="text"
              name="shopName"
              value={formData.shopName}
              onIonInput={handleChange}
              className="b-shopinfo-input-box"
              required
            />
          </div>
          <br />
          
          <div className="shopinfo--field-container">
            <IonLabel>Tagline</IonLabel>
            <IonInput 
              type="text"
              name="tagline"
              value={formData.tagline}
              onIonInput={handleChange}
              className="b-shopinfo-input-box"
              placeholder="Enter shop tagline"
              required
            />
          </div>
          <br />
          
          <div className="shopinfo--field-container">
            <IonLabel>Pin code</IonLabel>
            <IonInput 
              type="text"
              name="pin"
              value={formData.pin}
              onIonInput={(e) => {
                const target = e.target as HTMLIonInputElement;
                const value = target.value as string;
                if (/^\d{0,6}$/.test(value)) {
                  setFormData({ ...formData, pin: value });
                }
              }}
              inputMode="numeric"
              maxlength={6}
              className="b-shopinfo-input-box"
              placeholder="Enter 6-digit PIN"
              required
            />
          </div>
          <br />
          
          <div className="shopinfo--field-container">
            <IonLabel>Local Area</IonLabel>
            <IonInput 
              type="text"
              name="localArea"
              value={formData.localArea}
              onIonInput={handleChange}
              className="b-shopinfo-input-box"
              required
            />
          </div>
          <br />
          
          <div className="shopinfo--field-container">
            <IonLabel>Value of 100 coins</IonLabel>
            <IonInput 
              type="number"
              name="coinValue"
              value={formData.coinValue}
              placeholder="Value must lie between 5 to 10"
              max="10"
              min="5"
              step="1"
              onIonInput={handleChange}
              className="b-shopinfo-input-box"
              required
            />
          </div>
          <br />
          
          <div className="b-time-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            {/* Opening Time */}
            <div className="b-time-field" style={{ flex: 1 }}>
              <IonLabel className="b-input-label">Opening Time *</IonLabel>
              <input
                type="time"
                value={formData.opens}
                onChange={(e) => handleTimeInputChange(e, 'opens')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
                required
              />
              {formData.opens && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {formatTimeForDisplay(formData.opens)}
                </div>
              )}
            </div>
            
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>to</span>
            
            {/* Closing Time */}
            <div className="b-time-field" style={{ flex: 1 }}>
              <IonLabel className="b-input-label">Closing Time *</IonLabel>
              <input
                type="time"
                value={formData.closes}
                onChange={(e) => handleTimeInputChange(e, 'closes')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
                required
              />
              {formData.closes && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {formatTimeForDisplay(formData.closes)}
                </div>
              )}
            </div>
          </div>
          
          {/* Show selected times for confirmation */}
          {(formData.opens && formData.closes) && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#e8f5e8', 
              borderRadius: '8px', 
              margin: '10px 0',
              border: '1px solid #4CAF50'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#2e7d32' }}>
                ✓ Business Hours Set:
              </p>
              <p style={{ margin: '0', fontSize: '14px', color: '#2e7d32' }}>
                {formatTimeForDisplay(formData.opens)} - {formatTimeForDisplay(formData.closes)}
              </p>
            </div>
          )}
          <br /><br />
          
          <IonButton 
            type="submit"
            disabled={loading} 
            className="b-shopinfo-btn-submit"
            expand="block"
          >
            {loading ? 'Submitting...' : 'Submit & Continue'}
          </IonButton>
        </form>
        <br /><br />
      </IonContent>
    </IonPage>
  );
};

export default Businessman_shopinfo;