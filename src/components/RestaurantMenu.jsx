// src/components/RestaurantMenu.jsx
import React, { useState, useEffect } from 'react';
import api from '../config/api';
import AddMenuItem from './AddMenuItem';
import EditMenuItem from './EditMenuItem';
import './RestaurantMenu.css';

const RestaurantMenu = ({ restaurant, onBack }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('');

  const categories = [
    'Appetizers', 'Main Course', 'Desserts', 'Beverages',
    'Sides', 'Salads', 'Soups', 'Pizza', 'Burgers',
    'Sandwiches', 'Pasta', 'Seafood', 'Vegetarian', 'Specials'
  ];

  useEffect(() => {
    fetchMenuItems();
  }, [filterCategory, filterAvailable]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterAvailable) params.append('available', filterAvailable);

      const response = await api.get(`/api/menu/restaurant/${restaurant._id}?${params}`);

      if (response.data.success) {
        setMenuItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      const response = await api.patch(`/api/menu/${itemId}/toggle-availability`, {});

      if (response.data.success) {
        alert(response.data.message);
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to toggle availability');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this menu item?\n\nThis action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.delete(`/api/menu/${itemId}`);

      if (response.data.success) {
        setMenuItems(prev => prev.filter(item => item._id !== itemId));
        alert('✅ Menu item deleted successfully');
        fetchMenuItems();
      }
    } catch (error) {
      console.error('❌ Error deleting menu item:', error);
      alert(error.response?.data?.message || 'Failed to delete menu item');
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchMenuItems();
  };

  const handleEditSuccess = () => {
    setEditingItem(null);
    fetchMenuItems();
  };

  // Show Add Form
  if (showAddForm) {
    return (
      <AddMenuItem
        restaurant={restaurant}
        onSuccess={handleAddSuccess}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  // Show Edit Form
  if (editingItem) {
    return (
      <EditMenuItem
        menuItem={editingItem}
        restaurant={restaurant}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditingItem(null)}
      />
    );
  }

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="restaurant-menu-container">
      <div className="menu-header">
        <div className="menu-header-left">
          <button className="btn-back" onClick={onBack}>
            ← Back to Restaurants
          </button>
          <div className="menu-title-section">
            <h2>{restaurant.name} - Menu</h2>
            <p className="menu-subtitle">{restaurant.cuisine}</p>
          </div>
        </div>
        <button className="btn-add-item" onClick={() => setShowAddForm(true)}>
          + Add Menu Item
        </button>
      </div>

      <div className="menu-filters">
        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterAvailable}
          onChange={(e) => setFilterAvailable(e.target.value)}
        >
          <option value="">All Items</option>
          <option value="true">Available Only</option>
          <option value="false">Unavailable Only</option>
        </select>

        <div className="menu-stats">
          <span className="stat-badge">
            📋 {menuItems.length} Items
          </span>
          <span className="stat-badge">
            ✅ {menuItems.filter(i => i.isAvailable).length} Available
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="empty-state">
          <p>No menu items found</p>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            Add Your First Menu Item
          </button>
        </div>
      ) : (
        <div className="menu-content">
          {Object.keys(groupedItems).sort().map(category => (
            <div key={category} className="category-section">
              <h3 className="category-title">{category}</h3>
              <div className="menu-items-grid">
                {groupedItems[category].map(item => (
                  <div key={item._id} className="menu-item-card">
                    {item.image?.url && (
                      <div className="menu-item-image-container">
                        <img
                          src={item.image.url}
                          alt={item.name}
                          className="menu-item-image"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="no-image">📷</div>';
                          }}
                        />
                      </div>
                    )}

                    <div className="menu-item-content">
                      <div className="menu-item-header">
                        <h4 className="menu-item-name">{item.name}</h4>
                        <span className="menu-item-price">R{item.price.toFixed(2)}</span>
                      </div>

                      <p className="menu-item-description">{item.description}</p>

                      <div className="menu-item-badges">
                        {item.isVegetarian && (
                          <span className="badge badge-green">🌱 Vegetarian</span>
                        )}
                        {item.isVegan && (
                          <span className="badge badge-green">🌿 Vegan</span>
                        )}
                        {item.isGlutenFree && (
                          <span className="badge badge-blue">🌾 Gluten Free</span>
                        )}
                        {item.spiceLevel !== 'None' && (
                          <span className="badge badge-red">🌶️ {item.spiceLevel}</span>
                        )}
                      </div>

                      <div className="menu-item-details">
                        <span className="detail-text">⏱️ {item.preparationTime} min</span>
                        {item.calories && (
                          <span className="detail-text">🔥 {item.calories} cal</span>
                        )}
                        {item.rating?.count > 0 && (
                          <span className="detail-text">⭐ {item.rating.average.toFixed(1)} ({item.rating.count})</span>
                        )}
                      </div>

                      <div className="menu-item-status">
                        <span className={`status-badge ${item.isAvailable ? 'available' : 'unavailable'}`}>
                          {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
                        </span>
                        {item.orderCount > 0 && (
                          <span className="order-count">📦 {item.orderCount} orders</span>
                        )}
                      </div>

                      <div className="menu-item-actions">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-action btn-toggle"
                          onClick={() => handleToggleAvailability(item._id)}
                        >
                          {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(item._id)}
                          disabled={loading}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;