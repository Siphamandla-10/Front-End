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

  // Embedded Styles with softer text
  const styles = {
    ordersPage: {
      padding: '20px',
      background: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    ordersHeader: {
      background: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '25px',
    },
    ordersTitle: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '20px',
      textAlign: 'left',
    },
    searchFilterContainer: {
      marginBottom: '20px',
    },
    searchBar: {
      position: 'relative',
      width: '100%',
      maxWidth: '600px',
    },
    searchInput: {
      width: '100%',
      padding: '12px 45px 12px 15px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '400',
      color: '#2c3e50',
      transition: 'border-color 0.3s',
    },
    searchIcon: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '18px',
      pointerEvents: 'none',
    },
    clearSearchBtn: {
      position: 'absolute',
      right: '45px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: '#ff6b6b',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.3s',
    },
    searchResultsInfo: {
      marginTop: '15px',
      padding: '10px',
      background: '#e3f2fd',
      borderLeft: '4px solid #2196F3',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#2c3e50',
    },
    ordersFilters: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      marginTop: '20px',
    },
    filterBtn: {
      padding: '10px 20px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      background: 'white',
      fontSize: '14px',
      fontWeight: '500',
      color: '#2c3e50',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    filterBtnActive: {
      background: '#C444C7',
      color: 'white',
      borderColor: '#C444C7',
      fontWeight: '600',
    },
    ordersTableContainer: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
    ordersTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHead: {
      background: '#C444C7',
    },
    tableHeadCell: {
      padding: '15px 12px',
      textAlign: 'left',
      fontSize: '13px',
      fontWeight: '600',
      color: 'white',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    tableRow: {
      borderBottom: '1px solid #e0e0e0',
      transition: 'background 0.2s',
      backgroundColor: '#ffffff',
    },
    tableCell: {
      padding: '15px 12px',
      fontSize: '14px',
      fontWeight: '400',
      color: '#2c3e50',
      verticalAlign: 'top',
      backgroundColor: '#FFFFFF',
    },
    noData: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#6c757d',
    },
    orderNumber: {
      fontWeight: '600',
      color: '#2c3e50',
      fontSize: '14px',
    },
    customerInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    customerName: {
      fontWeight: '600',
      color: '#2c3e50',
      fontSize: '14px',
    },
    customerContact: {
      fontSize: '13px',
      fontWeight: '400',
      color: '#6c757d',
    },
    addressInfo: {
      maxWidth: '200px',
      fontSize: '13px',
      fontWeight: '400',
      color: '#2c3e50',
      lineHeight: '1.4',
    },
    itemsPreview: {
      maxWidth: '250px',
    },
    itemPreviewRow: {
      fontSize: '13px',
      fontWeight: '400',
      color: '#2c3e50',
      marginBottom: '4px',
    },
    itemMore: {
      fontSize: '12px',
      fontWeight: '400',
      color: '#6c757d',
      fontStyle: 'italic',
      marginTop: '4px',
    },
    btnViewItems: {
      marginTop: '8px',
      padding: '6px 12px',
      background: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    orderAmount: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#2c3e50',
    },
    orderDate: {
      fontSize: '13px',
      fontWeight: '400',
      color: '#2c3e50',
      whiteSpace: 'nowrap',
    },
    statusBadge: {
      display: 'inline-block',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#2c3e50',
      backgroundColor: '#f8f9fa',
      border: '2px solid #dee2e6',
    },
    btnEdit: {
      padding: '8px 16px',
      background: '#C444C7',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    },
    modalLarge: {
      maxWidth: '900px',
    },
    modalHeader: {
      padding: '20px 25px',
      borderBottom: '2px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#f8f9fa',
      borderRadius: '12px 12px 0 0',
    },
    modalHeaderTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: '#2c3e50',
    },
    modalClose: {
      background: 'none',
      border: 'none',
      fontSize: '32px',
      fontWeight: '400',
      color: '#6c757d',
      cursor: 'pointer',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'background 0.3s',
    },
    orderItemsContainer: {
      padding: '25px',
    },
    orderMeta: {
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '25px',
    },
    metaRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #e0e0e0',
    },
    metaLabel: {
      fontWeight: '600',
      color: '#2c3e50',
      fontSize: '14px',
    },
    metaValue: {
      fontWeight: '400',
      color: '#2c3e50',
      fontSize: '14px',
      textAlign: 'right',
    },
    itemsListTitle: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '20px',
    },
    itemsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '25px',
    },
    itemCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'white',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    itemImageWrapper: {
      width: '100%',
      height: '180px',
      overflow: 'hidden',
      background: '#f5f5f5',
    },
    itemImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    itemImagePlaceholder: {
      width: '100%',
      height: '180px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      borderBottom: '1px solid #e0e0e0',
    },
    placeholderIcon: {
      fontSize: '48px',
      marginBottom: '8px',
    },
    placeholderText: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#6c757d',
    },
    itemInfo: {
      padding: '15px',
    },
    itemName: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '8px',
    },
    itemDescription: {
      fontSize: '13px',
      fontWeight: '400',
      color: '#6c757d',
      marginBottom: '10px',
      lineHeight: '1.4',
    },
    itemCategory: {
      display: 'inline-block',
      padding: '4px 10px',
      background: '#e3f2fd',
      color: '#2c3e50',
      fontSize: '11px',
      fontWeight: '500',
      borderRadius: '12px',
      marginBottom: '12px',
    },
    itemPricing: {
      borderTop: '1px solid #f0f0f0',
      paddingTop: '12px',
      marginTop: '12px',
    },
    pricingRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    pricingRowSubtotal: {
      borderTop: '1px solid #e0e0e0',
      paddingTop: '8px',
      marginTop: '8px',
    },
    pricingLabel: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#6c757d',
    },
    pricingValue: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#2c3e50',
    },
    itemInstructions: {
      marginTop: '12px',
      padding: '10px',
      background: '#fff3cd',
      borderLeft: '4px solid #ffc107',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '400',
      color: '#2c3e50',
    },
    orderSummary: {
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginTop: '20px',
    },
    summaryTitle: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '15px',
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #e0e0e0',
      fontSize: '14px',
      fontWeight: '400',
      color: '#2c3e50',
    },
    summaryRowTotal: {
      borderTop: '2px solid #2c3e50',
      paddingTop: '15px',
      marginTop: '10px',
      fontSize: '16px',
      fontWeight: '600',
    },
    formGroup: {
      marginBottom: '20px',
    },
    formLabel: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#2c3e50',
      fontSize: '14px',
    },
    formSelect: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '400',
      color: '#2c3e50',
      background: 'white',
    },
    disabledInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '400',
      background: '#f5f5f5',
      color: '#6c757d',
      cursor: 'not-allowed',
    },
    orderDetailsSummary: {
      background: '#f8f9fa',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px',
    },
    detailsSummaryTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '12px',
    },
    detailsSummaryText: {
      margin: '8px 0',
      fontSize: '14px',
      fontWeight: '400',
      color: '#2c3e50',
    },
    modalActions: {
      padding: '20px 25px',
      borderTop: '2px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      background: '#f8f9fa',
    },
    btnCancel: {
      padding: '10px 24px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s',
      background: '#6c757d',
      color: 'white',
    },
    btnSubmit: {
      padding: '10px 24px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      background: '#C444C7',
      color: 'white',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
    },
    loadingSpinner: {
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #C444C7',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      marginTop: '20px',
      fontSize: '15px',
      fontWeight: '500',
      color: '#2c3e50',
    },
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, orders]);

  // Helper function to get user name - handles both object and string
  const getUserName = (user) => {
    if (!user) return 'N/A';
    if (typeof user === 'object' && user.name) return user.name;
    if (typeof user === 'string') return 'User ID: ' + user.substring(0, 8) + '...';
    return 'N/A';
  };

  // Helper function to get user contact
  const getUserContact = (user) => {
    if (!user) return '';
    if (typeof user === 'object') return user.phone || user.email || '';
    return '';
  };

  // Helper function to get driver name
  const getDriverName = (driver) => {
    if (!driver) return 'No Driver Assigned';
    if (typeof driver === 'object' && driver.name) return driver.name;
    if (typeof driver === 'string') return 'Driver ID: ' + driver.substring(0, 8) + '...';
    return 'No Driver Assigned';
  };

  // Helper function to get restaurant name
  const getRestaurantName = (restaurant) => {
    if (!restaurant) return 'N/A';
    if (typeof restaurant === 'object' && restaurant.name) return restaurant.name;
    if (typeof restaurant === 'string') return 'Restaurant ID: ' + restaurant.substring(0, 8) + '...';
    return 'N/A';
  };

  // Helper function to get restaurant cuisine
  const getRestaurantCuisine = (restaurant) => {
    if (!restaurant) return '';
    if (typeof restaurant === 'object') return restaurant.cuisine || '';
    return '';
  };

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
        console.log('✅ Orders fetched successfully');
        console.log('Total orders:', response.data.data.length);
        
        if (response.data.data.length > 0) {
          const firstOrder = response.data.data[0];
          console.log('First order:', {
            orderNumber: firstOrder.orderNumber,
            user: firstOrder.user,
            userName: getUserName(firstOrder.user),
            driver: firstOrder.driver,
            driverName: getDriverName(firstOrder.driver),
            restaurant: firstOrder.restaurant,
            restaurantName: getRestaurantName(firstOrder.restaurant)
          });
        }
        
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      alert('Error loading orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (filter !== 'all') {
      filtered = filtered.filter(order => order.status === filter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const userName = getUserName(order.user).toLowerCase();
        const userEmail = typeof order.user === 'object' ? (order.user.email || '').toLowerCase() : '';
        const driverName = getDriverName(order.driver).toLowerCase();
        const restaurantName = getRestaurantName(order.restaurant).toLowerCase();
        
        return order.orderNumber?.toLowerCase().includes(searchLower) ||
          userName.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          driverName.includes(searchLower) ||
          restaurantName.includes(searchLower) ||
          order.items?.some(item => item.name?.toLowerCase().includes(searchLower));
      });
    }

    setFilteredOrders(filtered);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowEditModal(true);
  };

  const handleViewItems = (order) => {
    console.log('Opening items modal for order:', order.orderNumber);
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
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      alert(`Error updating order status: ${errorMessage}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
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
    return `R${parseFloat(amount || 0).toFixed(2)}`;
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

  const calculateOrderTotals = (order) => {
    const itemsSubtotal = order.items?.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0) || 0;

    const subtotal = order.subtotal || order.pricing?.subtotal || itemsSubtotal;
    const deliveryFee = order.deliveryFee || order.pricing?.deliveryFee || 0;
    const tax = order.tax || order.pricing?.tax || 0;
    
    const total = subtotal + deliveryFee + tax;

    return {
      subtotal,
      deliveryFee,
      tax,
      total
    };
  };

  const getImageUrl = (item) => {
    // First check if item has direct image property
    if (item.image) {
      if (typeof item.image === 'string') return item.image;
      if (item.image.url) return item.image.url;
      if (item.image.secure_url) return item.image.secure_url;
    }
    
    // Check images array (plural)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      if (typeof firstImage === 'string') return firstImage;
      if (firstImage.url) return firstImage.url;
      if (firstImage.secure_url) return firstImage.secure_url;
    }
    
    // If no direct image, try the populated menuItem (fallback)
    if (item.menuItem?.image) {
      if (typeof item.menuItem.image === 'string') return item.menuItem.image;
      if (item.menuItem.image.url) return item.menuItem.image.url;
      if (item.menuItem.image.secure_url) return item.menuItem.image.secure_url;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={styles.ordersPage}>
      <div style={styles.ordersHeader}>
        <h2 style={styles.ordersTitle}>Orders Management</h2>
        
        <div style={styles.searchFilterContainer}>
          <div style={styles.searchBar}>
            <input
              type="text"
              placeholder="Search by order number, customer, driver, restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button style={styles.clearSearchBtn} onClick={clearSearch}>
                ✕
              </button>
            )}
            <span style={styles.searchIcon}>🔍</span>
          </div>
        </div>

        <div style={styles.ordersFilters}>
          <button 
            style={{...styles.filterBtn, ...(filter === 'all' ? styles.filterBtnActive : {})}}
            onClick={() => setFilter('all')}
          >
            All Orders ({orders.length})
          </button>
          <button 
            style={{...styles.filterBtn, ...(filter === 'pending' ? styles.filterBtnActive : {})}}
            onClick={() => setFilter('pending')}
          >
            Pending ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            style={{...styles.filterBtn, ...(filter === 'confirmed' ? styles.filterBtnActive : {})}}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed ({orders.filter(o => o.status === 'confirmed').length})
          </button>
          <button 
            style={{...styles.filterBtn, ...(filter === 'assigned' ? styles.filterBtnActive : {})}}
            onClick={() => setFilter('assigned')}
          >
            Assigned ({orders.filter(o => o.status === 'assigned').length})
          </button>
          <button 
            style={{...styles.filterBtn, ...(filter === 'in_transit' ? styles.filterBtnActive : {})}}
            onClick={() => setFilter('in_transit')}
          >
            In Transit ({orders.filter(o => o.status === 'in_transit').length})
          </button>
          <button 
            style={{...styles.filterBtn, ...(filter === 'delivered' ? styles.filterBtnActive : {})}}
            onClick={() => setFilter('delivered')}
          >
            Delivered ({orders.filter(o => o.status === 'delivered').length})
          </button>
        </div>

        {searchTerm && (
          <div style={styles.searchResultsInfo}>
            Found {filteredOrders.length} order(s) matching "{searchTerm}"
          </div>
        )}
      </div>

      <div style={styles.ordersTableContainer}>
        <table style={styles.ordersTable}>
          <thead style={styles.tableHead}>
            <tr>
              <th style={styles.tableHeadCell}>Order Number</th>
              <th style={styles.tableHeadCell}>Customer</th>
              <th style={styles.tableHeadCell}>Driver</th>
              <th style={styles.tableHeadCell}>Restaurant</th>
              <th style={styles.tableHeadCell}>Delivery Address</th>
              <th style={styles.tableHeadCell}>Items</th>
              <th style={styles.tableHeadCell}>Total</th>
              <th style={styles.tableHeadCell}>Status</th>
              <th style={styles.tableHeadCell}>Date</th>
              <th style={styles.tableHeadCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="10" style={styles.noData}>
                  {searchTerm ? 'No orders found matching your search' : 'No orders found'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const totals = calculateOrderTotals(order);
                
                return (
                  <tr key={order._id} style={styles.tableRow}>
                    <td style={{...styles.tableCell, ...styles.orderNumber}}>{order.orderNumber}</td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.customerInfo}>
                        <div style={styles.customerName}>
                          {getUserName(order.user)}
                        </div>
                        <div style={styles.customerContact}>{getUserContact(order.user)}</div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.customerInfo}>
                        <div style={styles.customerName}>{getDriverName(order.driver)}</div>
                        <div style={styles.customerContact}>{typeof order.driver === 'object' ? order.driver?.phone || '' : ''}</div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.customerInfo}>
                        <div style={styles.customerName}>{getRestaurantName(order.restaurant)}</div>
                        <div style={styles.customerContact}>{getRestaurantCuisine(order.restaurant)}</div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.addressInfo}>
                        {formatAddress(order.deliveryAddress)}
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.itemsPreview}>
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} style={styles.itemPreviewRow}>
                            {item.name} ×{item.quantity}
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div style={styles.itemMore}>+{order.items.length - 2} more</div>
                        )}
                        <button 
                          style={styles.btnViewItems}
                          onClick={() => handleViewItems(order)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                    
                    <td style={{...styles.tableCell, ...styles.orderAmount}}>{formatCurrency(totals.total)}</td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.statusBadge}>
                        {formatStatus(order.deliveryStatus || order.status)}
                      </div>
                    </td>
                    
                    <td style={{...styles.tableCell, ...styles.orderDate}}>{formatDate(order.createdAt)}</td>
                    
                    <td style={styles.tableCell}>
                      <button 
                        style={styles.btnEdit}
                        onClick={() => handleEditOrder(order)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View Items Modal */}
      {showItemsModal && selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setShowItemsModal(false)}>
          <div style={{...styles.modalContent, ...styles.modalLarge}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalHeaderTitle}>Order Items - {selectedOrder.orderNumber}</h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowItemsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.orderItemsContainer}>
              <div style={styles.orderMeta}>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Restaurant:</span>
                  <span style={styles.metaValue}>{getRestaurantName(selectedOrder.restaurant)}</span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Customer:</span>
                  <span style={styles.metaValue}>{getUserName(selectedOrder.user)}</span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Driver:</span>
                  <span style={styles.metaValue}>{getDriverName(selectedOrder.driver)}</span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Order Date:</span>
                  <span style={styles.metaValue}>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Status:</span>
                  <span style={styles.metaValue}>
                    {formatStatus(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div>
                <h4 style={styles.itemsListTitle}>Order Items ({selectedOrder.items?.length || 0})</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div style={styles.itemsGrid}>
                    {selectedOrder.items.map((item, idx) => {
                      const imageUrl = getImageUrl(item);
                      
                      return (
                        <div key={idx} style={styles.itemCard}>
                          {imageUrl ? (
                            <div style={styles.itemImageWrapper}>
                              <img 
                                src={imageUrl} 
                                alt={item.name}
                                style={styles.itemImage}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div style={styles.itemImagePlaceholder}>
                              <span style={styles.placeholderIcon}>🍽️</span>
                              <p style={styles.placeholderText}>No Image</p>
                            </div>
                          )}
                          
                          <div style={styles.itemInfo}>
                            <h5 style={styles.itemName}>{item.name}</h5>
                            
                            {item.description && (
                              <p style={styles.itemDescription}>{item.description}</p>
                            )}
                            
                            {item.category && (
                              <span style={styles.itemCategory}>{item.category}</span>
                            )}
                            
                            <div style={styles.itemPricing}>
                              <div style={styles.pricingRow}>
                                <span style={styles.pricingLabel}>Price:</span>
                                <span style={styles.pricingValue}>{formatCurrency(item.price)}</span>
                              </div>
                              <div style={styles.pricingRow}>
                                <span style={styles.pricingLabel}>Quantity:</span>
                                <span style={styles.pricingValue}>×{item.quantity}</span>
                              </div>
                              <div style={{...styles.pricingRow, ...styles.pricingRowSubtotal}}>
                                <span style={styles.pricingLabel}><strong>Subtotal:</strong></span>
                                <span style={styles.pricingValue}><strong>{formatCurrency(item.subtotal || item.price * item.quantity)}</strong></span>
                              </div>
                            </div>
                            
                            {item.specialInstructions && (
                              <div style={styles.itemInstructions}>
                                <strong>Instructions:</strong> {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={styles.noData}>No items found in this order</p>
                )}
              </div>

              <div style={styles.orderSummary}>
                <h4 style={styles.summaryTitle}>Order Summary</h4>
                {(() => {
                  const totals = calculateOrderTotals(selectedOrder);
                  return (
                    <>
                      <div style={styles.summaryRow}>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                      </div>
                      {totals.deliveryFee > 0 && (
                        <div style={styles.summaryRow}>
                          <span>Delivery Fee:</span>
                          <span>{formatCurrency(totals.deliveryFee)}</span>
                        </div>
                      )}
                      {totals.tax > 0 && (
                        <div style={styles.summaryRow}>
                          <span>Tax:</span>
                          <span>{formatCurrency(totals.tax)}</span>
                        </div>
                      )}
                      <div style={{...styles.summaryRow, ...styles.summaryRowTotal}}>
                        <span><strong>Total:</strong></span>
                        <span><strong>{formatCurrency(totals.total)}</strong></span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                style={styles.btnCancel}
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
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalHeaderTitle}>Update Order Status</h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus} style={{padding: '25px'}}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Order Number</label>
                <input
                  type="text"
                  value={selectedOrder.orderNumber}
                  disabled
                  style={styles.disabledInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Current Status</label>
                <input
                  type="text"
                  value={formatStatus(selectedOrder.status)}
                  disabled
                  style={styles.disabledInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                  style={styles.formSelect}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="assigned">Assigned</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div style={styles.orderDetailsSummary}>
                <h4 style={styles.detailsSummaryTitle}>Order Details</h4>
                <p style={styles.detailsSummaryText}><strong>Customer:</strong> {getUserName(selectedOrder.user)}</p>
                <p style={styles.detailsSummaryText}><strong>Driver:</strong> {getDriverName(selectedOrder.driver)}</p>
                <p style={styles.detailsSummaryText}><strong>Total:</strong> {formatCurrency(calculateOrderTotals(selectedOrder).total)}</p>
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  style={styles.btnCancel}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.btnSubmit}>
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Orders;