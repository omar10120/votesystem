import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials, UserLoginData } from '../types/types';


type LoginMode = 'admin' | 'user' | 'request-otp' | 'magic';

const LoginPage: React.FC = () => {
  const { adminLogin, userLoginWithEmail, requestEmailOTP, isLoading, error, clearError } = useAuth();
  const [mode, setMode] = useState<LoginMode>('admin');
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  
  // Admin login state
  const [adminCredentials, setAdminCredentials] = useState<LoginCredentials>({
    userName: '',
    password: '',
  });

  // User login state
  const [userData, setUserData] = useState<UserLoginData>({
    email: '',
    phone: '',
    otp: '',
  });

  // Magic link state
  const [magicLinkEmail, setMagicLinkEmail] = useState('');

  // Request OTP state
  const [requestOTPEmail, setRequestOTPEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await adminLogin(adminCredentials);
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!userData.email || !userData.otp) {
      return;
    }
    await userLoginWithEmail(userData.email, userData.otp);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    // Magic link implementation would go here
    console.log('Magic link sent to:', magicLinkEmail);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!requestOTPEmail) {
      return;
    }
    setIsRequestingOTP(true);
    try {
      await requestEmailOTP(requestOTPEmail);
      setRequestOTPEmail(''); // Clear email after sending OTP
      setOtpSent(true);
    } catch {
      // Error is handled by the auth context
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const resetForm = () => {
    setAdminCredentials({ userName: '', password: '' });
    setUserData({ email: '', phone: '', otp: '' });
    setMagicLinkEmail('');
    setRequestOTPEmail('');
    setOtpSent(false);
    setIsRequestingOTP(false);
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
            onClick={() => { setMode('request-otp'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              mode === 'request-otp'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Request OTP
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
          {/* <button
            onClick={() => { setMode('magic'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              mode === 'magic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Magic Link
          </button> */}
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

        {/* Request OTP Form */}
        {mode === 'request-otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            {otpSent ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  ✅ OTP sent successfully to your email!
                </div>
                <p className="text-sm text-gray-600">
                  Check your email for the OTP code, then go to the User tab to login
                </p>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setRequestOTPEmail(''); }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Send to different email
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="request-otp-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="request-otp-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email address"
                    value={requestOTPEmail}
                    onChange={(e) => setRequestOTPEmail(e.target.value)}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={!requestOTPEmail || isRequestingOTP}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isRequestingOTP ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending OTP...
                      </div>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    After receiving OTP, go to the User tab to login
                  </p>
                </div>
              </>
            )}
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
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={userData.email}
                  onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="user-otp" className="sr-only">
                  OTP Code
                </label>
                <input
                  id="user-otp"
                  name="otp"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter OTP Code"
                  value={userData.otp || ''}
                  onChange={(e) => setUserData(prev => ({ ...prev, otp: e.target.value }))}
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!userData.email || !userData.otp}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Sign in as User
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
