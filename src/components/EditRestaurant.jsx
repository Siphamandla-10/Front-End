// src/components/EditRestaurant.jsx
import React, { useState } from 'react';
import api from '../config/api';
import './AddRestaurant.css'; // Reuse the same styles

const EditRestaurant = ({ restaurant, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    description: restaurant.description || '',
    cuisine: restaurant.cuisine || '',
    phone: restaurant.contact?.phone || '',
    email: restaurant.contact?.email || '',
    street: restaurant.address?.street || '',
    city: restaurant.address?.city || '',
    state: restaurant.address?.state || '',
    zipCode: restaurant.address?.zipCode || '',
    latitude: restaurant.address?.coordinates?.latitude || -26.2041,
    longitude: restaurant.address?.coordinates?.longitude || 28.0473,
    deliveryFee: restaurant.deliveryFee || 0,
    minimumOrder: restaurant.minimumOrder || 0
  });

  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(restaurant.image || null);
  const [coverPreview, setCoverPreview] = useState(restaurant.coverImage || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.cuisine || !formData.phone || !formData.email) {
      setError('Name, cuisine, phone, and email are required');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add images if new ones are selected
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      console.log('📤 Updating restaurant...');

      const response = await api.put(
        `/api/restaurants/${restaurant._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('✅ Restaurant updated successfully!');
        onSuccess();
      }
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError(
        err.response?.data?.message || 
        'Failed to update restaurant. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-restaurant-container">
      <div className="add-restaurant-header">
        <h2>Edit Restaurant - {restaurant.name}</h2>
        <button className="btn-back" onClick={onCancel}>
          ← Back to Restaurants
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form className="add-restaurant-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Restaurant Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cuisine">Cuisine Type *</label>
            <input
              type="text"
              id="cuisine"
              name="cuisine"
              className="form-input"
              placeholder="e.g., Italian, Chinese, Fast Food"
              value={formData.cuisine}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3 className="section-title">Contact Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="form-section">
          <h3 className="section-title">Address</h3>
          
          <div className="form-group">
            <label htmlFor="street">Street Address</label>
            <input
              type="text"
              id="street"
              name="street"
              className="form-input"
              value={formData.street}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State/Province</label>
              <input
                type="text"
                id="state"
                name="state"
                className="form-input"
                value={formData.state}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="zipCode">Zip Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                className="form-input"
                value={formData.zipCode}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                className="form-input"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                className="form-input"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="form-section">
          <h3 className="section-title">Delivery Settings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="deliveryFee">Delivery Fee (R)</label>
              <input
                type="number"
                id="deliveryFee"
                name="deliveryFee"
                className="form-input"
                min="0"
                step="0.01"
                value={formData.deliveryFee}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="minimumOrder">Minimum Order (R)</label>
              <input
                type="number"
                id="minimumOrder"
                name="minimumOrder"
                className="form-input"
                min="0"
                step="0.01"
                value={formData.minimumOrder}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3 className="section-title">Images</h3>
          
          <div className="form-group">
            <label htmlFor="profileImage">Profile Image (Logo)</label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleProfileImageChange}
              disabled={loading}
              className="form-input-file"
            />
            {profilePreview && (
              <div className="image-preview">
                <img src={profilePreview} alt="Profile Preview" />
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={() => {
                    setProfileImage(null);
                    setProfilePreview(restaurant.image || null);
                  }}
                >
                  ✕ Remove New Image
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">Cover Image (Banner)</label>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={handleCoverImageChange}
              disabled={loading}
              className="form-input-file"
            />
            {coverPreview && (
              <div className="image-preview">
                <img src={coverPreview} alt="Cover Preview" />
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverPreview(restaurant.coverImage || null);
                  }}
                >
                  ✕ Remove New Image
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
                Updating...
              </>
            ) : (
              'Update Restaurant'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRestaurant;