import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Forgot password state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        email,
        password
      });

      const token = response.data.data?.token || response.data?.token;
      if (token) {
        localStorage.setItem('admin_token', token);
        if (response.data.data?.user) {
          localStorage.setItem('admin_user', JSON.stringify(response.data.data.user));
        }
        navigate('/dashboard');
      } else {
        setError('Login failed, no token received.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Unable to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setForgotMessage('');
    try {
      await axios.post(`${BASE_URL}/forgot-password`, { email: forgotEmail });
      setForgotMessage('OTP has been sent to your email. Check your inbox.');
    } catch (err) {
      setForgotMessage(err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-black font-sans">
      {/* Left - Image/Logo */}
      <div className="hidden md:flex md:w-1/2 bg-black flex-col justify-center items-center p-12">
        <img
          src={logo}
          alt="Logo"
          className="max-w-md w-full object-contain mb-8 filter brightness-0 invert opacity-90"
        />
        <h2 className="text-white text-2xl font-semibold text-center">Admin Dashboard</h2>
        <p className="text-gray-400 mt-2 text-center max-w-sm">Manage your portfolio, gallery, projects, and everything else in one place.</p>
      </div>

      {/* Right - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white shadow-2xl z-10">
        <div className="max-w-md w-full mx-auto">
          {/* Show logo on mobile */}
          <div className="md:hidden flex justify-center mb-8">
            <img src={logo} alt="Logo" className="w-32 object-contain" />
          </div>

          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mb-8 font-medium">Please sign in to your account</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm font-medium rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all focus:bg-white"
                required
              />
            </div>



            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all bg-gray-50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl mt-4"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your email address and we'll send you an OTP to reset your password.</p>

            {forgotMessage && (
              <div className={`mb-6 p-4 text-sm font-medium rounded-lg ${forgotMessage.includes('OTP') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading || !forgotEmail}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-black rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isForgotLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
