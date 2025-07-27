import React, { useEffect, useState } from 'react';
import { useIonRouter } from "@ionic/react";
import axios from 'axios';
import { 
  IonIcon 
} from '@ionic/react';
import { 
  location, 
  call, 
  star, 
  time, 
  storefront, 
  chevronForward, 
  search 
} from 'ionicons/icons';

const User_shop = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const ionroute = useIonRouter();

  useEffect(() => {
    axios.get('http://localhost:3000/shop/shopsData')
      .then(res => {
        setShops(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  
  const handleShopClick = (shopId: number, shopkeeperPhone: string) => {
    
    sessionStorage.setItem('selectedShopId', shopId.toString());
    sessionStorage.setItem('shopkeeperPhone', shopkeeperPhone);

    
    ionroute.push('/User_product', 'forward');
  };

  


  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '';
    }
  };

  const isShopOpen = (opens: string, closes: string) => {
    if (!opens || !closes) return null;
    try {
      const now = new Date();
      const openTime = new Date(opens);
      const closeTime = new Date(closes);
      
      const currentTime = new Date();
      currentTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
      
      openTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
      closeTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
      
      return currentTime >= openTime && currentTime <= closeTime;
    } catch {
      return null;
    }
  };

  const filteredShops = shops.filter((shop: any) =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (shop.tagline && shop.tagline.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (shop.localArea && shop.localArea.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const ShopCard = ({ shop }: { shop: any }) => {
    const shopOpen = isShopOpen(shop.opens, shop.closes);
    
    return (
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
          transition: 'all 0.3s ease',
          transform: 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        }}
        onClick={() => handleShopClick(shop.id, shop.owner?.phone || '')}
      >
        {/* Shop Image Section */}
        <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
          {shop.image ? (
            <img
              src={shop.image}
              alt={shop.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IonIcon icon={storefront} style={{ fontSize: '48px', color: 'white', opacity: 0.7 }} />
            </div>
          )}
          
          {/* Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
          }} />
          
          {/* Status Badges */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            gap: '8px'
          }}>
            {shop.isActive && (
              <span style={{
                padding: '4px 8px',
                background: '#10b981',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600',
                borderRadius: '12px'
              }}>
                Active
              </span>
            )}
            {shopOpen !== null && (
              <span style={{
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: '600',
                borderRadius: '12px',
                background: shopOpen ? '#dcfce7' : '#fee2e2',
                color: shopOpen ? '#166534' : '#991b1b',
                border: shopOpen ? '1px solid #bbf7d0' : '1px solid #fecaca'
              }}>
                {shopOpen ? 'Open' : 'Closed'}
              </span>
            )}
          </div>

          {/* Arrow Icon */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            opacity: 0,
            transition: 'opacity 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <IonIcon icon={chevronForward} style={{ fontSize: '16px', color: '#374151' }} />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '16px' }}>
          {/* Shop Name */}
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px',
            transition: 'color 0.3s ease',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {shop.name}
          </h2>

          {/* Category/Tagline */}
          {shop.tagline && (
            <p style={{
              fontSize: '14px',
              color: '#2563eb',
              fontWeight: '500',
              marginBottom: '8px',
              textTransform: 'capitalize'
            }}>
              {shop.tagline}
            </p>
          )}

          {/* Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => (
                <IonIcon 
                  key={i} 
                  icon={star}
                  style={{
                    fontSize: '12px',
                    color: i < Math.floor(shop.rating || 0) ? '#fbbf24' : '#d1d5db'
                  }}
                />
              ))}
            </div>
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              marginLeft: '4px'
            }}>
              {shop.rating ? shop.rating.toFixed(1) : '0.0'}
            </span>
            <span style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              ({shop.rating ? 'Rated' : 'New'})
            </span>
          </div>

          {/* Location */}
          {(shop.localArea || shop.pin) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              <IonIcon icon={location} style={{ fontSize: '12px', color: '#ef4444', flexShrink: 0 }} />
              <span style={{
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {shop.localArea}{shop.localArea && shop.pin && ', '}{shop.pin}
              </span>
            </div>
          )}

          {/* Phone */}
          {shop.owner?.phone && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              <IonIcon icon={call} style={{ fontSize: '12px', color: '#10b981', flexShrink: 0 }} />
              <span style={{ fontSize: '12px' }}>
                {shop.owner.phone}
              </span>
            </div>
          )}

          {/* Shop Hours */}
          {(shop.opens || shop.closes) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#6b7280',
              marginBottom: '12px'
            }}>
              <IonIcon icon={time} style={{ fontSize: '12px', color: '#3b82f6', flexShrink: 0 }} />
              <span style={{ fontSize: '12px' }}>
                {formatTime(shop.opens)} - {formatTime(shop.closes)}
              </span>
            </div>
          )}

          {/* Bottom Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px',
            borderTop: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {shop.owner?.name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  margin: 0
                }}>
                  {shop.owner?.name || 'Shop Owner'}
                </p>
                {shop.coinValue && (
                  <p style={{
                    fontSize: '10px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    
                  </p>
                )}
              </div>
            </div>
            
            <div style={{
              padding: '4px 8px',
              background: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #dbeafe'
            }}>
              <span style={{
                fontSize: '10px',
                color: '#1d4ed8',
                fontWeight: '500'
              }}>
                View Products
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      border: '1px solid #f0f0f0'
    }}>
      <div style={{
        height: '160px',
        background: '#f3f4f6',
        animation: 'pulse 2s infinite'
      }} />
      <div style={{ padding: '16px' }}>
        <div style={{
          height: '20px',
          background: '#f3f4f6',
          borderRadius: '4px',
          marginBottom: '8px',
          animation: 'pulse 2s infinite'
        }} />
        <div style={{
          height: '16px',
          background: '#f3f4f6',
          borderRadius: '4px',
          marginBottom: '12px',
          width: '75%',
          animation: 'pulse 2s infinite'
        }} />
        <div style={{
          height: '12px',
          background: '#f3f4f6',
          borderRadius: '4px',
          marginBottom: '8px',
          width: '50%',
          animation: 'pulse 2s infinite'
        }} />
        <div style={{
          height: '12px',
          background: '#f3f4f6',
          borderRadius: '4px',
          width: '60%',
          animation: 'pulse 2s infinite'
        }} />
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 16px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px',
                margin: 0
              }}>
                Discover Local Shops
              </h1>
              <p style={{
                color: '#6b7280',
                margin: 0
              }}>
                Find amazing shops in your neighborhood
              </p>
            </div>

            {/* Search Bar */}
            <div style={{
              position: 'relative',
              maxWidth: '400px',
              width: '100%'
            }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}>
                <IonIcon icon={search} style={{ fontSize: '20px', color: '#9ca3af' }} />
              </div>
              <input
                type="text"
                placeholder="Search shops, categories, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '44px',
                  paddingRight: '12px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  background: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div style={{
            textAlign: 'center',
            paddingTop: '80px',
            paddingBottom: '80px'
          }}>
            <IonIcon icon={storefront} style={{ fontSize: '64px', color: '#9ca3af', margin: '0 auto 16px' }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              {searchTerm ? 'No shops found' : 'No shops available'}
            </h3>
            <p style={{ color: '#9ca3af' }}>
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Check back later for new shops'}
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              {/* <p style={{ color: '#6b7280', margin: 0 }}>
                Showing {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''}
                {searchTerm && ` for "${searchTerm}"`}
              </p> */}
            </div>

            {/* Shop Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {filteredShops.map((shop: any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
};

export default User_shop;