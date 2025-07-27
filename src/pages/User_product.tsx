import React, { useEffect, useState } from 'react';

// Define TypeScript interfaces for better type safety
interface Product {
  id?: string | number;
  name?: string;
  price?: number;
  image?: string;
  rating?: number;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const ProductStore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'products' | 'cart'>('products');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Custom SVG Icons
  const ShoppingCartIcon = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
      <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z"/>
    </svg>
  );

  const PlusIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
    </svg>
  );

  const MinusIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 13H5V11H19V13Z"/>
    </svg>
  );

  const StarIcon = () => (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  );

  const PhoneIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"/>
    </svg>
  );

  const StoreIcon = () => (
    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7V10C2 11.1 2.9 12 4 12S6 11.1 6 10V18H4V20H20V18H18V10C18 11.1 19.1 12 20 12S22 11.1 22 10V7L12 2ZM8 18V10.85C8.3 10.95 8.64 11 9 11S9.7 10.95 10 10.85V18H8ZM12 18V10.85C12.3 10.95 12.64 11 13 11S13.7 10.95 14 10.85V18H12ZM16 18V10.85C16.3 10.95 16.64 11 17 11S17.7 10.95 18 10.85V18H16Z"/>
    </svg>
  );

  const ArrowLeftIcon = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"/>
    </svg>
  );

  const TrashIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"/>
    </svg>
  );

  useEffect(() => {
    const storedShopId = sessionStorage.getItem('selectedShopId');
    const storedPhone = sessionStorage.getItem('shopkeeperPhone');
    setShopId(storedShopId);
    setPhone(storedPhone);

    if (!storedShopId) {
      setLoading(false);
      return;
    }

    // Fetch products from your API
    fetch(`http://localhost:3000/shop/shop/${storedShopId}/products`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched Products:', data);
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Load cart from localStorage
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
    }
  }, []);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let updatedCart: CartItem[];
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(updatedCart);
    try {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const updateQuantity = (id: string | number, change: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null);
    
    setCart(updatedCart);
    try {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const removeFromCart = (id: string | number) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    try {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const sendWhatsAppMessage = (phone: string, orderDetails: string) => {
    const message = `🛒 New Order Received!\n\n${orderDetails}\n\nThank you for using our app.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank'); // Opens WhatsApp in a new tab
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Format order details
    const orderDetails = cart.map(item => 
      `📦 ${item.name || 'Unknown Product'}\n   Quantity: ${item.quantity}\n   Price: ₹${item.price || 0} each\n   Total: ₹${((item.price || 0) * item.quantity).toFixed(2)}`
    ).join('\n\n');

    const totalAmount = getTotalPrice();
    const finalMessage = `${orderDetails}\n\n💰 Grand Total: ₹${totalAmount.toFixed(2)}\n📍 Shop: ${shopId}\n\n🌟 Please rate our service and share your experience!`;

    // Clean phone number (remove any spaces, dashes, or special characters except +)
    const cleanPhone = phone ? phone.replace(/[\s-()]/g, '') : '';
    
    if (cleanPhone) {
      sendWhatsAppMessage(cleanPhone, finalMessage);
      
      // Clear cart after successful order
      setCart([]);
      try {
        localStorage.removeItem('cart');
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
      
      // Show success message
      setTimeout(() => {
        alert('Order sent successfully! 🎉\n\nYour order has been sent to the shopkeeper via WhatsApp. You will be contacted soon for confirmation and delivery details.');
      }, 1000);
      
      // Redirect to products page
      setTimeout(() => {
        setCurrentPage('products');
      }, 2000);
    } else {
      alert('❌ Unable to send order!\n\nShopkeeper phone number is not available. Please contact the shop directly.');
    }
  };

  const ProductsPage = () => (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '16px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <StoreIcon />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '36px', 
                  fontWeight: 'bold', 
                  color: 'white', 
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  Shop {shopId || 'Loading...'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                  {phone && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      backdropFilter: 'blur(5px)'
                    }}>
                      <PhoneIcon />
                      <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>{phone}</span>
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(255, 255, 255, 0.9)',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      🌟 Premium Quality Products
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Search Bar */}
              <div style={{
                position: 'relative',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '25px',
                padding: '12px 20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                minWidth: '250px'
              }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'white',
                    width: '100%',
                    fontSize: '14px'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  🔍
                </div>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setCurrentPage('cart')}
                style={{
                  position: 'relative',
                  background: 'linear-gradient(145deg, #ff6b6b, #ee5a52)',
                  color: 'white',
                  padding: '16px 28px',
                  borderRadius: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 8px 25px rgba(238, 90, 82, 0.4)',
                  fontSize: '16px',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)',
                  transform: 'scale(1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #ff5252, #e53e3e)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(238, 90, 82, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #ff6b6b, #ee5a52)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(238, 90, 82, 0.4)';
                }}
              >
                <ShoppingCartIcon />
                <span>My Cart</span>
                {getTotalItems() > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'linear-gradient(145deg, #ffd93d, #ff6b35)',
                    color: '#333',
                    fontSize: '12px',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(255, 217, 61, 0.4)',
                    animation: 'bounce 2s infinite'
                  }}>
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Debug Info - Remove this in production */}
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 1000,
            fontFamily: 'monospace'
          }}>
            
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginTop: '24px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{products.length}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Products</div>
            </div>
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>⚡</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Fast Delivery</div>
            </div>
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>🔒</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Secure Payment</div>
            </div>
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>📞</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>24/7 Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '256px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '2px solid #4f46e5',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : products.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {products.map((product, index) => (
              <div
                key={product.id || index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  target.style.transform = 'translateY(-4px)';
                  target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={product.name || 'Product'}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  {product.rating !== undefined && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <StarIcon />
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>{product.rating}</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4'
                  }}>
                    {product.name || 'Product Name'}
                  </h3>

                  {product.description && (
                    <p style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      margin: '0 0 12px 0',
                      lineHeight: '1.5'
                    }}>
                      {product.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      {product.price !== undefined && (
                        <span style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#059669'
                        }}>
                          ₹{product.price}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.backgroundColor = '#059669';
                      }}
                      onMouseOut={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.backgroundColor = '#10b981';
                      }}
                    >
                      <PlusIcon />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 16px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <StoreIcon />
            <p style={{ fontSize: '18px', color: '#6b7280', margin: '16px 0 0 0' }}>No products found.</p>
          </div>
        )}
      </div>
    </div>
  );

  const CartPage = () => (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setCurrentPage('products')}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowLeftIcon />
              </button>
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Shopping Cart
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: '#6b7280' }}>Total Items: {getTotalItems()}</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                ₹{getTotalPrice().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {cart.length > 0 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                <img
                  src={item.image || 'https://via.placeholder.com/100x100?text=No+Image'}
                  alt={item.name || 'Product'}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                />

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                    {item.name || 'Unknown Product'}
                  </h3>
                  <p style={{ color: '#059669', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                    ₹{item.price || 0}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <MinusIcon />
                  </button>

                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    minWidth: '40px',
                    textAlign: 'center'
                  }}>
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <PlusIcon />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px',
                      cursor: 'pointer',
                      marginLeft: '12px'
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    ₹{((item.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            {/* Checkout Button */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                style={{
                  background: 'linear-gradient(145deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s',
                  transform: 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  margin: '0 auto'
                }}
                onMouseOver={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.transform = 'scale(1.05)';
                  target.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.6)';
                }}
                onMouseOut={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.transform = 'scale(1)';
                  target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                }}
                onClick={handleCheckout}
              >
                <span style={{ fontSize: '20px' }}>📱</span>
                <span>Send Order via WhatsApp - ₹{getTotalPrice().toFixed(2)}</span>
              </button>
              
              {/* Rating Section */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#374151',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  📝 Rate Your Shopping Experience
                </h3>
                <p style={{ 
                  margin: '0 0 16px 0', 
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  Your feedback helps us improve our service
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '28px',
                        cursor: 'pointer',
                        color: '#fbbf24',
                        transition: 'transform 0.2s'
                      }}
                      onMouseOver={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.transform = 'scale(1.2)';
                      }}
                      onMouseOut={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.transform = 'scale(1)';
                      }}
                      onClick={() => {
                        const ratingMessage = `⭐ Shop Rating: ${star}/5 stars\n\n🏪 Shop: ${shopId}\n📞 Phone: ${phone}\n\nThank you for rating our service! Your feedback is valuable to us. 😊`;
                        const cleanPhone = phone ? phone.replace(/[\s-()]/g, '') : '';
                        if (cleanPhone) {
                          sendWhatsAppMessage(cleanPhone, ratingMessage);
                          alert(`Thank you for rating us ${star} star${star > 1 ? 's' : ''}! 🌟\n\nYour rating has been sent to the shopkeeper.`);
                        }
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p style={{ 
                  margin: 0, 
                  color: '#9ca3af',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  Click on stars to rate and send feedback via WhatsApp
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 16px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <ShoppingCartIcon />
            <p style={{ fontSize: '18px', color: '#6b7280', margin: '16px 0 0 0' }}>Your cart is empty.</p>
            <button
              onClick={() => setCurrentPage('products')}
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                marginTop: '16px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        `}
      </style>
      {currentPage === 'products' ? <ProductsPage /> : <CartPage />}
    </>
  );
};

export default ProductStore;