import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonToast,
  IonBadge,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { refresh, person, pricetag, checkmark, time, close } from 'ionicons/icons';

import './Businessman_order.css';

interface Consumer {
  id: number;
  name: string;
  username: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface Order {
  id: number;
  shopId: number;
  status: string;
  createdAt?: string;
  consumer: Consumer;
  product: Product;
  quantity?: number;
  totalAmount?: number;
}

const Businessman_order: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  
  const shopId = 1; 
  const API_BASE_URL = 'http://localhost:3000/api'; 
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/shop/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.message || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToastMessage('Failed to fetch orders', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/shop/orders/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      showToastMessage('Order status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToastMessage('Failed to update order status', 'danger');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const showToastMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const doRefresh = (event: CustomEvent) => {
    fetchOrders().finally(() => {
      event.detail.complete();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
      case 'processing':
        return 'primary';
      case 'completed':
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return checkmark;
      case 'cancelled':
        return close;
      case 'pending':
        return time;
      default:
        return time;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Order Management</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className='business-order-page'>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <IonText>Loading orders...</IonText>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <IonText>
              <h2>No Orders Found</h2>
              <p>You don't have any orders yet.</p>
            </IonText>
          </div>
        ) : (
          <div className="orders-container">
            {orders.map((order) => (
              <IonCard key={order.id} className="order-card">
                <IonCardHeader>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="8">
                        <IonCardTitle>Order #{order.id}</IonCardTitle>
                      </IonCol>
                      <IonCol size="4" className="ion-text-right">
                        <IonBadge 
                          color={getStatusColor(order.status)}
                          className="status-badge"
                        >
                          <IonIcon icon={getStatusIcon(order.status)} />
                          {order.status}
                        </IonBadge>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardHeader>

                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="3">
                        <IonAvatar className="product-avatar">
                          <img 
                            src={order.product.image || '/placeholder-product.jpg'} 
                            alt={order.product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                            }}
                          />
                        </IonAvatar>
                      </IonCol>
                      <IonCol size="9">
                        <div className="order-details">
                          <h3>{order.product.name}</h3>
                          <p className="price">
                            <IonIcon icon={pricetag} />
                            ₹{order.product.price}
                          </p>
                          <p className="customer">
                            <IonIcon icon={person} />
                            {order.consumer.name} (@{order.consumer.username})
                          </p>
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  <IonItem lines="none" className="status-update-item">
                    <IonLabel>Update Status:</IonLabel>
                    <IonSelect
                      value={order.status}
                      placeholder="Select Status"
                      onIonChange={(e) => updateOrderStatus(order.id, e.detail.value)}
                      disabled={updatingOrderId === order.id}
                    >
                      <IonSelectOption value="pending">Pending</IonSelectOption>
                      <IonSelectOption value="confirmed">Confirmed</IonSelectOption>
                      <IonSelectOption value="processing">Processing</IonSelectOption>
                      <IonSelectOption value="shipped">Shipped</IonSelectOption>
                      <IonSelectOption value="delivered">Delivered</IonSelectOption>
                      <IonSelectOption value="cancelled">Cancelled</IonSelectOption>
                    </IonSelect>
                    {updatingOrderId === order.id && (
                      <IonSpinner name="crescent" slot="end" />
                    )}
                  </IonItem>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default Businessman_order;