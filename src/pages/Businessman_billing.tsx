import React, { useState, useEffect } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon,
  IonFooter, IonRouterLink, IonLabel, IonInput, IonToggle, IonItem, IonText,
  IonSearchbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonGrid, IonRow, IonCol, IonList, IonItemSliding, IonItemOptions,
  IonItemOption, IonAlert, IonLoading, IonModal, IonButtons, IonCheckbox
} from '@ionic/react';
import {
  addOutline, menuOutline, closeOutline, newspaperOutline, cartOutline,
  personCircleOutline, homeOutline, removeOutline, printOutline, searchOutline,
  serverOutline
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './Businessman_billing.css';



const Businessman_billing: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  
  // Product and billing states
  const [products, setProducts] = useState<any[]>([]);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  
  // Manual entry states
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [manualTax, setManualTax] = useState<number>(0);
  
  // Customer details states
  const [customerName, setCustomerName] = useState('');
  const [customerUsername, setCustomerUsername] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Modal and alert states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const isActive = (path: string) => location.pathname === path;
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Authentication and initialization
  useEffect(() => {
    const storedShopId = localStorage.getItem('shopId');
    const storedOwnerId = localStorage.getItem('ownerId');
    
    if (!storedShopId || !storedOwnerId) {
      history.push('Businessman_signin');
      return;
    }
    
    setShopId(parseInt(storedShopId));
    setOwnerId(parseInt(storedOwnerId));
    fetchProducts(parseInt(storedShopId));
  }, []);

  // Fetch products from API
  const fetchProducts = async (shopId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/shop/${shopId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
        showAlertMessage('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showAlertMessage('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to bill
  const addToBill = (product: any) => {
    const existingItem = billItems.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.billQuantity < product.quantity) {
        setBillItems(billItems.map(item =>
          item.id === product.id
            ? { ...item, billQuantity: item.billQuantity + 1 }
            : item
        ));
      } else {
        showAlertMessage('Cannot add more items than available in stock');
      }
    } else {
      if (product.quantity > 0) {
        setBillItems([...billItems, { ...product, billQuantity: 1 }]);
      } else {
        showAlertMessage('Product is out of stock');
      }
    }
  };

  // Remove product from bill
  const removeFromBill = (productId: number) => {
    const existingItem = billItems.find(item => item.id === productId);
    
    if (existingItem && existingItem.billQuantity > 1) {
      setBillItems(billItems.map(item =>
        item.id === productId
          ? { ...item, billQuantity: item.billQuantity - 1 }
          : item
      ));
    } else {
      setBillItems(billItems.filter(item => item.id !== productId));
    }
  };

  // Calculate totals
  const subTotal = billItems.reduce((total, item) => total + (item.price * item.billQuantity), 0);
  const totalWithTax = isManualEntry ? manualAmount + manualTax : subTotal;

  // Show alert message
  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Update database
  const updateDatabase = async () => {
    if (billItems.length === 0 && !isManualEntry) {
      showAlertMessage('No items in bill to update');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/shop/${shopId}/update-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: billItems.map(item => ({
            productId: item.id,
            quantity: item.billQuantity
          })),
          ownerId: ownerId
        }),
      });

      if (response.ok) {
        showAlertMessage('Database updated successfully!');
        fetchProducts(shopId!);
        setBillItems([]);
      } else {
        showAlertMessage('Failed to update database');
      }
    } catch (error) {
      console.error('Error updating database:', error);
      showAlertMessage('Error updating database');
    } finally {
      setLoading(false);
    }
  };

  // Print bill
  const printBill = async () => {
    if (billItems.length === 0 && !isManualEntry) {
      showAlertMessage('No items in bill to print');
      return;
    }

    if (!isManualEntry) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/shop/${shopId}/update-inventory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: billItems.map(item => ({
              productId: item.id,
              quantity: item.billQuantity
            })),
            ownerId: ownerId
          }),
        });

        if (response.ok) {
          handleActualPrint();
          fetchProducts(shopId!);
          setBillItems([]);
        } else {
          showAlertMessage('Failed to update database. Cannot print bill.');
        }
      } catch (error) {
        console.error('Error processing bill:', error);
        showAlertMessage('Error processing bill');
      } finally {
        setLoading(false);
      }
    } else {
      handleActualPrint();
      setManualAmount(0);
      setManualTax(0);
    }
  };

  const handleActualPrint = () => {
    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .bill-header { text-align: center; margin-bottom: 20px; }
            .bill-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .bill-info { font-size: 14px; color: #666; margin-bottom: 5px; }
            .customer-info { margin-bottom: 20px; }
            .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .bill-table th, .bill-table td { 
              padding: 8px; 
              text-align: left; 
              border-bottom: 1px solid #ddd; 
            }
            .bill-table th { background-color: #f5f5f5; font-weight: bold; }
            .bill-total { 
              font-size: 18px; 
              font-weight: bold; 
              text-align: right; 
              margin-top: 20px; 
              padding-top: 10px;
              border-top: 2px solid #333;
            }
            .bill-footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="bill-header">
            <div class="bill-title">SHOP BILL</div>
            <div class="bill-info">Date: ${new Date().toLocaleDateString()}</div>
            <div class="bill-info">Time: ${new Date().toLocaleTimeString()}</div>
          </div>
          
          <div class="customer-info">
            <p><strong>Customer Name:</strong> ${customerName || 'N/A'}</p>
            <p><strong>Username:</strong> ${customerUsername || 'N/A'}</p>
            <p><strong>Phone:</strong> ${customerPhone || 'N/A'}</p>
          </div>
          
          ${!isManualEntry ? `
            <table class="bill-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${billItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.billQuantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.billQuantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div style="margin: 20px 0;">
              <p><strong>Manual Entry</strong></p>
              <p>Amount: ₹${manualAmount}</p>
              <p>Tax: ₹${manualTax}</p>
            </div>
          `}
          
          <div class="bill-total">
            TOTAL: ₹${totalWithTax.toFixed(2)}
          </div>
          
          <div class="bill-footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <IonPage>
      <IonHeader className='businessman-billing-header'>
        <div className="business-billing-header-content">
          <div className="business-billing-left-header">
            {!isSidebarOpen && (
              <div className="buinessman-billing-hamburger-menushop" onClick={toggleSidebar}>
                <IonIcon icon={menuOutline} className="businessman-billing-menu-iconshop" />
              </div>
            )}
            <div className="billing-inventory-name">BILLING</div>
          </div>
          <div className="businessman-billing-right-header">
            <IonButton fill="clear" onClick={() => setShowProductModal(true)}>
              <IonIcon icon={addOutline} className='add-product-in-bill-formate' />
            </IonButton>
          </div>
        </div>
        <div className={`businessman-billing-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="businessman-billing-sidebar-close" onClick={closeSidebar}>
            <IonIcon icon={closeOutline} className="close-icon" />
          </div>
          <ul className="businessman-billing-sidebar-list">
            <li onClick={() => history.push('/category')}>Category</li>
            <li onClick={() => history.push('/mycart')}>Mycart</li>
            <li onClick={() => history.push('/wallet')}>Wallet</li>
            <li onClick={() => history.push('/profile')}>Profile</li>
            <li onClick={() => history.push('/logout')} className='businessman-billing-signuplogout' style={{color:'blue'}}>Log Out</li>
          </ul>
        </div>
      </IonHeader>

      <IonContent fullscreen className='businessman-billing'>
        {/* Customer Details Form */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Customer Details</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Name</IonLabel>
              <IonInput 
                value={customerName}
                onIonChange={e => setCustomerName(e.detail.value!)}
                placeholder="Enter customer name"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Username</IonLabel>
              <IonInput 
                value={customerUsername}
                onIonChange={e => setCustomerUsername(e.detail.value!)}
                placeholder="Enter username"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Phone Number</IonLabel>
              <IonInput 
                value={customerPhone}
                onIonChange={e => setCustomerPhone(e.detail.value!)}
                placeholder="Enter phone number"
                type="tel"
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Manual Entry Toggle */}
        <IonCard>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel>Use Manual Entry Instead</IonLabel>
              <IonToggle
                slot="end"
                color="success"
                checked={isManualEntry}
                onIonChange={e => setIsManualEntry(e.detail.checked)}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Manual Entry Section */}
        {isManualEntry ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Manual Entry</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Total Amount</IonLabel>
                <IonInput 
                  type="number"
                  value={manualAmount}
                  onIonChange={e => setManualAmount(parseFloat(e.detail.value!) || 0)}
                  placeholder="0.00"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Taxes</IonLabel>
                <IonInput 
                  type="number"
                  value={manualTax}
                  onIonChange={e => setManualTax(parseFloat(e.detail.value!) || 0)}
                  placeholder="0.00"
                />
              </IonItem>
              <div style={{ marginTop: '20px' }}>
                <IonText color="primary">
                  <h2>Total: ₹{(manualAmount + manualTax).toFixed(2)}</h2>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        ) : (
          /* Product Billing Section */
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Bill Items ({billItems.length})
                <IonButton 
                  fill="clear" 
                  size="small" 
                  onClick={() => setShowProductModal(true)}
                >
                  <IonIcon icon={addOutline} /> Add Items
                </IonButton>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {billItems.length === 0 ? (
                <IonText color="medium">
                  <p>No items added yet. Click "Add Items" to select products.</p>
                </IonText>
              ) : (
                <IonList>
                  {billItems.map((item) => (
                    <IonItemSliding key={item.id}>
                      <IonItem>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3>{item.name}</h3>
                              <p>₹{item.price} each</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <IonButton 
                                fill="clear" 
                                size="small"
                                onClick={() => removeFromBill(item.id)}
                              >
                                <IonIcon icon={removeOutline} />
                              </IonButton>
                              <span>{item.billQuantity}</span>
                              <IonButton 
                                fill="clear" 
                                size="small"
                                onClick={() => addToBill(item)}
                                disabled={item.billQuantity >= item.quantity}
                              >
                                <IonIcon icon={addOutline} />
                              </IonButton>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', marginTop: '5px' }}>
                            <strong>₹{(item.price * item.billQuantity).toFixed(2)}</strong>
                          </div>
                        </div>
                      </IonItem>
                    </IonItemSliding>
                  ))}
                </IonList>
              )}
              
              {billItems.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                  <IonText color="primary">
                    <h2>Subtotal: ₹{subTotal.toFixed(2)}</h2>
                  </IonText>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        )}

        {/* Action Buttons */}
        {(billItems.length > 0 || isManualEntry) && (
          <IonCard>
            <IonCardContent>
              <IonButton 
                expand="block" 
                color="primary"
                onClick={updateDatabase}
                disabled={loading || isManualEntry}
              >
                <IonIcon icon={serverOutline} slot="start" />
                update db
                
              </IonButton>
              <IonButton 
                expand="block" 
                color="success"
                onClick={printBill}
                disabled={loading}
                style={{ marginTop: '10px' }}
              >
                <IonIcon icon={printOutline} slot="start" />
                Print Bill
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* Product Selection Modal */}
        <IonModal isOpen={showProductModal} onDidDismiss={() => setShowProductModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Select Products</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowProductModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonSearchbar
              value={searchTerm}
              onIonChange={e => setSearchTerm(e.detail.value!)}
              placeholder="Search products..."
            />
            
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <IonText>Loading products...</IonText>
              </div>
            ) : (
              <IonGrid>
                <IonRow>
                  {filteredProducts.map((product) => (
                    <IonCol size="12" sizeMd="6" key={product.id}>
                      <IonCard>
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                          />
                        )}
                        <IonCardContent>
                          <h3>{product.name}</h3>
                          <p>Price: ₹{product.price}</p>
                          <p>Available: {product.quantity}</p>
                          <IonButton 
                            expand="block"
                            onClick={() => addToBill(product)}
                            disabled={product.quantity === 0}
                          >
                            <IonIcon icon={addOutline} slot="start" />
                            Add to Bill
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            )}
          </IonContent>
        </IonModal>

        {/* Loading */}
        <IonLoading isOpen={loading} message="Processing..." />

        {/* Alert */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notice"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>

      <IonFooter className='business-billing-footer'>
        <div className="business-billing-footer-navebar">
          <IonRouterLink href='/Businessman_Home'>
            <div className="business-billing-footer-item">
              <IonIcon icon={homeOutline} className='business-billing-footer-icon' style={{ color: isActive('/Businessman_Home') ? 'blue' : 'black' }} />
              <span className='business-billing-footer-text' style={{ color: isActive('/Businessman_Home') ? 'blue' : 'black' }}>Home</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/Businessman_inventory'>
            <div className="business-billing-footer-item">
              <IonIcon icon={cartOutline} className='business-billing-footer-icon' style={{ color: isActive('/Businessman_inventory') ? 'blue' : 'black' }} />
              <span className='business-billing-footer-text' style={{ color: isActive('/Businessman_inventory') ? 'blue' : 'black' }}>Inventory</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/Businessman_billing'>
            <div className="business-billing-footer-item">
              <IonIcon icon={newspaperOutline} className='business-billing-footer-icon' style={{ color: isActive('/Businessman_billing') ? 'blue' : 'black' }} />
              <span className='business-billing-footer-text' style={{ color: isActive('/Businessman_billing') ? 'blue' : 'black' }}>Billing</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/Businessman_account'>
            <div className="business-billing-footer-item">
              <IonIcon icon={personCircleOutline} className='business-billing-footer-account-icon' style={{ color: isActive('/Businessman_account') ? 'blue' : 'black' }} />
              <span className='business-billing-footer-account-text' style={{ color: isActive('/Businessman_account') ? 'blue' : 'black' }}>Account</span>
            </div>
          </IonRouterLink>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default Businessman_billing;