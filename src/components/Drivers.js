import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const Drivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // Form state for new driver registration
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    country: 'South Africa',
    city: '',
    region: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    status: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, searchTerm, drivers]);

  const fetchDrivers = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/api/drivers');

      if (response.data.success) {
        console.log('✅ Fetched drivers:', response.data.data);
        setDrivers(response.data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching drivers:', err);
      alert('Error fetching drivers: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...drivers];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(driver => driver.status === filter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(driver => 
        driver.name?.toLowerCase().includes(searchLower) ||
        driver.email?.toLowerCase().includes(searchLower) ||
        driver.phone?.includes(searchTerm) ||
        driver.vehicleNumber?.toLowerCase().includes(searchLower) ||
        driver.licenseNumber?.toLowerCase().includes(searchLower) ||
        driver.vehicleType?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDrivers(filtered);
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('❌ Passwords do not match!');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      alert('❌ Password must be at least 6 characters long');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('❌ Please enter a valid email address');
      return;
    }

    // Validate phone format (basic check)
    if (formData.phone.length < 10) {
      alert('❌ Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);

    console.log('📝 Submitting driver registration:', {
      ...formData,
      password: '***hidden***',
      confirmPassword: '***hidden***'
    });

    try {
      // Don't send confirmPassword to backend
      const { confirmPassword, ...dataToSend } = formData;

      const response = await api.post('/api/drivers', dataToSend);

      console.log('✅ Server response:', response.data);

      if (response.data.success) {
        alert('✅ Driver registered successfully!');
        
        // Close modal first for better UX
        setShowAddModal(false);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          vehicleType: '',
          vehicleNumber: '',
          licenseNumber: '',
          country: 'South Africa',
          city: '',
          region: ''
        });
        
        // Refresh the drivers list to show the new driver
        console.log('🔄 Fetching updated drivers list...');
        await fetchDrivers();
        
        console.log('📊 Driver added successfully!');
      }
    } catch (err) {
      console.error('❌ Full error:', err);
      console.error('❌ Error response:', err.response?.data);
      alert('❌ ' + (err.response?.data?.message || 'Error adding driver'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setEditFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      vehicleType: driver.vehicleType,
      vehicleNumber: driver.vehicleNumber,
      licenseNumber: driver.licenseNumber,
      status: driver.status
    });
    setShowEditModal(true);
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put(
        `/api/drivers/${selectedDriver._id}`,
        editFormData
      );

      if (response.data.success) {
        alert('✅ Driver updated successfully!');
        setShowEditModal(false);
        setSelectedDriver(null);
        await fetchDrivers();
      }
    } catch (err) {
      console.error('❌ Error updating driver:', err);
      alert('❌ Error updating driver');
    }
  };

  const handleChangePassword = (driver) => {
    setSelectedDriver(driver);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await api.put(
        `/api/drivers/${selectedDriver._id}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }
      );

      if (response.data.success) {
        alert('✅ Password updated successfully!');
        setShowPasswordModal(false);
        setSelectedDriver(null);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('❌ Error updating password:', err);
      alert('❌ ' + (err.response?.data?.message || 'Error updating password'));
    }
  };

  const handleUpdateStatus = async (driverId, newStatus) => {
    try {
      const response = await api.put(
        `/api/drivers/${driverId}`,
        { status: newStatus }
      );

      if (response.data.success) {
        await fetchDrivers();
      }
    } catch (err) {
      console.error('❌ Error updating driver status:', err);
      alert('❌ Error updating driver status');
    }
  };

  const handleDeleteDriver = async (driverId, driverName) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete ${driverName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/drivers/${driverId}`);

      if (response.data.success) {
        alert('✅ Driver deleted successfully!');
        await fetchDrivers();
      }
    } catch (err) {
      console.error('❌ Error deleting driver:', err);
      alert('❌ ' + (err.response?.data?.message || 'Error deleting driver'));
    }
  };

  const handleBulkDelete = async () => {
    const inactiveDrivers = filteredDrivers.filter(d => d.status === 'inactive');
    
    if (inactiveDrivers.length === 0) {
      alert('ℹ️ No inactive drivers to delete');
      return;
    }

    if (!window.confirm(`⚠️ Delete ${inactiveDrivers.length} inactive driver(s)? This action cannot be undone.`)) {
      return;
    }

    let successCount = 0;

    for (const driver of inactiveDrivers) {
      try {
        await api.delete(`/api/drivers/${driver._id}`);
        successCount++;
      } catch (err) {
        console.error(`❌ Error deleting driver ${driver.name}:`, err);
      }
    }

    alert(`✅ Successfully deleted ${successCount} driver(s)`);
    await fetchDrivers();
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'status-badge-active',
      inactive: 'status-badge-inactive',
      busy: 'status-badge-busy'
    };
    return statusClasses[status] || 'status-badge-default';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="drivers-page">
      <div className="drivers-header">
        <h2 className="drivers-title">Drivers Management</h2>
        
        {/* Search Bar */}
        <div className="search-filter-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, email, phone, vehicle..."
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

        <div className="drivers-actions">
          <div className="drivers-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Drivers ({drivers.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({drivers.filter(d => d.status === 'active').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inactive ({drivers.filter(d => d.status === 'inactive').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'busy' ? 'active' : ''}`}
              onClick={() => setFilter('busy')}
            >
              Busy ({drivers.filter(d => d.status === 'busy').length})
            </button>
          </div>
          <div className="action-buttons-group">
            <button className="btn-bulk-delete" onClick={handleBulkDelete}>
              🗑️ Delete Inactive
            </button>
            <button className="btn-add-driver" onClick={openAddModal}>
              + Register New Driver
            </button>
          </div>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="search-results-info">
            Found {filteredDrivers.length} driver(s) matching "{searchTerm}"
          </div>
        )}
      </div>

      <div className="drivers-table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Vehicle Type</th>
              <th>Vehicle Number</th>
              <th>License Number</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Completed</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">
                  {searchTerm 
                    ? '🔍 No drivers found matching your search' 
                    : '📝 No drivers found. Click "Register New Driver" to create one.'}
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => (
                <tr key={driver._id}>
                  <td className="driver-name">{driver.name}</td>
                  <td>{driver.email}</td>
                  <td>{driver.phone}</td>
                  <td className="vehicle-type">{driver.vehicleType}</td>
                  <td>{driver.vehicleNumber}</td>
                  <td>{driver.licenseNumber}</td>
                  <td>
                    <select
                      className={`status-select ${getStatusBadgeClass(driver.status)}`}
                      value={driver.status}
                      onChange={(e) => handleUpdateStatus(driver._id, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="busy">Busy</option>
                    </select>
                  </td>
                  <td className="driver-rating">
                    ⭐ {driver.rating.toFixed(1)}
                  </td>
                  <td className="deliveries-count">{driver.completedDeliveries || 0}</td>
                  <td className="deliveries-count">{driver.activeDeliveries || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditDriver(driver)}
                        title="Edit Driver"
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-password"
                        onClick={() => handleChangePassword(driver)}
                        title="Change Password"
                      >
                        🔒
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteDriver(driver._id, driver.name)}
                        title="Delete Driver"
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

      {/* Add Driver Modal - New Registration Form */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚗 Register New Driver</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddDriver}>
              {/* Personal Information Section */}
              <div className="form-section-header">
                <h4>👤 Personal Information</h4>
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., John Doe"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="e.g., john@example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g., 0715536056"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Account Security Section */}
              <div className="form-section-header">
                <h4>🔒 Account Security</h4>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Min 6 characters"
                    required
                    minLength="6"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Re-enter password"
                    required
                    minLength="6"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className="form-section-header">
                <h4>📍 Location</h4>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    placeholder="South Africa"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="e.g., Johannesburg"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Region/Province</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  placeholder="e.g., Gauteng"
                  disabled={isSubmitting}
                />
              </div>

              {/* Vehicle Information Section */}
              <div className="form-section-header">
                <h4>🚙 Vehicle Information</h4>
              </div>

              <div className="form-group">
                <label>Vehicle Type *</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select vehicle type</option>
                  <option value="car">🚗 Car</option>
                  <option value="bike">🏍️ Bike</option>
                  <option value="truck">🚚 Truck</option>
                  <option value="van">🚐 Van</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Number *</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                    placeholder="e.g., ABC 123 GP"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>License Number *</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    placeholder="e.g., DL123456"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '⏳ Registering Driver...' : '✅ Register Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && selectedDriver && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Driver - {selectedDriver.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateDriver}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Type *</label>
                <select
                  value={editFormData.vehicleType}
                  onChange={(e) => setEditFormData({...editFormData, vehicleType: e.target.value})}
                  required
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                </select>
              </div>

              <div className="form-group">
                <label>Vehicle Number *</label>
                <input
                  type="text"
                  value={editFormData.vehicleNumber}
                  onChange={(e) => setEditFormData({...editFormData, vehicleNumber: e.target.value})}
                  placeholder="e.g., ABC 123 GP"
                  required
                />
              </div>

              <div className="form-group">
                <label>License Number *</label>
                <input
                  type="text"
                  value={editFormData.licenseNumber}
                  onChange={(e) => setEditFormData({...editFormData, licenseNumber: e.target.value})}
                  placeholder="e.g., DL123456"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="busy">Busy</option>
                </select>
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
                  Update Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedDriver && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password - {selectedDriver.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Current Password (optional)</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                  required
                  minLength="6"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  🔒 Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;