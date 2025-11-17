import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.css';

function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <div className="sparkle sparkle-1">📦</div>
      <div className="sparkle sparkle-2">🚀</div>
      <div className="sparkle sparkle-3">⚡</div>
      
      <div className="welcome-content">
        <div className="logo">D</div>
        
        <h1 className="welcome-title">Deliver Fast.</h1>
        <h2 className="welcome-subtitle">Earn More.</h2>
        
        <div className="app-name">DELIVER NOW</div>
        
        <p className="welcome-description">
          Your packages delivered in minutes. Connect with local couriers 
          and get instant, affordable delivery on every order.
        </p>
        
        <div className="button-group">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;