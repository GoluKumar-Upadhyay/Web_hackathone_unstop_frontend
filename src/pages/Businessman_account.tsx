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
  IonToast,
  IonSpinner
} from '@ionic/react';
import './Businessman_account.css';
import { 
  chevronBackOutline, 
  logOutOutline, 
  pencilOutline, 
  saveOutline,
  closeOutline,
  checkmarkOutline,
  powerOutline 
} from 'ionicons/icons';

const Businessman_account: React.FC = () => {
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingShop, setTogglingShop] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        const shopId = localStorage.getItem('shopId');
        const ownerId = localStorage.getItem('ownerId');
        
        if (!shopId || !ownerId) {
          window.location.href = '/Businessman_signin';
          return;
        }

        const response = await fetch(`http://localhost:3000/shop/${shopId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch shop data');
        }

        const data = await response.json();
        
        setShopData({
          ...data,
          owner: data.owner || { name: '', phone: '' } 
        });
        
        setEditForm({
          name: data.name || '',
          tagline: data.tagline || '',
          pin: data.pin || '',
          localArea: data.localArea || '',
          coinValue: data.coinValue || 0,
          opens: data.opens ? new Date(data.opens).toTimeString().slice(0, 5) : '',
          closes: data.closes ? new Date(data.closes).toTimeString().slice(0, 5) : ''
        });
        
      } catch (err) {
        setError('Failed to load shop information');
        console.error('Error fetching shop data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setEditing(false);
    if (shopData) {
      setEditForm({
        name: shopData.name || '',
        tagline: shopData.tagline || '',
        pin: shopData.pin || '',
        localArea: shopData.localArea || '',
        coinValue: shopData.coinValue || 0,
        opens: shopData.opens ? new Date(shopData.opens).toTimeString().slice(0, 5) : '',
        closes: shopData.closes ? new Date(shopData.closes).toTimeString().slice(0, 5) : ''
      });
    }
    setError('');
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // Validate required fields
      if (!editForm.name || !editForm.localArea || !editForm.pin) {
        setError('Name, Local Area, and Pin Code are required');
        return;
      }

      // Validate coin value
      const coinValueNum = parseInt(editForm.coinValue);
      if (isNaN(coinValueNum) || coinValueNum < 0 || coinValueNum > 100) {
        setError('Coin value must be between 0 and 100');
        return;
      }

      // Validate time format and logic
      let openingTime = null;
      let closingTime = null;

      if (editForm.opens && editForm.closes) {
        openingTime = new Date(`1970-01-01T${editForm.opens}:00`);
        closingTime = new Date(`1970-01-01T${editForm.closes}:00`);
        
        if (openingTime >= closingTime) {
          setError('Opening time must be before closing time');
          return;
        }
      }

      const updateData = {
        name: editForm.name.trim(),
        tagline: editForm.tagline?.trim() || '',
        pin: editForm.pin.trim(),
        localArea: editForm.localArea.trim(),
        coinValue: coinValueNum,
        opens: openingTime,
        closes: closingTime
      };

      const response = await fetch(`http://localhost:3000/shop/${shopData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shop information');
      }
      
      const updatedData = await response.json();
      setShopData({
        ...updatedData,
        owner: shopData.owner // Preserve owner data
      });
      
      setEditing(false);
      setToastMessage('Changes saved successfully!');
      setShowToast(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
      console.error('Error updating shop data:', err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleShopStatus = async () => {
    try {
      setTogglingShop(true);
      setError('');

      const response = await fetch(`http://localhost:3000/shop/${shopData.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle shop status');
      }

      const updatedData = await response.json();
      setShopData(updatedData);
      setToastMessage(`Shop is now ${updatedData.isActive ? 'open' : 'closed'}`);
      setShowToast(true);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle shop status');
      console.error('Error toggling shop status:', err);
    } finally {
      setTogglingShop(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shopId');
    localStorage.removeItem('ownerId');
    window.location.href = '/Businessman_signin';
  };
  
  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column'
          }}>
            <IonSpinner name="circular" style={{ transform: 'scale(1.5)' }} />
            <p style={{ marginTop: '1rem', color: '#666' }}>Loading shop information...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!shopData) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column'
          }}>
            <p style={{ color: '#dc2626', fontSize: '1.125rem' }}>Failed to load shop information</p>
            <IonButton 
              onClick={() => window.location.reload()}
              style={{ marginTop: '1rem' }}
            >
              Retry
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className='b-header-tag'>
        <div className="bac-icon-b-page">
          <IonButton routerLink='/Businessman_Home' fill='clear'>
            <IonIcon className='b-page-b-icon' icon={chevronBackOutline}></IonIcon>
          </IonButton>
        </div>
        <div className="b-page-header-content">My profile</div>
      </IonHeader>
      
      <IonContent fullscreen className='b-account'>
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '12px 16px',
            margin: '16px',
            borderRadius: '8px'
          }}>
            {error}
          </div>
        )}
        
        {!shopData.isActive && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            padding: '12px 16px',
            margin: '16px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <IonIcon icon={powerOutline} style={{ fontSize: '16px' }} />
              <span style={{ fontWeight: '500' }}>Your shop is currently closed.</span>
            </div>
            <p style={{ fontSize: '14px', margin: '0' }}>
              Customers cannot place orders while your shop is closed. Toggle the switch below to open your shop.
            </p>
          </div>
        )}
        
        <br />
        
        <div className="a-holder-img">
          <div className="b-page-a-img">
            <img
              src={shopData.image || 'https://pplx-res.cloudinary.com/image/private/user_uploads/63485613/bfe2e61a-2386-43b1-9ae8-07aa7abce054/a1.png.jpg'}
              alt="Shop"
              className="b-page-img-upload"
            />  
          </div>
          <div className="b-page-a-name">
            {editing ? (
              <IonInput 
                className='b-page-account-input'
                value={editForm.name}
                onIonInput={(e) => handleInputChange('name', e.detail.value!)}
                placeholder="Shop Name"
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  '--color': '#000'
                }}
              />
            ) : (
              shopData.name
            )}
          </div>
        </div>
        
        <br /> 
        
        <div className="b-page-personal-info">
          <div className="info-b-page">Personal Information</div>
          <div className="b-page-edit-icon">
            {!editing ? (
              <IonButton 
                fill="solid" 
                onClick={handleEdit}
                style={{ '--background': '#2563eb' }}
              >
                <IonIcon icon={pencilOutline} slot="start" />
                Edit
              </IonButton>
            ) : (
              <IonButton 
                fill="solid" 
                onClick={handleToggleShopStatus}
                disabled={togglingShop}
                style={{ 
                  '--background': shopData.isActive ? '#dc2626' : '#10b981',
                  marginRight: '8px'
                }}
              >
                <IonIcon icon={powerOutline} slot="start" />
                {togglingShop ? '...' : shopData.isActive ? 'Close Shop' : 'Open Shop'}
              </IonButton>
            )}
          </div>
        </div>
        
        <form>
          <div className="b-page-take-data">
            <div className="b-page-dataentering">
              <IonTitle className='b-page-datafont'>Phone Number</IonTitle>
              <IonInput 
                className='b-page-account-input'
                type='text'
                value={shopData.owner?.phone || ''} 
                readonly={true}
              />
            </div>
            
            <div className="b-page-dataentering">
              <IonTitle className='b-page-datafont'>Local Area *</IonTitle>
              <IonInput 
                className={`b-page-account-input ${editing ? 'editable-field' : ''}`}
                value={editing ? editForm.localArea : shopData.localArea}
                onIonInput={(e) => handleInputChange('localArea', e.detail.value!)}
                readonly={!editing}
                placeholder={editing ? "Enter local area" : ""}
              />
            </div>
            
            <div className="b-page-dataentering">
              <IonTitle className='b-page-datafont'>Pin code *</IonTitle>
              <IonInput 
                className={`b-page-account-input ${editing ? 'editable-field' : ''}`}
                value={editing ? editForm.pin : shopData.pin}
                onIonInput={(e) => handleInputChange('pin', e.detail.value!)}
                readonly={!editing}
                placeholder={editing ? "Enter pin code" : ""}
              />
            </div>
            
            <div className="b-page-dataentering">
              <IonTitle className='b-page-datafont'>Shop Rating</IonTitle>
              <IonInput 
                className='b-page-account-input'
                value={`${shopData.rating || 0}/5`}
                readonly={true}
              />
            </div>
            
            <div className="b-page-dataentering">
              <IonTitle className='b-page-datafont'>Shop Tagline</IonTitle>
              <IonInput 
                className={`b-page-account-input ${editing ? 'editable-field' : ''}`}
                value={editing ? editForm.tagline : shopData.tagline}
                onIonInput={(e) => handleInputChange('tagline', e.detail.value!)}
                readonly={!editing}
                placeholder={editing ? "Enter shop tagline" : ""}
              />
            </div>
          </div>

          <div className="b-page-shop-time-container">
            <div className="b-page-form-group">
              <IonLabel className="b-page-field-label">Shop Time</IonLabel>
              <div className="b-page-time-container">
                <IonInput
                  type='time'
                  className={`b-page-account-input ${editing ? 'editable-field' : ''}`}
                  value={editing ? editForm.opens : (shopData.opens ? new Date(shopData.opens).toTimeString().slice(0, 5) : '')}
                  onIonInput={(e) => handleInputChange('opens', e.detail.value!)}
                  readonly={!editing}
                />
                <span className="b-page-b-page-to-text">To</span>
                <IonInput
                  type='time'
                  className={`b-page-account-input ${editing ? 'editable-field' : ''}`}
                  value={editing ? editForm.closes : (shopData.closes ? new Date(shopData.closes).toTimeString().slice(0, 5) : '')}
                  onIonInput={(e) => handleInputChange('closes', e.detail.value!)}
                  readonly={!editing}
                />
              </div>
            </div>

            <div className="b-page-form-group">
              <IonLabel className="b-page-field-label">Value Of Coins (0-100%)</IonLabel>
              <div className="b-page-coins-container">
                <IonInput
                  type="number"
                  className={`b-page-account-input ${editing ? 'editable-field' : ''}`}
                  placeholder="0"
                  min="0"
                  max="100"
                  value={editing ? editForm.coinValue : shopData.coinValue}
                  onIonInput={(e) => handleInputChange('coinValue', e.detail.value!)}
                  readonly={!editing}
                />
                <div className="b-page-percentage-symbol">%</div>
              </div>
            </div>

            <div className="b-page-others-label">Others</div>
          </div>
          
          <IonButton fill='clear' className='b-page-help-and-sp'>Help & Support</IonButton><br />
          <IonButton fill='clear' className='b-page-help-and-sp'>Terms & Condition</IonButton><br />
          
          <div className="b-page-logout-btn">
            <IonButton className='b-page-style-l-btn' onClick={handleLogout}>
              Logout
              <IonIcon className='logouticon-b-page' icon={logOutOutline}></IonIcon>
            </IonButton>
          </div>
        </form>
        
        <br /><br />

        {editing && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px', 
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
            paddingRight: '16px',
            paddingBottom: '16px'
          }}>
            <IonButton 
              fill="outline" 
              onClick={handleCancel}
              style={{ '--border-color': '#6b7280', '--color': '#6b7280' }}
              disabled={saving}
            >
              <IonIcon icon={closeOutline} slot="start" />
              Cancel
            </IonButton>
            <IonButton 
              fill="solid"
              onClick={handleSave}
              disabled={saving}
              style={{ '--background': '#2563eb' }}
            >
              <IonIcon icon={saving ? undefined : saveOutline} slot="start" />
              {saving ? (
                <>
                  <IonSpinner name="circular" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </IonButton>
          </div>
        )}
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastMessage.includes('successfully') ? 'success' : 'primary'}
        />
      </IonContent>
    </IonPage>
  );
};

export default Businessman_account;