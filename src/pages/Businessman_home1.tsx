import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon, IonImg, IonInput, IonTextarea,
  IonSegment, IonSegmentButton, IonSegmentContent, IonSegmentView, IonLabel,
  IonFooter, IonRouterLink, IonLoading, IonAlert, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonProgressBar, IonBadge, IonItem, IonThumbnail, IonText, IonGrid, IonRow, IonCol
} from '@ionic/react';
import {
  cartOutline, menuOutline, closeOutline, personCircleOutline, homeOutline, paperPlane, 
  newspaperOutline, checkmarkCircleOutline, eyeOutline, fingerPrintOutline, trendingUpOutline,
  imageOutline, createOutline, analyticsOutline
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Businessman_Home.css';



interface PromotionDetails {
  title: string;
  message: string;
  image: string;
  views: number;
  clicks: number;
  adverId: number;
}

const Businessman_Home1: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  
  // Promotion states
  const [promotionTitle, setPromotionTitle] = useState('');
  const [promotionMessage, setPromotionMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [hasActivePromotion, setHasActivePromotion] = useState(false);
  const [activePromotionDetails, setActivePromotionDetails] = useState<PromotionDetails | null>(null);
  const [shopId, setShopId] = useState<number | null>(null);
  const [shopKeeperId, setShopKeeperId] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Get IDs from localStorage and check for active promotion on component mount
  useEffect(() => {
    const storedShopId = localStorage.getItem("shopId");
    const storedOwnerId = localStorage.getItem("ownerId");

    if (storedShopId) {
      setShopId(parseInt(storedShopId));
    }
    if (storedOwnerId) {
      setShopKeeperId(parseInt(storedOwnerId));
    }

    const checkIfPromotionExists = async () => {
      if (storedShopId) {
        try {
          const alreadyResponse = await axios.post(`${BACKEND_URL}/shop/already`, { shopId: storedShopId });

          if (alreadyResponse.data.message === 1) {
            setHasActivePromotion(true);
            // Fetch promotion details
            try {
              const promotionDetailsResponse = await axios.get(`${BACKEND_URL}/shop/promotions/${storedShopId}`);
              setActivePromotionDetails(promotionDetailsResponse.data);
            } catch (error) {
              console.error("Error fetching promotion details:", error);
              setAlertMessage("Error loading promotion details");
              setShowAlert(true);
            }
          }
        } catch (error) {
          console.error("Error checking for existing promotion:", error);
          setHasActivePromotion(false);
          setActivePromotionDetails(null);
        }
      }
    };
    checkIfPromotionExists();
  }, []);

  const handleImageSelect = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAlertMessage('Please select a valid image file (PNG or JPG)');
        setShowAlert(true);
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setAlertMessage('File size should be less than 5MB');
        setShowAlert(true);
        return;
      }
      setSelectedImage(file);
    }
  };

  const uploadImageWithAdverId = async (adverId: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('adverId', adverId.toString());

    const response = await fetch(`${BACKEND_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    return response.json();
  };

  const createPromotionBackend = async (title: string, message: string, shopId: number, shopKeeperId: number) => {
    const response = await fetch(`${BACKEND_URL}/shop/create-promotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        message,
        shopId,
        shopKeeperId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create promotion');
    }

    return response.json();
  };

  const handleInitiatePayment = () => {
    if (!promotionTitle.trim() || !promotionMessage.trim()) {
      setAlertMessage('Please fill in both promotion title and message');
      setShowAlert(true);
      return;
    }

    if (!selectedImage) {
      setAlertMessage('Please upload a promotion image.');
      setShowAlert(true);
      return;
    }

    if (!shopId || !shopKeeperId) {
      setAlertMessage('Shop ID or Owner ID not found. Please make sure you are logged in.');
      setShowAlert(true);
      return;
    }

    setIsProcessing(true);

    const options = {
      key: "rzp_test_oFu38dED2ID6et",
      amount: 4900, // Amount in paise (₹49)
      currency: "INR",
      name: "Promotion Payment",
      description: "Payment for your promotion",
      handler: function (response: any) {
        setAlertMessage("Payment successful! You can now create your promotion.");
        setShowAlert(true);
        setPaymentSuccessful(true);
        setIsProcessing(false);
      },
      modal: {
        ondismiss: function () {
          setAlertMessage("Payment cancelled. Please try again to make the payment.");
          setShowAlert(true);
          setIsProcessing(false);
          setPaymentSuccessful(false);
        },
        escape: false,
        backdropclose: false,
      },
      theme: {
        color: "#3399cc",
      },
    };

    if (typeof (window as any).Razorpay === 'undefined') {
      setAlertMessage('Payment service not available. Please try again later.');
      setShowAlert(true);
      setIsProcessing(false);
      return;
    }

    const razorpay = new (window as any).Razorpay(options);
    razorpay.on("payment.failed", function (response: any) {
      setAlertMessage("Payment failed. Please try again.");
      setShowAlert(true);
      setIsProcessing(false);
      setPaymentSuccessful(false);
    });

    razorpay.open();
  };

  const handleCreatePromotion = async () => {
    setIsProcessing(true);

    try {
      const promotionData = await createPromotionBackend(
        promotionTitle.trim(),
        promotionMessage.trim(),
        shopId!,
        shopKeeperId!
      );

      if (selectedImage && promotionData.adverId) {
        await uploadImageWithAdverId(promotionData.adverId, selectedImage);
      }

      setAlertMessage('Promotion created successfully!');
      setShowAlert(true);
      
      // Reset form and refresh promotion status
      setPromotionTitle('');
      setPromotionMessage('');
      setSelectedImage(null);
      setPaymentSuccessful(false);
      
      // Check for updated promotion status
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Failed to create promotion:', error);
      setAlertMessage(`Failed to create promotion: ${error.message}`);
      setShowAlert(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = promotionTitle.trim() && promotionMessage.trim() && selectedImage && shopId && shopKeeperId;

  // If user has active promotion, show analytics dashboard
  if (hasActivePromotion && activePromotionDetails) {
    return (
      <IonPage>
        <IonHeader className='business-home-header'>
          <div className="business-home-header-content">
            <div className="business-home-left-header">
              {!isSidebarOpen && (
                <div className="business-home-hamburger-menushop" onClick={toggleSidebar}>
                  <IonIcon icon={menuOutline} className="business-home-menu-iconshop" />
                </div>
              )}
            </div>
            <IonButton routerLink='Businessman_account' fill='clear' color='transparent'>
              <div className="business-home-right-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={personCircleOutline} className="business-home-username-icon" />
                  <p className="business-home-welcome-text">username</p>
                </div>
              </div>
            </IonButton>
          </div>

          <div className={`business-home-sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="business-home-sidebar-close" onClick={closeSidebar}>
              <IonIcon icon={closeOutline} className="close-icon" />
            </div>
            <ul className="business-home-sidebar-list">
              <li onClick={() => history.push('/category')}>Category</li>
              <li onClick={() => history.push('/mycart')}>Mycart</li>
              <li onClick={() => history.push('/wallet')}>Wallet</li>
              <li onClick={() => history.push('/profile')}>Profile</li>
              <li onClick={() => history.push('/logout')} className='business-home-signuplogout'>Log Out</li>
            </ul>
          </div>
        </IonHeader>

        <IonContent fullscreen className='business-home'>
          <br />
          
          {/* Analytics Section */}
          <div className="business-home-anaytic-contain">
            <IonButton fill="clear" style={{cursor:'pointer'}} routerLink='Businessman_order'>
              <div className="business-home-nav-item">
                <div className="business-home-Order">
                  <IonImg src="/order.png" className="order-image-business"></IonImg>
                </div>
                <div className="nav-label">Order</div>
              </div>
            </IonButton>
            
            <IonButton fill="clear" style={{cursor:'pointer'}} routerLink='Businessman_history'>
              <div className="business-home-nav-item">
                <div className="business-home-Histroy">
                  <IonImg src="/history.png" className="history-image-business"></IonImg>
                </div>
                <div className="nav-label">History</div>
              </div>
            </IonButton>
            
            <IonButton fill="clear" style={{cursor:'pointer'}} routerLink='Businessman_analytics'>
              <div className="business-home-nav-item">
                <div className="business-home-Analytics">
                  <IonImg src="/analytics.png" className="analytics-image-business"></IonImg>
                </div>
                <div className="nav-label">Analytics</div>
              </div>
            </IonButton>
          </div>

          {/* Active Promotion Dashboard */}
          <div style={{ padding: '16px' }}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={checkmarkCircleOutline} color="success" style={{ marginRight: '8px' }} />
                  Active Promotion Dashboard
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                
                {/* Promotion Title and Message */}
                <IonCard color="light">
                  <IonCardContent>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '1.2em', fontWeight: 'bold' }}>
                      {activePromotionDetails.title}
                    </h2>
                    <p style={{ margin: '0', color: '#666', lineHeight: '1.4' }}>
                      {activePromotionDetails.message}
                    </p>
                  </IonCardContent>
                </IonCard>

                {/* Promotion Image */}
                {activePromotionDetails.image && (
                  <IonCard>
                    <IonCardContent>
                      <IonText>
                        <h3>Promotion Image</h3>
                      </IonText>
                      <img 
                        src={activePromotionDetails.image} 
                        alt="Promotion" 
                        style={{ 
                          width: '100%', 
                          height: '200px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          marginTop: '8px'
                        }} 
                      />
                    </IonCardContent>
                  </IonCard>
                )}

                {/* Analytics Cards */}
                <IonGrid>
                  <IonRow>
                    <IonCol size="6">
                      <IonCard color="primary">
                        <IonCardContent style={{ textAlign: 'center', color: 'white' }}>
                          <IonIcon icon={eyeOutline} size="large" />
                          <h2 style={{ margin: '8px 0 4px 0' }}>{activePromotionDetails.views.toLocaleString()}</h2>
                          <p style={{ margin: '0', fontSize: '0.9em' }}>Views</p>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                    <IonCol size="6">
                      <IonCard color="secondary">
                        <IonCardContent style={{ textAlign: 'center', color: 'white' }}>
                          <IonIcon icon={fingerPrintOutline} size="large" />
                          <h2 style={{ margin: '8px 0 4px 0' }}>{activePromotionDetails.clicks.toLocaleString()}</h2>
                          <p style={{ margin: '0', fontSize: '0.9em' }}>Clicks</p>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                {/* CTR Card */}
                <IonCard color="success">
                  <IonCardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IonIcon icon={trendingUpOutline} style={{ marginRight: '8px' }} />
                        <div>
                          <h3 style={{ margin: '0', fontSize: '1.1em' }}>Click-Through Rate</h3>
                          <p style={{ margin: '0', fontSize: '0.9em', opacity: '0.8' }}>Performance metric</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: '0', fontSize: '1.8em' }}>
                          {((activePromotionDetails.clicks / activePromotionDetails.views) * 100).toFixed(1)}%
                        </h2>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>

                {/* Status Badge */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <IonBadge color="success" style={{ padding: '8px 16px', fontSize: '1em' }}>
                    <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '4px' }} />
                    Promotion Active
                  </IonBadge>
                </div>

              </IonCardContent>
            </IonCard>
          </div>

        </IonContent>

        <IonFooter className='business-home-footer'>
          <div className="business-home-footer-navebar">
            <IonRouterLink href='/Businessman_Home'>
              <div className="business-home-footer-item">
                <IonIcon icon={homeOutline} className='business-home-footer-icon' style={{ color: isActive('/') ? 'blue' : 'black' }}></IonIcon>
                <span className='business-home-footer-text' style={{ color: isActive('/') ? 'blue' : 'black' }}>Home</span>
              </div>
            </IonRouterLink>
            <IonRouterLink href='/Businessman_inventory'>
              <div className="business-home-footer-item">
                <IonIcon icon={cartOutline} className='business-home-footer-icon' style={{ color: isActive('/') ? 'blue' : 'black' }}></IonIcon>
                <span className='business-home-footer-text' style={{ color: isActive('/') ? 'blue' : 'black' }}>Inventory</span>
              </div>
            </IonRouterLink>
            <IonRouterLink href='/Businessman_billing'>
              <div className="business-home-footer-item">
                <IonIcon icon={newspaperOutline} className='business-home-footer-icon' style={{ color: isActive('/') ? 'blue' : 'black' }}></IonIcon>
                <span className='business-home-footer-text' style={{ color: isActive('/') ? 'blue' : 'black' }}>Billing</span>
              </div>
            </IonRouterLink>
            <IonRouterLink href='/Businessman_account'>
              <div className="business-home-footer-item" style={{ color: isActive('/') ? 'blue' : 'black' }}>
                <IonIcon icon={personCircleOutline} className='business-home-footer-account-icon'></IonIcon>
                <span className='business-home-footer-account-text' style={{ color: isActive('/') ? 'blue' : 'red' }}>Account</span>
              </div>
            </IonRouterLink>
          </div>
        </IonFooter>
      </IonPage>
    );
  }

  // Default view - Create Promotion Form
  return (
    <IonPage>
      <IonHeader className='business-home-header'>
        <div className="business-home-header-content">
          <div className="business-home-left-header">
            {!isSidebarOpen && (
              <div className="business-home-hamburger-menushop" onClick={toggleSidebar}>
                <IonIcon icon={menuOutline} className="business-home-menu-iconshop" />
              </div>
            )}
          </div>
          <IonButton routerLink='Businessman_account' fill='clear' color='transparent'>
            <div className="business-home-right-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={personCircleOutline} className="business-home-username-icon" />
                <p className="business-home-welcome-text">username</p>
              </div>
            </div>
          </IonButton>
        </div>

        <div className={`business-home-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="business-home-sidebar-close" onClick={closeSidebar}>
            <IonIcon icon={closeOutline} className="close-icon" />
          </div>
          <ul className="business-home-sidebar-list">
            <li onClick={() => history.push('/category')}>Category</li>
            <li onClick={() => history.push('/mycart')}>Mycart</li>
            <li onClick={() => history.push('/wallet')}>Wallet</li>
            <li onClick={() => history.push('/profile')}>Profile</li>
            <li onClick={() => history.push('/logout')} className='business-home-signuplogout'>Log Out</li>
          </ul>
        </div>
      </IonHeader>

      <IonContent fullscreen className='business-home'>
        <br />
        <div className="business-home-anaytic-contain">
          <IonButton fill="clear" style={{cursor:'pointer'}} routerLink='Businessman_order'>
            <div className="business-home-nav-item">
              <div className="business-home-Order">
                <IonImg src="/order.png" className="order-image-business"></IonImg>
              </div>
              <div className="nav-label">Order</div>
            </div>
          </IonButton>
          
          <IonButton fill="clear" style={{cursor:'pointer'}} routerLink='Businessman_history'>
            <div className="business-home-nav-item">
              <div className="business-home-Histroy">
                <IonImg src="/history.png" className="history-image-business"></IonImg>
              </div>
              <div className="nav-label">History</div>
            </div>
          </IonButton>
          
          <IonButton fill="clear" style={{cursor:'pointer'}} routerLink='Businessman_analytics'>
            <div className="business-home-nav-item">
              <div className="business-home-Analytics">
                <IonImg src="/analytics.png" className="analytics-image-business"></IonImg>
              </div>
              <div className="nav-label">Analytics</div>
            </div>
          </IonButton>
        </div>

        <p className='business-pramotion-manager'>Promotion Manager</p>
        
        <div className="tab-boxconatin-business-home">
          <IonSegment className="segment-body-business" value="first">
            <IonSegmentButton className="segment-btn-business" value="first" contentId="first">
              <IonLabel className='create-new-parmaotion-business-home'>Create New Promotion</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton className="segment-btn-business" value="second" contentId="second">
              <IonLabel className='create-new-parmaotion-business-home'>Ongoing Promotion</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          
          <IonSegmentView className="segmentview-business-home">
            <IonSegmentContent id="first">
              <div className="form-container">
                
                {/* Show warning if missing shop/owner ID */}
                {(!shopId || !shopKeeperId) && (
                  <IonCard color="warning" style={{width:'90%'}}>
                    <IonCardContent style={{width:'80%'}}>
                      <IonText color="dark">
                        <p>Missing required information: Shop ID ({shopId || 'Not found'}) or Owner ID ({shopKeeperId || 'Not found'})</p>
                        <IonButton size="small" fill="outline" color="dark" onClick={() => history.push('/Businessman_signin')}>
                          Sign In Again
                        </IonButton>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                )}

                <div className="form-field">
                  <p>Promotion Title</p>
                  <IonInput 
                    placeholder="Weekend Special - 15% Off On Sneakers" 
                    className="styled-input"
                    value={promotionTitle}
                    onIonInput={(e) => setPromotionTitle(e.detail.value!)}
                    disabled={paymentSuccessful || isProcessing}
                  />
                </div>
                
                <div className="form-field">
                  <p>Promotion Message</p>
                  <IonTextarea 
                    placeholder="Enjoy 15% off all fresh pastries this weekend only! Valid Friday through Sunday. Don't miss these fresh-baked treats!" 
                    className="styled-input" 
                    rows={4}
                    value={promotionMessage}
                    onIonInput={(e) => setPromotionMessage(e.detail.value!)}
                    disabled={paymentSuccessful || isProcessing}
                  />
                  <small style={{ color: '#666', fontSize: '0.8em' }}>
                    {promotionMessage.length}/500 characters
                  </small>
                </div>

                <div className="form-field">
                  <p>Upload Promoted Image (PNG or JPG)</p>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg" 
                    onChange={handleImageSelect}
                    disabled={paymentSuccessful || isProcessing}
                  />
                  {selectedImage && (
                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                      <small>
                        <IonIcon icon={checkmarkCircleOutline} color="success" /> 
                        {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                      </small>
                    </div>
                  )}
                </div>

                {/* Preview */}
                {(promotionTitle || promotionMessage || selectedImage) && (
                  <div className="form-field">
                    <p>Preview</p>
                    <IonCard color="light">
                      <IonCardContent>
                        <h3 style={{ margin: '0 0 8px 0' }}>
                          {promotionTitle || "Your promotion title will appear here"}
                        </h3>
                        <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}>
                          {promotionMessage || "Your promotion message will be displayed here..."}
                        </p>
                        {selectedImage && (
                          <small style={{ color: 'green', marginTop: '8px', display: 'block' }}>
                            <IonIcon icon={imageOutline} /> Image will be attached
                          </small>
                        )}
                      </IonCardContent>
                    </IonCard>
                  </div>
                )}

                {!paymentSuccessful ? (
                  <IonButton 
                    className='business-craete-button-pramotion'
                    onClick={handleInitiatePayment}
                    disabled={isProcessing || !isFormValid}
                    expand="block"
                  >
                    {isProcessing ? (
                      <>
                        <IonIcon icon={createOutline} slot="start" />
                        Redirecting to Payment...
                      </>
                    ) : (
                      <>
                        <IonIcon icon={createOutline} slot="start" />
                        Pay Create Promotion
                      </>
                    )}
                  </IonButton>
                ) : (
                  <IonButton 
                    className='business-craete-button-pramotion'
                    onClick={handleCreatePromotion}
                    disabled={isProcessing}
                    expand="block"
                    color="success"
                  >
                    {isProcessing ? (
                      'Creating Promotion...'
                    ) : (
                      <>
                        <IonIcon icon={checkmarkCircleOutline} slot="start" />
                        Create Promotion
                      </>
                    )}
                  </IonButton>
                )}
              </div>
            </IonSegmentContent>
            <IonSegmentContent id="second">
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <IonIcon icon={analyticsOutline} size="large" color="medium" />
                <p>No ongoing promotions</p>
                <small>Your active promotions will appear here</small>
              </div>
            </IonSegmentContent>
          </IonSegmentView>
        </div>
        <br /><br />

        {/* Loading overlay */}
        <IonLoading
          isOpen={isProcessing}
          message={'Processing...'}
        />

        {/* Alert for messages */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Notice'}
          message={alertMessage}
          buttons={['OK']}
        />
       
      </IonContent>

    <IonFooter className='business-home-footer'>
      <div className="business-home-footer-navebar">
          <IonRouterLink href='/Businessman_Home'>
            <div className="business-home-footer-item">
              <IonIcon icon={homeOutline} className='business-home-footer-icon'style={{ color: isActive('/') ? 'blue' : 'black' }}></IonIcon>
              <span className='business-home-footer-text'style={{ color: isActive('/Businessman_Home') ? 'blue' : 'black' }}>Home</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/Businessman_inventory'>
            <div className="business-home-footer-item">
              <IonIcon icon={cartOutline} className='business-home-footer-icon'style={{ color: isActive('/') ? 'blue' : 'black' }}></IonIcon>
              <span className='business-home-footer-text'style={{ color: isActive('/Businessman_inventory') ? 'blue' : 'black' }}>Inventory</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/Businessman_billing'>
            <div className="business-home-footer-item">
              <IonIcon icon={newspaperOutline} className='business-home-footer-icon'style={{ color: isActive('/') ? 'blue' : 'black' }}></IonIcon>
              <span className='business-home-footer-text'style={{ color: isActive('/Businessman_billing') ? 'blue' : 'black' }}>Billing</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/Businessman_account'>
            <div className="business-home-footer-item"style={{ color: isActive('/Businessman_account') ? 'blue' : 'black' }}>
              <IonIcon icon={personCircleOutline} className='business-home-footer-account-icon'></IonIcon>
              <span className='business-home-footer-account-text'style={{ color: isActive('/') ? 'blue' : 'red' }}>Account</span>
            </div>
          </IonRouterLink>
      </div>
    </IonFooter>
    </IonPage>
  );
};

export default Businessman_Home1;