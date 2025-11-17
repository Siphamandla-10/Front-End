// src/components/AddMenuItem.jsx
import React, { useState } from 'react';
import api from '../config/api';
import './AddMenuItem.css';

const AddMenuItem = ({ restaurant, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    preparationTime: '15',
    calories: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: 'None'
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Appetizers', 'Main Course', 'Desserts', 'Beverages',
    'Sides', 'Salads', 'Soups', 'Pizza', 'Burgers',
    'Sandwiches', 'Pasta', 'Seafood', 'Vegetarian', 'Specials'
  ];

  const spiceLevels = ['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.description || !formData.category || !formData.price) {
      setError('Name, description, category, and price are required');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('restaurantId', restaurant._id);
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      if (image) {
        formDataToSend.append('image', image);
      }

      console.log('📤 Creating menu item...');

      const response = await api.post(
        '/api/menu',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('✅ Menu item created successfully!');
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating menu item:', err);
      setError(
        err.response?.data?.message || 
        'Failed to create menu item. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-menu-item-container">
      <div className="add-menu-item-header">
        <h2>Add Menu Item - {restaurant.name}</h2>
        <button className="btn-back" onClick={onCancel}>
          ← Back to Menu
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form className="add-menu-item-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="e.g., Cheeseburger"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Describe the menu item..."
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (R) *</label>
              <input
                type="number"
                id="price"
                name="price"
                className="form-input"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="form-section">
          <h3 className="section-title">Additional Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preparationTime">Preparation Time (minutes)</label>
              <input
                type="number"
                id="preparationTime"
                name="preparationTime"
                className="form-input"
                placeholder="15"
                min="0"
                value={formData.preparationTime}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="calories">Calories</label>
              <input
                type="number"
                id="calories"
                name="calories"
                className="form-input"
                placeholder="Optional"
                min="0"
                value={formData.calories}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="spiceLevel">Spice Level</label>
              <select
                id="spiceLevel"
                name="spiceLevel"
                className="form-input"
                value={formData.spiceLevel}
                onChange={handleChange}
                disabled={loading}
              >
                {spiceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dietary Options */}
        <div className="form-section">
          <h3 className="section-title">Dietary Options</h3>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isVegetarian"
                checked={formData.isVegetarian}
                onChange={handleChange}
                disabled={loading}
              />
              <span>🌱 Vegetarian</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isVegan"
                checked={formData.isVegan}
                onChange={handleChange}
                disabled={loading}
              />
              <span>🌿 Vegan</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isGlutenFree"
                checked={formData.isGlutenFree}
                onChange={handleChange}
                disabled={loading}
              />
              <span>🌾 Gluten Free</span>
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div className="form-section">
          <h3 className="section-title">Image (Optional)</h3>
          
          <div className="form-group">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              className="form-input-file"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              'Create Menu Item'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMenuItem;