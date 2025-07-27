import React, { useRef, useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonToggle,
  IonInput,
  IonToast,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonLoading,
} from '@ionic/react';
import { 
  cloudUploadOutline, 
  chevronBackOutline, 
  addOutline, 
  removeOutline,
  checkmarkCircleOutline,
  cameraOutline
} from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import './Businessman_inventory_add.css';

interface InventoryAddProps {}

const Businessman_inventory_add: React.FC<InventoryAddProps> = () => {
  // Router
  const router = useIonRouter();
  
  // Toggle states
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [isQuantityInWeight, setIsQuantityInWeight] = useState(false);
  
  // Form states
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [weightQuantity, setWeightQuantity] = useState('');
  
  // File upload states (for bulk upload)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Item image upload states (for manual entry)
  const itemImageInputRef = useRef<HTMLInputElement>(null);
  const [selectedItemImage, setSelectedItemImage] = useState<File | null>(null);
  const [selectedItemImageName, setSelectedItemImageName] = useState('');
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('danger');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Get shopId from localStorage
  const shopId = localStorage.getItem("shopId");

  // Redirect countdown after successful upload
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Handle redirect countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    
    if (uploadComplete && !error) {
      setRedirectCountdown(3);
      
      countdownTimer = setInterval(() => {
        setRedirectCountdown(prev => prev !== null ? prev - 1 : null);
      }, 1000);
      
      timer = setTimeout(() => {
        // Reset the form and states to allow adding more items
        setUploadComplete(false);
        setSelectedFile(null);
        setSelectedFileName('');
        setError(null);
        setRedirectCountdown(null);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Stay on the same page (Businessman_inventory_add) - no navigation needed
        // The page will automatically show the upload form again after state reset
      }, 3000);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [uploadComplete, error]);

  // Show toast helper
  const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  // Handle quantity input change
  const handleQuantityChange = (e: CustomEvent) => {
    const value = parseInt(e.detail.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else if (e.detail.value === '') {
      setQuantity(0);
    }
  };

  // Increment/Decrement quantity
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Handle file selection for bulk upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showToastMessage('Please select only image files (JPEG, PNG, etc.).');
        setSelectedFile(null);
        setSelectedFileName('');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      if (file.size > maxSizeInBytes) {
        showToastMessage('File size must be less than 5MB. Please choose a smaller file.');
        setSelectedFile(null);
        setSelectedFileName('');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setSelectedFile(file);
        setSelectedFileName(file.name);
        setError(null);
      }
    } else {
      setSelectedFile(null);
      setSelectedFileName('');
    }
  };

  // Handle item image selection for manual entry
  const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showToastMessage('Please select only image files (JPEG, PNG, etc.).');
        setSelectedItemImage(null);
        setSelectedItemImageName('');
        setItemImagePreview(null);
        
        if (itemImageInputRef.current) {
          itemImageInputRef.current.value = '';
        }
        return;
      }
      
      if (file.size > maxSizeInBytes) {
        showToastMessage('File size must be less than 5MB. Please choose a smaller file.');
        setSelectedItemImage(null);
        setSelectedItemImageName('');
        setItemImagePreview(null);
        
        if (itemImageInputRef.current) {
          itemImageInputRef.current.value = '';
        }
      } else {
        setSelectedItemImage(file);
        setSelectedItemImageName(file.name);
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          setItemImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        setError(null);
      }
    } else {
      setSelectedItemImage(null);
      setSelectedItemImageName('');
      setItemImagePreview(null);
    }
  };

  // Handle drag and drop for bulk upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showToastMessage('Please select only image files (JPEG, PNG, etc.).');
        return;
      }
      
      if (file.size > maxSizeInBytes) {
        showToastMessage('File size must be less than 5MB. Please choose a smaller file.');
      } else {
        setSelectedFile(file);
        setSelectedFileName(file.name);
      }
    }
  };

  // Handle image upload to inventory (bulk upload)
  const handleImageUpload = async () => {
    if (!selectedFile) {
      showToastMessage('Please select an image file first.');
      return;
    }

    if (!shopId) {
      showToastMessage('Shop ID not found. Please sign in again.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('shopId', shopId);
    
    try {
      console.log('Uploading to:', `http://localhost:3000/api/upload-image`);
      
      const response = await fetch(`http://localhost:3000/api/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If it's not JSON, get the text to see what we received
        const responseText = await response.text();
        console.error('Non-JSON response received:', responseText);
        throw new Error('Server returned non-JSON response. Please check if the server is running correctly.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
      
      console.log('Upload successful:', data);
      setUploadComplete(true);
      showToastMessage('Image uploaded successfully! Processing inventory...', 'success');
      
    } catch (error) {
      console.error('Upload failed:', error);
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to server. Please check if the server is running.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      showToastMessage(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle manual product addition
  const handleManualAdd = async () => {
    // Validation
    if (!productName.trim()) {
      showToastMessage('Please enter a product name.');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      showToastMessage('Please enter a valid price.');
      return;
    }
    
    if (isQuantityInWeight) {
      if (!weightQuantity || parseFloat(weightQuantity) <= 0) {
        showToastMessage('Please enter a valid weight quantity.');
        return;
      }
    } else {
      if (quantity <= 0) {
        showToastMessage('Please enter a valid quantity.');
        return;
      }
    }

    if (!shopId) {
      showToastMessage('Shop ID not found. Please sign in again.');
      return;
    }

    setIsLoading(true);
    
    try {
      // First create the product
      const productData = {
        name: productName.trim(),
        price: parseFloat(price),
        quantity: isQuantityInWeight ? parseFloat(weightQuantity) : quantity,
        quantityType: isQuantityInWeight ? 'weight' : 'count',
        shopId: shopId
      };

      console.log('Creating product:', productData);

      const response = await fetch(`http://localhost:3000/shop/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response received:', responseText);
        throw new Error('Server returned non-JSON response. Please check if the server is running correctly.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
      
      console.log('Product added:', data);
      
      // If there's an item image, upload it
      if (selectedItemImage && data.product && data.product.id) {
        try {
          const formData = new FormData();
          formData.append('image', selectedItemImage);
          formData.append('productId', data.product.id.toString());
          
          const imageResponse = await fetch(`http://localhost:3000/api/upload-item-image`, {
            method: 'POST',
            body: formData,
          });
          
          if (imageResponse.ok) {
            console.log('Product image uploaded successfully');
          } else {
            console.warn('Failed to upload product image, but product was created');
          }
        } catch (imageError) {
          console.error('Error uploading product image:', imageError);
          // Don't throw error, product was created successfully
        }
      }
      
      // Reset form
      setProductName('');
      setPrice('');
      setQuantity(1);
      setWeightQuantity('');
      setSelectedItemImage(null);
      setSelectedItemImageName('');
      setItemImagePreview(null);
      
      if (itemImageInputRef.current) {
        itemImageInputRef.current.value = '';
      }
      
      showToastMessage('Product added successfully!', 'success');
      
    } catch (error) {
      console.error('Error adding product:', error);
      let errorMessage = 'Failed to add product. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to server. Please check if the server is running.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToastMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid for manual entry
  const isManualFormValid = () => {
    return productName.trim() && 
           price && 
           parseFloat(price) > 0 && 
           (isQuantityInWeight ? 
             (weightQuantity && parseFloat(weightQuantity) > 0) : 
             quantity > 0
           );
  };

  // Reset form manually (for "Add More Items" button)
  const resetForm = () => {
    setUploadComplete(false);
    setSelectedFile(null);
    setSelectedFileName('');
    setError(null);
    setRedirectCountdown(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/Businessman_inventory_add" />
          </IonButtons>
          <IonTitle className='Businessman_inventory_item_add'>Add to Inventory</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="inventory-add-content">
        <div className="inventory-add-container">
          <h1 className="inventory-add-title">Add Items To Inventory</h1>

          {/* Toggle for manual entry */}
          <IonItem lines="none" className="toggle-item">
            <IonLabel className="toggle-label">Use Manual Entry Instead</IonLabel>
            <IonToggle
              slot="end"
              color="success"
              checked={useManualEntry}
              onIonChange={e => setUseManualEntry(e.detail.checked)}
            />
          </IonItem>

          {/* Conditional Content */}
          <div className="content-section">
            {!useManualEntry ? (
              /* Image Upload Section */
              <div className="upload-section">
                <h2 className="section-title">Upload Your Inventory</h2>
                <p className="section-description">
                  Snap a photo of your item list and upload it here. Our system will read the
                  details and add your products instantly. Make sure the text is clear and in
                  English!
                </p>

                {uploadComplete ? (
                  <div className="upload-success">
                    <IonIcon icon={checkmarkCircleOutline} className="success-icon" />
                    <h3>Upload Successful!</h3>
                    <p>
                      {redirectCountdown !== null ? (
                        `Ready to add more items in ${redirectCountdown} second${redirectCountdown !== 1 ? 's' : ''}...`
                      ) : (
                        'Processing your inventory...'
                      )}
                    </p>
                    <IonButton 
                      fill="clear" 
                      onClick={resetForm}
                    >
                      Add More Items Now
                    </IonButton>
                  </div>
                ) : (
                  <>
                    <div 
                      className={`upload-area ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="upload-content">
                        <IonIcon icon={cloudUploadOutline} className="upload-icon" />
                        
                        {selectedFile ? (
                          <div className="file-selected">
                            <p className="file-name">{selectedFileName}</p>
                            <p className="file-size">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <button
                              className="change-file-btn"
                              onClick={() => {
                                setSelectedFile(null);
                                setSelectedFileName('');
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                            >
                              Change File
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="upload-text">
                              {isDragging ? 'Drop image here' : 'Upload Image Here'}
                            </p>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              style={{ display: 'none' }}
                            />
                            <button
                              className="browse-button"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Browse
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="file-note">
                      Note: JPEG, JPG, PNG, WebP format, up to 5 MB
                    </p>

                    <IonButton 
                      expand="block" 
                      className="add-button"
                      onClick={handleImageUpload}
                      disabled={!selectedFile || isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Add To Inventory'}
                    </IonButton>
                  </>
                )}
              </div>
            ) : (
              /* Manual Entry Section */
              <div className="manual-entry-section">
                <div className="form-group">
                  <IonItem>
                    <IonLabel position="stacked">
                      Name of Product <span className="required">*</span>
                    </IonLabel>
                    <IonInput
                      placeholder="Enter item name"
                      value={productName}
                      onIonChange={e => setProductName(e.detail.value!)}
                    />
                  </IonItem>
                </div>

                <div className="form-group">
                  <IonItem>
                    <IonLabel position="stacked">
                      Price <span className="required">*</span>
                    </IonLabel>
                    <IonInput
                      type="number"
                      placeholder="Enter amount"
                      value={price}
                      onIonChange={e => setPrice(e.detail.value!)}
                    >
                      <div slot="start" className="currency-symbol">₹</div>
                    </IonInput>
                  </IonItem>
                </div>

                {/* Quantity Type Toggle */}
                <IonItem lines="none" className="toggle-item">
                  <IonLabel className="toggle-label">Quantity in weight</IonLabel>
                  <IonToggle
                    slot="end"
                    color="success"
                    checked={isQuantityInWeight}
                    onIonChange={e => setIsQuantityInWeight(e.detail.checked)}
                  />
                </IonItem>

                {/* Quantity Input */}
                {isQuantityInWeight ? (
                  <div className="form-group">
                    <IonItem>
                      <IonLabel position="stacked">
                        Quantity <span className="required">*</span>
                      </IonLabel>
                      <IonInput
                        type="number"
                        placeholder="Enter weight"
                        value={weightQuantity}
                        onIonChange={e => setWeightQuantity(e.detail.value!)}
                      >
                        <div slot="end" className="unit-label">Kg</div>
                      </IonInput>
                    </IonItem>
                  </div>
                ) : (
                  <div className="form-group">
                    <IonLabel className="quantity-label">
                      Quantity <span className="required">*</span>
                    </IonLabel>
                    <div className="quantity-container">
                      <IonButton 
                        fill="clear" 
                        onClick={decrementQuantity}
                        className="qty-btn"
                        disabled={quantity <= 1}
                      >
                        <IonIcon icon={removeOutline} />
                      </IonButton>

                      <IonInput
                        value={quantity.toString().padStart(2, '0')}
                        className="qty-input"
                        onIonChange={handleQuantityChange}
                        inputMode="numeric"
                        readonly
                      />

                      <IonButton 
                        fill="clear" 
                        onClick={incrementQuantity}
                        className="qty-btn"
                      >
                        <IonIcon icon={addOutline} />
                      </IonButton>
                    </div>
                  </div>
                )}

                {/* Item Image Upload Section */}
                <div className="form-group" style={{marginLeft:'10px'}}>
                  <IonLabel className="image-label">
                    Product Image <span className="optional">(Optional)</span>
                  </IonLabel>
                  
                  <div className="item-image-upload">
                    {itemImagePreview ? (
                      <div className="image-preview-container">
                        <img 
                          src={itemImagePreview} 
                          alt="Product preview" 
                          className="image-preview"
                        />
                        <div className="image-details">
                          <p className="image-name">{selectedItemImageName}</p>
                          <p className="image-size">
                            {selectedItemImage ? (selectedItemImage.size / 1024 / 1024).toFixed(2) : '0'} MB
                          </p>
                          <IonButton 
                            fill="clear" 
                            size="small"
                            onClick={() => {
                              setSelectedItemImage(null);
                              setSelectedItemImageName('');
                              setItemImagePreview(null);
                              if (itemImageInputRef.current) {
                                itemImageInputRef.current.value = '';
                              }
                            }}
                          >
                            Remove Image
                          </IonButton>
                        </div>
                      </div>
                    ) : (
                      <div className="image-upload-placeholder">
                        
                        <p>Add product image</p>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          ref={itemImageInputRef}
                          onChange={handleItemImageUpload}
                          style={{ display: 'none' }}
                        />
                        <IonButton 
                          fill="outline" 
                          size="small"
                          onClick={() => itemImageInputRef.current?.click()}
                        >
                          Choose Image
                        </IonButton>
                      </div>
                    )}
                  </div>
                  <p className="image-note">
                    JPEG, JPG, PNG, WebP format, up to 5 MB
                  </p>
                </div>

                <div className="form-actions">
                  <IonButton 
                    expand="block" 
                    className="add-button"
                    onClick={handleManualAdd}
                    disabled={!isManualFormValid() || isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add to Inventory'}
                  </IonButton>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        <IonLoading
          isOpen={isLoading}
          message="Adding product..."
        />

        {/* Toast for messages */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default Businessman_inventory_add;