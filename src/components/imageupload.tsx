import { useState, useEffect } from 'react';

interface UploadComponentProps {
  skipUrl?: string;
  successRedirectDelay?: number;
  shopId?: string | null;
  productId?: string;
  adverId?: string;
}

export default function UploadComponent({ 
  skipUrl, 
  successRedirectDelay = 2000,
  adverId,
  shopId, 
  productId, 
}: UploadComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Handle redirect countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    
    if (uploadComplete && !error && skipUrl) {
      setRedirectCountdown(Math.ceil(successRedirectDelay / 1000));
      
      countdownTimer = setInterval(() => {
        setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      
      timer = setTimeout(() => {
        window.location.href = skipUrl;
      }, successRedirectDelay);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [uploadComplete, error, skipUrl, successRedirectDelay]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

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
    
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file);
    if (productId) formData.append('productId', productId);
    if (shopId) formData.append('shopId', shopId);
    if (adverId) formData.append('adverId', adverId);
    
    try {
      const response = await fetch('http://localhost:3000/api/upload-profile-image', {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header for FormData - browser will set it automatically with boundary
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Upload failed with status ${response.status}`
        );
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      setUploadComplete(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err instanceof Error ? 
        err.message : 
        'An unknown error occurred during upload'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    if (skipUrl) {
      window.location.href = skipUrl;
    }
  };
  
  const handleTryAgain = () => {
    setError(null);
    setFile(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '448px',
      margin: '32px auto',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '32px',
        width: '100%',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1d4ed8',
          marginBottom: '24px',
          textAlign: 'center',
        }}>Upload Image</h2>
        
        {error ? (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              backgroundColor: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              padding: '16px',
              borderRadius: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <svg style={{ height: '20px', width: '20px', color: '#ef4444' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div style={{ marginLeft: '12px' }}>
                  <p style={{ fontSize: '14px', color: '#b91c1c' }}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleTryAgain}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '4px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              Try Again
            </button>
          </div>
        ) : uploadComplete ? (
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{
              margin: '0 auto',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              marginBottom: '16px',
            }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                style={{ height: '40px', width: '40px', color: '#22c55e' }}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '500',
              color: '#15803d',
              marginBottom: '8px',
            }}>Upload Successful!</h3>
            <p style={{ color: '#6b7280' }}>
              {redirectCountdown !== null ? (
                <>Redirecting in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...</>
              ) : 'Upload complete.'}
            </p>
            <button 
              onClick={handleSkip} 
              style={{
                marginTop: '24px',
                padding: '8px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '4px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              Continue Now
            </button>
          </div>
        ) : (
          <div
            style={{
              border: '2px dashed',
              borderColor: isDragging ? '#3b82f6' : '#bfdbfe',
              backgroundColor: isDragging ? '#eff6ff' : (file ? '#eff6ff' : 'transparent'),
              borderRadius: '8px',
              padding: '32px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  margin: '0 auto',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: '#dbeafe',
                }}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    style={{ height: '32px', width: '32px', color: '#3b82f6' }}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <p style={{ color: '#1d4ed8', fontWeight: '500' }}>Drag and drop image here</p>
                <p style={{ color: '#60a5fa', fontSize: '14px' }}>- or -</p>
                <label style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}>
                  Browse Files
                  <input 
                    type="file" 
                    onChange={handleChange} 
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </label>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  margin: '0 auto',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: '#dbeafe',
                }}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    style={{ height: '24px', width: '24px', color: '#3b82f6' }}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
                <p style={{ color: '#1d4ed8', fontWeight: '500' }}>{file.name}</p>
                <p style={{ color: '#60a5fa', fontSize: '14px' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button 
                  onClick={() => setFile(null)}
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                >
                  Change file
                </button>
              </div>
            )}
          </div>
        )}
        
        {!uploadComplete && !error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <button
              onClick={handleSkip}
              style={{
                padding: '8px 24px',
                border: '1px solid #3b82f6',
                color: '#3b82f6',
                borderRadius: '4px',
                fontWeight: '500',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                flex: 1,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Skip
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              style={{
                padding: '8px 24px',
                borderRadius: '4px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                flex: 1,
                position: 'relative',
                border: 'none',
                cursor: !file ? 'not-allowed' : 'pointer',
                backgroundColor: !file ? '#93c5fd' : '#3b82f6',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (file && !isUploading) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (file && !isUploading) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              {isUploading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg 
                    style={{ 
                      animation: 'spin 1s linear infinite',
                      height: '20px',
                      width: '20px',
                      marginRight: '8px',
                      color: 'white',
                    }} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}