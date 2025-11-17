import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, customers]);

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/api/customers');

      if (response.data.success) {
        console.log('✅ Fetched customers:', response.data.data);
        setCustomers(response.data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching customers:', err);
      alert('Error fetching customers: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...customers];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(customer => customer.status === filter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm)
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleViewCustomer = async (customerId) => {
    try {
      const response = await api.get(`/api/customers/${customerId}`);

      if (response.data.success) {
        setSelectedCustomer(response.data.data);
        setShowViewModal(true);
      }
    } catch (err) {
      console.error('❌ Error fetching customer details:', err);
      alert('Error fetching customer details');
    }
  };

  const handleUpdateStatus = async (customerId, newStatus) => {
    try {
      const response = await api.put(
        `/api/customers/${customerId}`,
        { status: newStatus }
      );

      if (response.data.success) {
        await fetchCustomers();
      }
    } catch (err) {
      console.error('❌ Error updating customer status:', err);
      alert('❌ Error updating customer status');
    }
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete ${customerName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/customers/${customerId}`);

      if (response.data.success) {
        alert('✅ Customer deleted successfully!');
        await fetchCustomers();
      }
    } catch (err) {
      console.error('❌ Error deleting customer:', err);
      alert('❌ ' + (err.response?.data?.message || 'Error deleting customer'));
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'status-badge-active',
      inactive: 'status-badge-inactive'
    };
    return statusClasses[status] || 'status-badge-default';
  };

  const formatCurrency = (amount) => {
    return `R${amount.toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="customers-header">
        <h2 className="customers-title">Customers Management</h2>
        
        {/* Search Bar */}
        <div className="search-filter-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
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

        <div className="customers-actions">
          <div className="customers-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Customers ({customers.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({customers.filter(c => c.status === 'active').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inactive ({customers.filter(c => c.status === 'inactive').length})
            </button>
          </div>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="search-results-info">
            Found {filteredCustomers.length} customer(s) matching "{searchTerm}"
          </div>
        )}
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Total Orders</th>
              <th>Completed</th>
              <th>Active Orders</th>
              <th>Total Spent</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  {searchTerm 
                    ? '🔍 No customers found matching your search' 
                    : '📝 No customers found.'}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td className="customer-name">{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <select
                      className={`status-select ${getStatusBadgeClass(customer.status)}`}
                      value={customer.status}
                      onChange={(e) => handleUpdateStatus(customer._id, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="orders-count">{customer.totalOrders || 0}</td>
                  <td className="orders-count">{customer.completedOrders || 0}</td>
                  <td className="orders-count">{customer.activeOrders || 0}</td>
                  <td className="customer-spent">{formatCurrency(customer.totalSpent || 0)}</td>
                  <td className="joined-date">{formatDate(customer.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => handleViewCustomer(customer._id)}
                        title="View Details"
                      >
                        View
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                        title="Delete Customer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Details - {selectedCustomer.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="customer-details">
              {/* Personal Information */}
              <div className="details-section">
                <h4>👤 Personal Information</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedCustomer.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedCustomer.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedCustomer.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedCustomer.status)}`}>
                      {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Verified:</span>
                    <span className="detail-value">
                      {selectedCustomer.isVerified ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Joined:</span>
                    <span className="detail-value">{formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Order Statistics */}
              <div className="details-section">
                <h4>📊 Order Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-label">Total Orders</div>
                    <div className="stat-number">{selectedCustomer.totalOrders || 0}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Completed</div>
                    <div className="stat-number">{selectedCustomer.completedOrders || 0}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Active</div>
                    <div className="stat-number">{selectedCustomer.activeOrders || 0}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Total Spent</div>
                    <div className="stat-number">{formatCurrency(selectedCustomer.totalSpent || 0)}</div>
                  </div>
                </div>
              </div>

              {/* Location */}
              {selectedCustomer.location && (selectedCustomer.location.city || selectedCustomer.location.region) && (
                <div className="details-section">
                  <h4>📍 Location</h4>
                  <div className="details-grid">
                    {selectedCustomer.location.city && (
                      <div className="detail-item">
                        <span className="detail-label">City:</span>
                        <span className="detail-value">{selectedCustomer.location.city}</span>
                      </div>
                    )}
                    {selectedCustomer.location.region && (
                      <div className="detail-item">
                        <span className="detail-label">Region:</span>
                        <span className="detail-value">{selectedCustomer.location.region}</span>
                      </div>
                    )}
                    {selectedCustomer.location.country && (
                      <div className="detail-item">
                        <span className="detail-label">Country:</span>
                        <span className="detail-value">{selectedCustomer.location.country}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 && (
                <div className="details-section">
                  <h4>📦 Recent Orders</h4>
                  <div className="recent-orders-list">
                    {selectedCustomer.recentOrders.map((order, index) => (
                      <div key={index} className="recent-order-item">
                        <div className="order-info">
                          <span className="order-number">{order.orderNumber}</span>
                          <span className="order-restaurant">{order.restaurant?.name}</span>
                        </div>
                        <div className="order-meta">
                          <span className="order-amount">{formatCurrency(order.totalAmount)}</span>
                          <span className={`order-status status-${order.status}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;