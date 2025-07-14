import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="hero-section">
          <h1 className="hero-title">Welcome to AuthApp</h1>
          <p className="hero-subtitle">
            A secure and modern authentication system built with React and FastAPI
          </p>
          <p className="hero-description">
            Experience seamless user authentication with JWT tokens, secure password handling,
            and a beautiful, responsive interface.
          </p>
        </div>
        
        <div className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🔐 Secure Authentication</h3>
              <p>JWT-based authentication with bcrypt password hashing</p>
            </div>
            <div className="feature-card">
              <h3>🔄 Token Refresh</h3>
              <p>Automatic token refresh for seamless user experience</p>
            </div>
            <div className="feature-card">
              <h3>📱 Responsive Design</h3>
              <p>Beautiful UI that works on all devices</p>
            </div>
            <div className="feature-card">
              <h3>⚡ Fast & Modern</h3>
              <p>Built with React TypeScript and FastAPI</p>
            </div>
          </div>
        </div>
        
        <div className="cta-section">
          <h2>Get Started</h2>
          <p>Ready to experience secure authentication?</p>
          <div className="cta-buttons">
            <Link to="/login" className="cta-button primary">
              Sign In
            </Link>
            <Link to="/register" className="cta-button secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
