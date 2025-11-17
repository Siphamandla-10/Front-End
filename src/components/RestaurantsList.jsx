// src/components/RestaurantsList.jsx
import React, { useState, useEffect } from 'react';
import api from '../config/api';
import AddRestaurant from './AddRestaurant';
import EditRestaurant from './EditRestaurant';
import RestaurantMenu from './RestaurantMenu';
import './RestaurantsList.css';

const RestaurantsList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRestaurants();
  }, [currentPage, searchTerm, filterStatus, filterActive]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      if (filterActive) params.append('isActive', filterActive);

      const response = await api.get(`/api/restaurants?${params}`);

      if (response.data.success) {
        setRestaurants(response.data.data);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      alert('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (restaurantId) => {
    try {
      const response = await api.patch(`/api/restaurants/${restaurantId}/toggle-status`, {});

      if (response.data.success) {
        alert(response.data.message);
        fetchRestaurants();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle restaurant status');
    }
  };

  const handleDelete = async (restaurantId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this restaurant?\n\nThis action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.delete(`/api/restaurants/${restaurantId}`);

      if (response.data.success) {
        setRestaurants(prev => prev.filter(r => r._id !== restaurantId));
        alert('✅ Restaurant deleted successfully');
        fetchRestaurants();
      }
    } catch (error) {
      console.error('❌ Error deleting restaurant:', error);
      alert(error.response?.data?.message || 'Failed to delete restaurant');
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchRestaurants();
  };

  const handleEditSuccess = () => {
    setEditingRestaurant(null);
    fetchRestaurants();
  };

  const handleViewMenu = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
  };

  // Show menu if restaurant is selected
  if (selectedRestaurant) {
    return (
      <RestaurantMenu
        restaurant={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
      />
    );
  }

  // Show edit form if editing
  if (editingRestaurant) {
    return (
      <EditRestaurant
        restaurant={editingRestaurant}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditingRestaurant(null)}
      />
    );
  }

  // Show add form
  if (showAddForm) {
    return (
      <AddRestaurant 
        onSuccess={handleAddSuccess}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div className="restaurants-container">
      <div className="restaurants-header">
        <h2>Restaurants Management</h2>
        <button 
          className="btn-add-restaurant"
          onClick={() => setShowAddForm(true)}
        >
          + Add Restaurant
        </button>
      </div>

      {/* Filters */}
      <div className="restaurants-filters">
        <input
          type="text"
          placeholder="Search by name or cuisine..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="busy">Busy</option>
        </select>

        <select 
          className="filter-select"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
        >
          <option value="">All (Active & Inactive)</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* Restaurants List */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <p>No restaurants found</p>
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add Your First Restaurant
          </button>
        </div>
      ) : (
        <>
          <div className="restaurants-grid">
            {restaurants.map(restaurant => (
              <div key={restaurant._id} className="restaurant-card">
                {restaurant.coverImage && (
                  <img 
                    src={restaurant.coverImage} 
                    alt={restaurant.name}
                    className="restaurant-cover"
                  />
                )}
                
                <div className="restaurant-content">
                  <div className="restaurant-header-info">
                    {restaurant.image && (
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="restaurant-logo"
                      />
                    )}
                    <div>
                      <h3 className="restaurant-name">{restaurant.name}</h3>
                      <p className="restaurant-cuisine">{restaurant.cuisine}</p>
                    </div>
                  </div>

                  <p className="restaurant-description">
                    {restaurant.description || 'No description available'}
                  </p>

                  <div className="restaurant-details">
                    <div className="detail-item">
                      <span className="detail-label">Delivery Fee:</span>
                      <span className="detail-value">R{restaurant.deliveryFee}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Min Order:</span>
                      <span className="detail-value">R{restaurant.minimumOrder}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Rating:</span>
                      <span className="detail-value">⭐ {restaurant.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="restaurant-vendor">
                    <span className="vendor-label">Vendor:</span>
                    <span className="vendor-name">
                      {restaurant.vendor?.name || 'Unknown'}
                    </span>
                  </div>

                  <div className="restaurant-status-row">
                    <span className={`status-badge status-${restaurant.status}`}>
                      {restaurant.status}
                    </span>
                    <span className={`active-badge ${restaurant.isActive ? 'active' : 'inactive'}`}>
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="restaurant-actions">
                    <button 
                      className="btn-action btn-menu"
                      onClick={() => handleViewMenu(restaurant)}
                    >
                      📋 Menu
                    </button>
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEdit(restaurant)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-action btn-toggle"
                      onClick={() => handleToggleStatus(restaurant._id)}
                    >
                      {restaurant.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(restaurant._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantsList;