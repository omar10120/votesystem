import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials, UserLoginData, OTPVerification } from '../types/types';


type LoginMode = 'admin' | 'user' | 'otp' | 'magic';

const LoginPage: React.FC = () => {
  const { adminLogin, userLogin, verifyOTP, isLoading, error, clearError } = useAuth();
  const [mode, setMode] = useState<LoginMode>('admin');
  
  // Admin login state
  const [adminCredentials, setAdminCredentials] = useState<LoginCredentials>({
    userName: '',
    password: '',
  });

  // User login state
  const [userData, setUserData] = useState<UserLoginData>({
    email: '',
    phone: '',
  });

  // OTP verification state
  const [otpData, setOtpData] = useState<OTPVerification>({
    identifier: '',
    otp: '',
  });

  // Magic link state
  const [magicLinkEmail, setMagicLinkEmail] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await adminLogin(adminCredentials);
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const identifier = userData.email || userData.phone;
    if (!identifier) {
      return;
    }
    await userLogin(userData);
    setOtpData(prev => ({ ...prev, identifier }));
    setMode('otp');
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await verifyOTP(otpData);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    // Magic link implementation would go here
    console.log('Magic link sent to:', magicLinkEmail);
  };

  const resetForm = () => {
    setAdminCredentials({ userName: '', password: '' });
    setUserData({ email: '', phone: '' });
    setOtpData({ identifier: '', otp: '' });
    setMagicLinkEmail('');
    clearError();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Voting System Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your login method
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex space-x-2">
          <button
            onClick={() => { setMode('admin'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              mode === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => { setMode('user'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              mode === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            User
          </button>
          <button
            onClick={() => { setMode('magic'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              mode === 'magic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Admin Login Form */}
        {mode === 'admin' && (
          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="admin-username" className="sr-only">
                  Username
                </label>
                <input
                  id="admin-username"
                  name="userName"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={adminCredentials.userName}
                  onChange={(e) => setAdminCredentials(prev => ({ ...prev, userName: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="sr-only">
                  Password
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in as Admin
              </button>
            </div>
          </form>
        )}

        {/* User Login Form */}
        {mode === 'user' && (
          <form className="mt-8 space-y-6" onSubmit={handleUserLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="user-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address (optional)"
                  value={userData.email}
                  onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="user-phone" className="sr-only">
                  Phone number
                </label>
                <input
                  id="user-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Phone number (optional)"
                  value={userData.phone}
                  onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!userData.email && !userData.phone}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send OTP
              </button>
            </div>
          </form>
        )}

        {/* OTP Verification Form */}
        {mode === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleOTPVerification}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP sent to {otpData.identifier}
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter 6-digit OTP"
                  value={otpData.otp}
                  onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value }))}
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setMode('user'); resetForm(); }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Verify OTP
              </button>
            </div>
          </form>
        )}

        {/* Magic Link Form */}
        {mode === 'magic' && (
          <form className="mt-8 space-y-6" onSubmit={handleMagicLink}>
            <div>
              <label htmlFor="magic-email" className="sr-only">
                Email address
              </label>
              <input
                id="magic-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Magic Link
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
