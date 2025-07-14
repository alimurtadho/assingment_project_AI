import React from 'react';
import { useAuth } from '../AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome back!</h2>
          <p>You have successfully logged in to your account.</p>
        </div>
        
        <div className="user-info-card">
          <h3>User Information</h3>
          <div className="user-details">
            <div className="detail-item">
              <strong>Email:</strong> {user?.email}
            </div>
            <div className="detail-item">
              <strong>User ID:</strong> {user?.id}
            </div>
            <div className="detail-item">
              <strong>Account Status:</strong> 
              <span className={`status ${user?.is_active ? 'active' : 'inactive'}`}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="detail-item">
              <strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="features-card">
          <h3>Available Features</h3>
          <ul>
            <li>Secure JWT Authentication</li>
            <li>Protected Routes</li>
            <li>Token Refresh</li>
            <li>User Profile Management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
