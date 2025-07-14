import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { RegisterData } from '../types';
import './AuthForm.css';

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterData>();
  const { register: registerUser, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string>('');

  const onSubmit = async (data: RegisterData) => {
    try {
      setSubmitError('');
      await registerUser(data);
      navigate('/dashboard');
    } catch (error: any) {
      setSubmitError(error.message);
    }
  };

  const password = watch('password');

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Sign up to get started</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email'
                }
              })}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)/,
                  message: 'Password must contain at least one letter and one number'
                }
              })}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              id="confirm_password"
              type="password"
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              className={errors.confirm_password ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirm_password && <span className="error-message">{errors.confirm_password.message}</span>}
          </div>

          {(error || submitError) && (
            <div className="error-message">
              {error || submitError}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
