
import React, { useEffect, useState, useRef } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon,
  IonFooter, IonRouterLink, IonItem, IonLabel, IonInput, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonAlert, IonLoading,
  IonFab, IonFabButton, IonModal, IonList, IonItemSliding, IonItemOptions,
  IonItemOption, IonImg, IonChip, IonBadge, IonRefresher, IonRefresherContent,
  IonToast
} from '@ionic/react';
import {
  cartOutline, menuOutline, closeOutline, addOutline, homeOutline, personCircleOutline,
  newspaperOutline, saveOutline, trashOutline, createOutline, checkmarkOutline,
  cloudUploadOutline, imageOutline, cameraOutline, documentTextOutline
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './Businessman_inventory.css';

// Backend URL configuration
const BACKEND_URL = "http://localhost:3000"; // Replace with your actual backend URL

// TypeScript interfaces
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  shopId: string;
}

interface BulkProduct {
  name: string;
  price: string;
  quantity: string;
  image?: File | null;
  imagePreview?: string | null;
}

interface EditForm {
  price: string;
  quantity: string;
}

interface AddForm {
  name: string;
  price: string;
  quantity: string;
}

const Businessman_inventory: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Product management states
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkAddForm, setShowBulkAddForm] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  // Form states
  const [editForm, setEditForm] = useState<EditForm>({ price: '', quantity: '' });
  const [addForm, setAddForm] = useState<AddForm>({ name: '', price: '', quantity: '' });
  const [bulkProducts, setBulkProducts] = useState<BulkProduct[]>([
    { name: '', price: '', quantity: '', image: null, imagePreview: null }
  ]);
  
  // Image upload states for single product add
  const [selectedAddImage, setSelectedAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('danger');
  
  // Get shopId from localStorage
  const shopId = localStorage.getItem("shopId");

  // Utility functions
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = (): void => {
    setIsSidebarOpen(false);
  };

  const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'danger'): void => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  // API Functions
  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BACKEND_URL}/shop/products/${shopId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent): Promise<void> => {
    await fetchProducts();
    event.detail.complete();
  };

  // Product management functions
  const handleEdit = (product: Product): void => {
    setEditingProduct(product.id);
    setEditForm({ 
      price: product.price.toString(), 
      quantity: product.quantity.toString() 
    });
  };

  const handleSaveEdit = async (productId: string): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/shop/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseInt(editForm.price),
          quantity: parseInt(editForm.quantity)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }
      
      const updatedProduct = await response.json();
      
      setProducts(products.map(p => 
        p.id === productId ? updatedProduct.product : p
      ));
      
      setEditingProduct(null);
      setEditForm({ price: '', quantity: '' });
      showToastMessage('Product updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message);
    }
  };

  const handleCancelEdit = (): void => {
    setEditingProduct(null);
    setEditForm({ price: '', quantity: '' });
  };

  const handleDeleteConfirm = (productId: string): void => {
    setProductToDelete(productId);
    setShowDeleteAlert(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (!productToDelete) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/shop/products/${productToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      
      setProducts(products.filter(p => p.id !== productToDelete));
      setShowDeleteAlert(false);
      setProductToDelete(null);
      showToastMessage('Product deleted successfully!', 'success');
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message);
    }
  };

  // Image upload functions
  const handleAddImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    
    if (file) {
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showToastMessage('Please select only image files (JPEG, PNG, etc.).');
        resetAddImageState();
        return;
      }
      
      if (file.size > maxSizeInBytes) {
        showToastMessage('File size must be less than 5MB. Please choose a smaller file.');
        resetAddImageState();
        return;
      }

      setSelectedAddImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAddImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      resetAddImageState();
    }
  };

  const resetAddImageState = (): void => {
    setSelectedAddImage(null);
    setAddImagePreview(null);
    if (addImageInputRef.current) {
      addImageInputRef.current.value = '';
    }
  };

  const handleAddProduct = async (): Promise<void> => {
    if (!addForm.name.trim() || !addForm.price || !addForm.quantity) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/shop/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name.trim(),
          price: parseInt(addForm.price),
          quantity: parseInt(addForm.quantity),
          shopId: shopId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }
      
      const newProduct = await response.json();
      
      // If there's an image, upload it
      if (selectedAddImage && newProduct.product?.id) {
        try {
          const formData = new FormData();
          formData.append('image', selectedAddImage);
          formData.append('productId', newProduct.product.id.toString());
          
          const imageResponse = await fetch(`${BACKEND_URL}/api/upload-item-image`, {
            method: 'POST',
            body: formData,
          });
          
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            newProduct.product.image = imageData.imageUrl;
          } else {
            console.warn('Failed to upload product image, but product was created');
          }
        } catch (imageError) {
          console.error('Error uploading product image:', imageError);
        }
      }
      
      setProducts([...products, newProduct.product]);
      resetAddForm();
      showToastMessage('Product added successfully!', 'success');
    } catch (err: any) {
      console.error('Error adding product:', err);
      setError(err.message);
    }
  };

  const resetAddForm = (): void => {
    setShowAddForm(false);
    setAddForm({ name: '', price: '', quantity: '' });
    resetAddImageState();
    setError(null);
  };

  // Bulk add functions
  const addBulkProductRow = (): void => {
    setBulkProducts([...bulkProducts, { name: '', price: '', quantity: '', image: null, imagePreview: null }]);
  };

  const removeBulkProductRow = (index: number): void => {
    if (bulkProducts.length > 1) {
      setBulkProducts(bulkProducts.filter((_, i) => i !== index));
    }
  };

  const updateBulkProduct = (index: number, field: keyof BulkProduct, value: string): void => {
    const updated = bulkProducts.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    );
    setBulkProducts(updated);
  };

  const handleBulkImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    
    if (file) {
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      
      if (!file.type.startsWith('image/')) {
        showToastMessage('Please select only image files (JPEG, PNG, etc.).');
        return;
      }
      
      if (file.size > maxSizeInBytes) {
        showToastMessage('File size must be less than 5MB. Please choose a smaller file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const updated = bulkProducts.map((product, i) => 
          i === index ? { 
            ...product, 
            image: file, 
            imagePreview: e.target?.result as string 
          } : product
        );
        setBulkProducts(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBulkImage = (index: number): void => {
    const updated = bulkProducts.map((product, i) => 
      i === index ? { ...product, image: null, imagePreview: null } : product
    );
    setBulkProducts(updated);
  };

  const handleBulkAddProducts = async (): Promise<void> => {
    const validProducts = bulkProducts.filter(product => 
      product.name.trim() && product.price && product.quantity
    );

    if (validProducts.length === 0) {
      setError('Please fill at least one complete product');
      return;
    }

    setBulkLoading(true);
    try {
      const productsToAdd = validProducts.map(product => ({
        name: product.name.trim(),
        price: parseInt(product.price),
        quantity: parseInt(product.quantity),
        shopId: shopId
      }));

      const response = await fetch(`${BACKEND_URL}/shop/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsToAdd })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add products');
      }
      
      const result = await response.json();
      
      // Upload images for products that have them
      const productsWithImages = validProducts.filter(p => p.image);
      
      if (productsWithImages.length > 0) {
        for (let i = 0; i < productsWithImages.length; i++) {
          const product = productsWithImages[i];
          const createdProduct = result.products[validProducts.indexOf(product)];
          
          if (product.image && createdProduct?.id) {
            try {
              const formData = new FormData();
              formData.append('image', product.image);
              formData.append('productId', createdProduct.id.toString());
              
              const imageResponse = await fetch(`${BACKEND_URL}/api/upload-item-image`, {
                method: 'POST',
                body: formData,
              });
              
              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                createdProduct.image = imageData.imageUrl;
              }
            } catch (imageError) {
              console.error('Error uploading product image:', imageError);
            }
          }
        }
      }
      
      setProducts([...products, ...result.products]);
      resetBulkForm();
      showToastMessage('Products added successfully!', 'success');
    } catch (err: any) {
      console.error('Error bulk adding products:', err);
      setError(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const resetBulkForm = (): void => {
    setShowBulkAddForm(false);
    setBulkProducts([{ name: '', price: '', quantity: '', image: null, imagePreview: null }]);
    setError(null);
  };

  // Effects
  useEffect(() => {
    if (shopId) {
      fetchProducts();
    }
  }, [shopId]);

  // Render guard for authentication
  if (!shopId) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <h2>Authentication Required</h2>
              <p>Please sign in to access your inventory.</p>
              <IonButton onClick={() => history.push('/Businessman_signin')}>
                Sign in again
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className='businessman-inventory-header'>
        <div className="business-inventory-header-content">
          <div className="business-inventory-left-header">
            {!isSidebarOpen && (
              <div className="buinessman-inventory-hamburger-menushop" onClick={toggleSidebar}>
                <IonIcon icon={menuOutline} className="businessman-inventory-menu-iconshop" />
              </div>
            )}
            <div className="inventory-name">INVENTORY</div>
          </div>
          <div className="businessman-inventory-right-header">
            <IonButton fill='clear' onClick={() => setShowAddForm(true)}>
              <IonIcon icon={addOutline} className="businessman-inventory-menu-iconshop" />
            </IonButton>
            <IonButton fill='clear' routerLink='Businessman_inventory_add'>
              <IonIcon icon={documentTextOutline} className='businessman-inventory-menu-iconshop' />
            </IonButton>
          </div>
        </div>
        
        <div className={`businessman-inventory-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="businessman-inventory-sidebar-close" onClick={closeSidebar}>
            <IonIcon icon={closeOutline} className="close-icon" />
          </div>
          <ul className="businessman-inventory-sidebar-list">
            <li onClick={() => history.push('/Businessman_iventory')}>Category</li>
            <li onClick={() => history.push('/Businessman_account')}>Mycart</li>
            <li onClick={() => history.push('/Businessman_order')}>Wallet</li>
            <li onClick={() => history.push('/Businessman_history')}>Profile</li>
          </ul>
        </div>
      </IonHeader>

      <IonContent fullscreen className='businessman-inventory'>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Pull to refresh" refreshingText="Refreshing..." />
        </IonRefresher>

        {/* Error Display */}
        {error && (
          <IonCard color="danger">
            <IonCardContent>
              <p>{error}</p>
              <IonButton fill="clear" onClick={() => setError(null)}>Dismiss</IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* Loading States */}
        <IonLoading isOpen={loading} message="Loading inventory..." />
        <IonLoading isOpen={bulkLoading} message="Adding products..." />

        {/* Products Grid */}
        <IonGrid>
          <IonRow>
            {products.map((product) => (
              <IonCol size="12" sizeMd="6" sizeLg="4" key={product.id}>
                <IonCard>
                  {/* Product Image */}
                  <div style={{ 
                    height: '200px', 
                    backgroundColor: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {product.image ? (
                      <IonImg 
                        src={product.image} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#666' }}>
                        <IonIcon icon={imageOutline} style={{ fontSize: '48px' }} />
                        <p>No image</p>
                      </div>
                    )}
                  </div>

                  <IonCardHeader>
                    <IonCardTitle>{product.name}</IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent>
                    {editingProduct === product.id ? (
                      <div>
                        <IonItem>
                          <IonLabel position="stacked">Price (₹)</IonLabel>
                          <IonInput
                            type="number"
                            value={editForm.price}
                            onIonInput={(e) => setEditForm({ ...editForm, price: e.detail.value! })}
                          />
                        </IonItem>
                        <IonItem>
                          <IonLabel position="stacked">Quantity</IonLabel>
                          <IonInput
                            type="number"
                            value={editForm.quantity}
                            onIonInput={(e) => setEditForm({ ...editForm, quantity: e.detail.value! })}
                          />
                        </IonItem>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                          <IonButton expand="block" onClick={() => handleSaveEdit(product.id)}>
                            <IonIcon icon={saveOutline} slot="start" />
                            Save
                          </IonButton>
                          <IonButton expand="block" fill="outline" onClick={handleCancelEdit}>
                            <IonIcon icon={closeOutline} slot="start" />
                            Cancel
                          </IonButton>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>Price:</span>
                          <IonChip color="success">₹{product.price}</IonChip>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <span>Quantity:</span>
                          <IonBadge color={product.quantity < 10 ? 'danger' : 'primary'}>
                            {product.quantity}
                          </IonBadge>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <IonButton expand="block" onClick={() => handleEdit(product)}>
                            <IonIcon icon={createOutline} slot="start" />
                            Edit
                          </IonButton>
                          <IonButton expand="block" color="danger" onClick={() => handleDeleteConfirm(product.id)}>
                            <IonIcon icon={trashOutline} slot="start" />
                            Delete
                          </IonButton>
                        </div>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <IonIcon icon={cartOutline} style={{ fontSize: '64px', color: '#ccc' }} />
            <h3>No products yet</h3>
            <p>Start by adding your first product to the inventory</p>
            <IonButton onClick={() => setShowAddForm(true)}>
              <IonIcon icon={addOutline} slot="start" />
              Add Product
            </IonButton>
          </div>
        )}

        {/* Floating Action Button for Bulk Add */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowBulkAddForm(true)}>
            <IonIcon icon={cloudUploadOutline} />
          </IonFabButton>
        </IonFab>

        {/* Add Product Modal */}
        <IonModal isOpen={showAddForm} onDidDismiss={() => setShowAddForm(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add New Product</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowAddForm(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Product Name *</IonLabel>
              <IonInput
                value={addForm.name}
                onIonInput={(e) => setAddForm({ ...addForm, name: e.detail.value! })}
                placeholder="Enter product name"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Price (₹) *</IonLabel>
              <IonInput
                type="number"
                value={addForm.price}
                onIonInput={(e) => setAddForm({ ...addForm, price: e.detail.value! })}
                placeholder="Enter price"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Quantity *</IonLabel>
              <IonInput
                type="number"
                value={addForm.quantity}
                onIonInput={(e) => setAddForm({ ...addForm, quantity: e.detail.value! })}
                placeholder="Enter quantity"
              />
            </IonItem>

            {/* Product Image Upload Section */}
            <div style={{ marginTop: '20px' }}>
              <IonLabel>
                Product Image <span style={{ color: '#666', fontSize: '0.9em' }}>(Optional)</span>
              </IonLabel>
              
              <div style={{ marginTop: '10px' }}>
                {addImagePreview ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px' 
                  }}>
                    <img 
                      src={addImagePreview} 
                      alt="Product preview" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0', fontSize: '0.9em' }}>{selectedAddImage?.name}</p>
                      <p style={{ margin: '0', fontSize: '0.8em', color: '#666' }}>
                        {selectedAddImage ? (selectedAddImage.size / 1024 / 1024).toFixed(2) : '0'} MB
                      </p>
                    </div>
                    <IonButton fill="clear" size="small" onClick={resetAddImageState}>
                      Remove
                    </IonButton>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '20px', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px', 
                    textAlign: 'center' 
                  }}>
                    <IonIcon icon={cameraOutline} style={{ fontSize: '32px', color: '#666' }} />
                    <p style={{ margin: '10px 0', color: '#666' }}>Add product image</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      ref={addImageInputRef}
                      onChange={handleAddImageUpload}
                      style={{ display: 'none' }}
                    />
                    <IonButton 
                      fill="outline" 
                      size="small"
                      onClick={() => addImageInputRef.current?.click()}
                    >
                      Choose Image
                    </IonButton>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.8em', color: '#666', margin: '5px 0 0 0' }}>
                JPEG, JPG, PNG, WebP format, up to 5 MB
              </p>
            </div>

            <IonButton expand="block" style={{ marginTop: '20px' }} onClick={handleAddProduct}>
              <IonIcon icon={addOutline} slot="start" />
              Add Product
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Bulk Add Modal */}
        {/* Bulk Add Products Modal */}
<IonModal isOpen={showBulkAddForm} onDidDismiss={() => setShowBulkAddForm(false)}>
  <IonHeader>
    <IonToolbar>
      <IonTitle>Bulk Add Products</IonTitle>
      <IonButton slot="end" fill="clear" onClick={() => setShowBulkAddForm(false)}>
        <IonIcon icon={closeOutline} />
      </IonButton>
    </IonToolbar>
  </IonHeader>
  <IonContent className="ion-padding">
    {bulkProducts.map((product, index) => (
      <IonCard key={index}>
        <IonCardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IonCardTitle>Product {index + 1}</IonCardTitle>
            {bulkProducts.length > 1 && (
              <IonButton
                fill="clear"
                color="danger"
                size="small"
                onClick={() => removeBulkProductRow(index)}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            )}
          </div>
        </IonCardHeader>
        <IonCardContent>
          <IonItem>
            <IonLabel position="stacked">Product Name *</IonLabel>
            <IonInput
              value={product.name}
              onIonInput={(e) => updateBulkProduct(index, 'name', e.detail.value!)}
              placeholder="Enter product name"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Price (₹) *</IonLabel>
            <IonInput
              type="number"
              value={product.price}
              onIonInput={(e) => updateBulkProduct(index, 'price', e.detail.value!)}
              placeholder="Enter price"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Quantity *</IonLabel>
            <IonInput
              type="number"
              value={product.quantity}
              onIonInput={(e) => updateBulkProduct(index, 'quantity', e.detail.value!)}
              placeholder="Enter quantity"
            />
          </IonItem>

          {/* Product Image Upload Section */}
          <div style={{ marginTop: '20px' }}>
            <IonLabel>
              Product Image <span style={{ color: '#666', fontSize: '0.9em' }}>(Optional)</span>
            </IonLabel>
            
            <div style={{ marginTop: '10px' }}>
              {product.imagePreview ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px' 
                }}>
                  <img 
                    src={product.imagePreview} 
                    alt="Product preview" 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0', fontSize: '0.9em' }}>{product.image?.name}</p>
                    <p style={{ margin: '0', fontSize: '0.8em', color: '#666' }}>
                      {product.image ? (product.image.size / 1024 / 1024).toFixed(2) : '0'} MB
                    </p>
                  </div>
                  <IonButton fill="clear" size="small" onClick={() => removeBulkImage(index)}>
                    Remove
                  </IonButton>
                </div>
              ) : (
                <div style={{ 
                  padding: '20px', 
                  border: '2px dashed #ddd', 
                  borderRadius: '8px', 
                  textAlign: 'center' 
                }}>
                  <IonIcon icon={cameraOutline} style={{ fontSize: '32px', color: '#666' }} />
                  <p style={{ margin: '10px 0', color: '#666' }}>Add product image</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleBulkImageUpload(index, e)}
                    style={{ display: 'none' }}
                    id={`bulk-image-input-${index}`}
                  />
                  <IonButton 
                    fill="outline" 
                    size="small"
                    onClick={() => document.getElementById(`bulk-image-input-${index}`)?.click()}
                  >
                    Choose Image
                  </IonButton>
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.8em', color: '#666', margin: '5px 0 0 0' }}>
              JPEG, JPG, PNG, WebP format, up to 5 MB
            </p>
          </div>

          {bulkProducts.length > 1 && (
            <IonButton 
              color="danger" 
              fill="outline" 
              style={{ marginTop: '15px' }}
              onClick={() => removeBulkProductRow(index)}
            >
              <IonIcon icon={trashOutline} slot="start" />
              Remove Product
            </IonButton>
          )}
        </IonCardContent>
      </IonCard>
    ))}
    
    <IonButton expand="block" fill="outline" onClick={addBulkProductRow}>
      <IonIcon icon={addOutline} slot="start" />
      Add Another Product
    </IonButton>
    
    <IonButton 
      expand="block" 
      style={{ marginTop: '20px' }} 
      onClick={handleBulkAddProducts}
      disabled={bulkLoading}
    >
      <IonIcon icon={checkmarkOutline} slot="start" />
      {bulkLoading ? 'Adding Products...' : 'Add All Products'}
    </IonButton>
  </IonContent>
</IonModal>

{/* Loading overlay for bulk operations */}
<IonLoading
  isOpen={bulkLoading}
  message="Adding products..."
  duration={0}
/>

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirm Delete"
          message="Are you sure you want to delete this product?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                setShowDeleteAlert(false);
                setProductToDelete(null);
              }
            },
            {
              text: 'Delete',
              handler: handleDelete
            }
          ]}
        />
      </IonContent>

      <IonFooter className='business-inventory-footer'>
        <div className="business-inventory-footer-navebar">
          <IonRouterLink href='/Businessman_Home'>
            <div className="business-inventory-footer-item">
              <IonIcon icon={homeOutline} className='business-inventory-footer-icon' style={{ color: isActive('/Businessman_Home') ? 'blue' : 'black' }} />
              <span className='business-inventory-footer-text' style={{ color: isActive('/Businessman_Home') ? 'blue' : 'black' }}>Home</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/Businessman_inventory'>
            <div className="business-inventory-footer-item">
              <IonIcon icon={cartOutline} className='business-inventory-footer-icon' style={{ color: isActive('/Businessman_inventory') ? 'blue' : 'black' }} />
              <span className='business-inventory-footer-text' style={{ color: isActive('/Businessman_inventory') ? 'blue' : 'black' }}>Inventory</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/Businessman_billing'>
            <div className="business-inventory-footer-item">
              <IonIcon icon={newspaperOutline} className='business-inventory-footer-icon' style={{ color: isActive('/Businessman_billing') ? 'blue' : 'black' }} />
              <span className='business-inventory-footer-text' style={{ color: isActive('/Businessman_billing') ? 'blue' : 'black' }}>Billing</span>
            </div>
          </IonRouterLink>
          <IonRouterLink href='/Businessman_account'>
            <div className="business-inventory-footer-item">
              <IonIcon icon={personCircleOutline} className='business-inventory-footer-account-icon' style={{ color: isActive('/Businessman_account') ? 'blue' : 'black' }} />
              <span className='business-inventory-footer-account-text' style={{ color: isActive('/Businessman_account') ? 'blue' : 'black' }}>Account</span>
            </div>
          </IonRouterLink>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default Businessman_inventory;