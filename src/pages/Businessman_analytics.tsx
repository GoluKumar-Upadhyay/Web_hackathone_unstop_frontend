import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { useIonRouter } from '@ionic/react';
import { chevronBackOutline, trendingUpOutline, cubeOutline, cartOutline, ellipseOutline, leafOutline, arrowBackOutline } from 'ionicons/icons';
import './Businessman_analytics.css';

const Businessman_analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const ionrouter = useIonRouter();
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState(1);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Get shopId from localStorage (assuming it's stored there)
      const shopId = localStorage.getItem('shopId');
      if (!shopId) {
        setFound(0);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:3000/shop/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopId: parseInt(shopId) }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (found === 0) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div 
          onClick={() => ionrouter.push("/Businessman_signin")}
          style={{
            backgroundColor: '#3b82f6', 
            padding: '1rem',
            borderRadius: '1rem',
            cursor: 'pointer'
          }}
        >
          <p style={{
            fontSize: '1.875rem', 
            fontWeight: 500,
            color: '#fbbf24' 
          }}>
            Signin
          </p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb', // gray-50
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            margin: '0 auto',
            height: '8rem',
            width: '8rem',
            borderRadius: '9999px',
            borderBottom: '2px solid #2563eb', // blue-600
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            marginTop: '1rem',
            color: '#4b5563' // gray-600
          }}>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            color: '#ef4444', // red-500
            marginBottom: '1rem'
          }}>
            
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1f2937', // gray-800
            marginBottom: '0.5rem'
          }}>
            Error Loading Analytics
          </h2>
          <p style={{
            color: '#4b5563', // gray-600
            marginBottom: '1rem'
          }}>
            {error}
          </p>
          <button
            onClick={fetchAnalytics}
            style={{
              backgroundColor: '#2563eb', // blue-600
              color: '#fff',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'} // blue-700
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <p>No data available</p>
      </div>
    );
  }

  const { shop, summary, topSellingProducts, coinTransactions, dailyOrdersChart } = analyticsData;

  const BORDER_COLORS = ['blue-border', 'yellow-border', 'green-border', 'red-border', 'purple-border'];

 
  const topFiveProducts = topSellingProducts?.slice(0, 5) || [];

  return (
    <IonPage>
      <IonHeader className='businessman_analytics-add-header'>
        <div className="businessman_analytics-add-header-content">
          <div className="businessman_analytics-add-left-header">
            <IonButton fill='clear' routerLink='Businessman_Home'>
              <IonIcon icon={arrowBackOutline} className='businessman_analytics-add-header-outline' />
            </IonButton>
          </div>
          <div className="businessman_analytics-add-right-header"></div>
        </div>
      </IonHeader>

      <IonContent fullscreen className='businessman_analytics-page'>
      <h1 className="businessman_analytics-head-part">
          Business Analytics
        </h1>

        <div className="businessman_analytics-card-container">
        
          <IonCard className="businessman_analytics-card">
            <IonCardHeader>
              <IonCardTitle>Total Revenue</IonCardTitle>
              <div className="businessman_analytics-card-content">
                ₹{summary?.totalRevenue?.toLocaleString() || 0}
                <div className="businessman_analytics-icon green">
                  <IonIcon icon={trendingUpOutline} />
                </div>
              </div>
            </IonCardHeader>
          </IonCard>

          <IonCard className="businessman_analytics-card">
            <IonCardHeader>
              <IonCardTitle>Products Sold</IonCardTitle>
              <div className="businessman_analytics-card-content">
                {summary?.totalProductsSold || 0}
                <div className="businessman_analytics-icon blue">
                  <IonIcon icon={cubeOutline} />
                </div>
              </div>
            </IonCardHeader>
          </IonCard>

          <IonCard className="businessman_analytics-card">
            <IonCardHeader>
              <IonCardTitle>Orders Accepted</IonCardTitle>
              <div className="businessman_analytics-card-content">
                {summary?.totalOrdersAccepted || 0}
                <div className="businessman_analytics-icon purple">
                  <IonIcon icon={cartOutline} />
                </div>
              </div>
            </IonCardHeader>
          </IonCard>

          <IonCard className="businessman_analytics-card">
            <IonCardHeader>
              <IonCardTitle>Coins Given</IonCardTitle>
              <div className="businessman_analytics-card-content">
                {summary?.totalCoinsGiven || 0}
                <div className="businessman_analytics-icon yellow">
                  <IonIcon icon={ellipseOutline} />
                </div>
              </div>
            </IonCardHeader>
          </IonCard>
        </div>

        <div className="businessman_analytics-top-products">
          <h2 className="businessman_analytics-top-products-title">Top Selling Products</h2>
          <div className="businessman_analytics-product-list">
            {topFiveProducts.length > 0 ? (
              topFiveProducts.map((product: any, index: number) => (
                <div key={index} className={`businessman_analytics-product-item ${BORDER_COLORS[index % BORDER_COLORS.length]}`}>
                  <span className="businessman_analytics-product-name">{product.productName}</span>
                  <span className="businessman_analytics-product-sold">{product.totalQuantitySold}</span>
                </div>
              ))
            ) : (
              <div className="businessman_analytics-product-item blue-border">
                <span className="businessman_analytics-product-name">No products found</span>
                <span className="businessman_analytics-product-sold">0</span>
              </div>
            )}
          </div>
        </div>
        <br /><br />

      </IonContent>
    </IonPage>
  );
};

export default Businessman_analytics;