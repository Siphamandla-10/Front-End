// src/components/AddRestaurant.jsx
import React, { useState } from 'react';
import api from '../config/api';
import './AddRestaurant.css';

const AddRestaurant = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    // Vendor Information
    vendorEmail: '',
    vendorName: '',
    vendorPhone: '',
    vendorPassword: 'vendor123', // Default password
    
    // Restaurant Information
    name: '',
    description: '',
    cuisine: '',
    deliveryFee: '',
    minimumOrder: '',
    contactPhone: '',
    contactEmail: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          alert('✅ Location set successfully!');
        },
        (error) => {
          setFormData(prev => ({
            ...prev,
            latitude: -26.2041,
            longitude: 28.0473
          }));
          alert('Using default location: Johannesburg');
        }
      );
    } else {
      setFormData(prev => ({
        ...prev,
        latitude: -26.2041,
        longitude: 28.0473
      }));
      alert('Geolocation not supported. Using Johannesburg as default.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.vendorEmail || !formData.vendorName || !formData.name) {
      setError('Vendor email, vendor name, and restaurant name are required');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append images if selected
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      console.log('📤 Creating restaurant...');

      const response = await api.post(
        '/api/restaurants',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('✅ Restaurant and vendor created successfully!\n\nVendor Login:\nEmail: ' + formData.vendorEmail + '\nPassword: vendor123');
        onSuccess(response.data.data);
      }
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError(
        err.response?.data?.message || 
        'Failed to create restaurant. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-restaurant-container">
      <div className="add-restaurant-header">
        <h2>Add New Restaurant</h2>
        <button className="btn-back" onClick={onCancel}>
          ← Back to List
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form className="add-restaurant-form" onSubmit={handleSubmit}>
        {/* Vendor Information */}
        <div className="form-section">
          <h3 className="section-title">👤 Vendor Information</h3>
          <p className="section-note">Create a new vendor account or use existing email</p>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vendorEmail">Vendor Email *</label>
              <input
                type="email"
                id="vendorEmail"
                name="vendorEmail"
                className="form-input"
                placeholder="vendor@example.com"
                value={formData.vendorEmail}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <small>If email exists, will use existing vendor. Otherwise, creates new vendor.</small>
            </div>

            <div className="form-group">
              <label htmlFor="vendorName">Vendor Name *</label>
              <input
                type="text"
                id="vendorName"
                name="vendorName"
                className="form-input"
                placeholder="John Doe"
                value={formData.vendorName}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <small>Required for new vendors</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vendorPhone">Vendor Phone</label>
              <input
                type="tel"
                id="vendorPhone"
                name="vendorPhone"
                className="form-input"
                placeholder="+27 12 345 6789"
                value={formData.vendorPhone}
                onChange={handleChange}
                disabled={loading}
              />
              <small>Optional - defaults to +27000000000</small>
            </div>

            <div className="form-group">
              <label htmlFor="vendorPassword">Vendor Password</label>
              <input
                type="text"
                id="vendorPassword"
                name="vendorPassword"
                className="form-input"
                placeholder="vendor123"
                value={formData.vendorPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <small>Default: vendor123 (for new vendors only)</small>
            </div>
          </div>
        </div>

        {/* Restaurant Information */}
        <div className="form-section">
          <h3 className="section-title">🏪 Restaurant Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Restaurant Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Enter restaurant name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cuisine">Cuisine Type</label>
              <input
                type="text"
                id="cuisine"
                name="cuisine"
                className="form-input"
                placeholder="e.g., Italian, Chinese, Fast Food"
                value={formData.cuisine}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Describe the restaurant..."
              rows="4"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="deliveryFee">Delivery Fee (R)</label>
              <input
                type="number"
                id="deliveryFee"
                name="deliveryFee"
                className="form-input"
                placeholder="0"
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
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.minimumOrder}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3 className="section-title">📞 Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactPhone">Phone</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                className="form-input"
                placeholder="+27 12 345 6789"
                value={formData.contactPhone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail">Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                className="form-input"
                placeholder="contact@restaurant.com"
                value={formData.contactEmail}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3 className="section-title">📍 Address</h3>
          <div className="form-group">
            <label htmlFor="street">Street Address</label>
            <input
              type="text"
              id="street"
              name="street"
              className="form-input"
              placeholder="123 Main Street"
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
                placeholder="Johannesburg"
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
                placeholder="Gauteng"
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
                placeholder="2000"
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
                placeholder="-26.2041"
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
                placeholder="28.0473"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="button" 
            className="btn-location"
            onClick={getLocation}
            disabled={loading}
          >
            {formData.latitude && formData.longitude 
              ? `✅ Location Set (${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)})`
              : '📍 Get Current Location'}
          </button>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3 className="section-title">📸 Images (Optional)</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="profileImage">Profile Image</label>
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
                  <img src={profilePreview} alt="Profile preview" />
                  <button 
                    type="button" 
                    className="btn-remove-image"
                    onClick={() => {
                      setProfileImage(null);
                      setProfilePreview(null);
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="coverImage">Cover Image</label>
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleCoverImageChange}
                disabled={loading}
                className="form-input-file"
              />
              {coverPreview && (
                <div className="image-preview cover">
                  <img src={coverPreview} alt="Cover preview" />
                  <button 
                    type="button" 
                    className="btn-remove-image"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview(null);
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>
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
              'Create Restaurant & Vendor'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRestaurant;