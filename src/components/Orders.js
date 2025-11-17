import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, orders]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/api/orders');

      if (response.data.success) {
        console.log('Orders fetched:', response.data.data);
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      alert('Error loading orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(order => order.status === filter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.customer?.name?.toLowerCase().includes(searchLower) ||
        order.customer?.email?.toLowerCase().includes(searchLower) ||
        order.driver?.name?.toLowerCase().includes(searchLower) ||
        order.restaurant?.name?.toLowerCase().includes(searchLower) ||
        order.items?.some(item => item.name?.toLowerCase().includes(searchLower))
      );
    }

    setFilteredOrders(filtered);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowEditModal(true);
  };

  const handleViewItems = (order) => {
    console.log('Viewing items for order:', order);
    setSelectedOrder(order);
    setShowItemsModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put(
        `/api/orders/${selectedOrder._id}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        alert('Order status updated successfully!');
        setShowEditModal(false);
        fetchOrders();
      }
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error updating order status');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'status-badge-pending',
      assigned: 'status-badge-confirmed',
      ongoing: 'status-badge-picked',
      completed: 'status-badge-delivered',
      cancelled: 'status-badge-cancelled',
      confirmed: 'status-badge-confirmed',
      picked_up: 'status-badge-picked',
      in_transit: 'status-badge-transit',
      delivered: 'status-badge-delivered'
    };
    return statusClasses[status] || 'status-badge-default';
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `R${parseFloat(amount).toFixed(2)}`;
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    
    if (typeof address === 'string') return address;
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    
    return parts.length > 0 ? parts.join(', ') : (address.country || 'N/A');
  };

  // Helper to get image URL from various formats
  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    
    // If it's a string URL, return it
    if (typeof imageData === 'string') return imageData;
    
    // If it's a Cloudinary object
    if (imageData.url) return imageData.url;
    if (imageData.secure_url) return imageData.secure_url;
    
    // If it has nested structure
    if (imageData.image?.url) return imageData.image.url;
    if (imageData.image?.secure_url) return imageData.image.secure_url;
    
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2 className="orders-title">Orders Management</h2>
        
        {/* Search Bar */}
        <div className="search-filter-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by order number, customer, driver, restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={clearSearch}>
                ✕
              </button>
            )}
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="orders-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed ({orders.filter(o => o.status === 'confirmed').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'in_transit' ? 'active' : ''}`}
            onClick={() => setFilter('in_transit')}
          >
            In Transit ({orders.filter(o => o.status === 'in_transit').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
            onClick={() => setFilter('delivered')}
          >
            Delivered ({orders.filter(o => o.status === 'delivered').length})
          </button>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="search-results-info">
            Found {filteredOrders.length} order(s) matching "{searchTerm}"
          </div>
        )}
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Driver</th>
              <th>Restaurant</th>
              <th>Delivery Address</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  {searchTerm ? 'No orders found matching your search' : 'No orders found'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="order-number">{order.orderNumber}</td>
                  
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customer?.name || 'N/A'}</div>
                      <div className="customer-contact">{order.customer?.phone || order.customer?.email || ''}</div>
                    </div>
                  </td>
                  
                  <td>
                    <div className="driver-info">
                      <div className="driver-name">{order.driver?.name || 'Not Assigned'}</div>
                      <div className="driver-phone">{order.driver?.phone || ''}</div>
                    </div>
                  </td>
                  
                  <td>
                    <div className="restaurant-info">
                      <div className="restaurant-name">{order.restaurant?.name || 'N/A'}</div>
                      <div className="restaurant-cuisine">{order.restaurant?.cuisine || ''}</div>
                    </div>
                  </td>
                  
                  <td>
                    <div className="address-info">
                      {formatAddress(order.deliveryAddress)}
                    </div>
                  </td>
                  
                  <td>
                    <div className="items-preview">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="item-preview-row">
                          {item.name} ×{item.quantity}
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="item-more">+{order.items.length - 2} more</div>
                      )}
                      <button 
                        className="btn-view-items"
                        onClick={() => handleViewItems(order)}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                  
                  <td className="order-amount">{formatCurrency(order.totalAmount)}</td>
                  
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(order.deliveryStatus || order.status)}`}>
                      {formatStatus(order.deliveryStatus || order.status)}
                    </span>
                  </td>
                  
                  <td className="order-date">{formatDate(order.createdAt)}</td>
                  
                  <td>
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditOrder(order)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Items Modal */}
      {showItemsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowItemsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Items - {selectedOrder.orderNumber}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowItemsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="order-items-container">
              <div className="order-meta">
                <div className="meta-row">
                  <span className="meta-label">Restaurant:</span>
                  <span className="meta-value">{selectedOrder.restaurant?.name}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Customer:</span>
                  <span className="meta-value">{selectedOrder.customer?.name}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Order Date:</span>
                  <span className="meta-value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Status:</span>
                  <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {formatStatus(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div className="items-list">
                <h4>Order Items ({selectedOrder.items?.length || 0})</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="items-grid">
                    {selectedOrder.items.map((item, idx) => {
                      const imageUrl = getImageUrl(item.image || item.images);
                      console.log(`Item ${idx}:`, item.name, 'Image URL:', imageUrl);
                      
                      return (
                        <div key={idx} className="item-card">
                          {imageUrl ? (
                            <div className="item-image-wrapper">
                              <img 
                                src={imageUrl} 
                                alt={item.name}
                                className="item-image"
                                onError={(e) => {
                                  console.error('Image load error for:', imageUrl);
                                  e.target.style.display = 'none';
                                  e.target.parentElement.classList.add('image-error');
                                }}
                                onLoad={() => console.log('Image loaded:', imageUrl)}
                              />
                            </div>
                          ) : (
                            <div className="item-image-placeholder">
                              <span>🍽️</span>
                              <p>No Image</p>
                            </div>
                          )}
                          
                          <div className="item-info">
                            <h5 className="item-name">{item.name}</h5>
                            
                            {item.description && (
                              <p className="item-description">{item.description}</p>
                            )}
                            
                            {item.category && (
                              <span className="item-category">{item.category}</span>
                            )}
                            
                            <div className="item-pricing">
                              <div className="pricing-row">
                                <span className="label">Price:</span>
                                <span className="value">{formatCurrency(item.price)}</span>
                              </div>
                              <div className="pricing-row">
                                <span className="label">Quantity:</span>
                                <span className="value">×{item.quantity}</span>
                              </div>
                              <div className="pricing-row subtotal">
                                <span className="label"><strong>Subtotal:</strong></span>
                                <span className="value"><strong>{formatCurrency(item.subtotal || item.price * item.quantity)}</strong></span>
                              </div>
                            </div>
                            
                            {item.specialInstructions && (
                              <div className="item-instructions">
                                <strong>Instructions:</strong> {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-items">No items found in this order</p>
                )}
              </div>

              <div className="order-summary">
                <h4>Order Summary</h4>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}</span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div className="summary-row">
                    <span>Delivery Fee:</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                )}
                {selectedOrder.tax > 0 && (
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span><strong>Total:</strong></span>
                  <span><strong>{formatCurrency(selectedOrder.totalAmount)}</strong></span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowItemsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Status Modal */}
      {showEditModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Order Status</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label>Order Number</label>
                <input
                  type="text"
                  value={selectedOrder.orderNumber}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Current Status</label>
                <input
                  type="text"
                  value={formatStatus(selectedOrder.status)}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="order-details-summary">
                <h4>Order Details</h4>
                <p><strong>Customer:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>Driver:</strong> {selectedOrder.driver?.name || 'Not Assigned'}</p>
                <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;