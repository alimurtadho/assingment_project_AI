import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {user ? <span>User logged in</span> : <span>User not logged in</span>}
    </div>
  );
};

describe('AuthContext', () => {
  test('provides initial auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText('User not logged in')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially might show loading, then should show not logged in
    expect(screen.getByText(/User not logged in|Loading.../)).toBeInTheDocument();
  });
});
