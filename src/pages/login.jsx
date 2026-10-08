import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import loginBg from '../assets/login.png';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function Login() {
  const navigate = useNavigate();

  // Mode: 'login' | 'forgot' | 'reset'
  const [authMode, setAuthMode] = useState('login');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot / Reset Password Form State
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        email,
        password
      });

      const token = response.data.data?.access_token || response.data?.access_token || response.data?.token || response.data.data?.token;
      if (token) {
        localStorage.setItem('admin_token', token);
        if (response.data.data?.user || response.data?.user) {
          localStorage.setItem('admin_user', JSON.stringify(response.data.data?.user || response.data?.user));
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
    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${BASE_URL}/forgot-password`, {
        email: forgotEmail
      });

      setSuccess(response.data?.message || 'Kode OTP telah berhasil dikirim ke email Anda.');
      setAuthMode('reset');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Gagal mengirim instruksi reset password. Pastikan email terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${BASE_URL}/reset-password`, {
        email: forgotEmail,
        otp,
        new_password: newPassword
      });

      setSuccess(response.data?.message || 'Password berhasil direset! Silakan login dengan password baru.');
      setAuthMode('login');
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Gagal mereset password. Pastikan kode OTP sesuai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-900">
      {/* Left side - Login Container */}
      <div className="w-full lg:w-1/2 flex flex-col relative px-8 sm:px-16 py-8">

        {/* Top Header */}
        <div className="flex justify-between items-center w-full mb-12">
          <button
            type="button"
            onClick={() => {
              if (authMode !== 'login') {
                setAuthMode('login');
                resetMessages();
              } else {
                navigate(-1);
              }
            }}
            className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {authMode !== 'login' && <ArrowLeft className="w-3.5 h-3.5" />}
            {authMode !== 'login' ? 'Back to Login' : ''}
          </button>
          <div className="text-lg font-bold tracking-tight text-gray-900 absolute left-1/2 -translate-x-1/2 font-serif">
            rayhanrwa.
          </div>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">

            <AnimatePresence mode="wait">
              {authMode === 'login' && (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-5xl font-serif mb-10 text-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Login
                  </h1>

                  {error && (
                    <div className="mb-6 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-[13px] text-red-600 rounded">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-700 rounded">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3.5 bg-[#F9F9F9] outline-none text-[14px] text-gray-900 transition-colors"
                        required
                      />
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3.5 bg-[#F9F9F9] outline-none text-[14px] text-gray-900 transition-colors pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setForgotEmail(email);
                          resetMessages();
                        }}
                        className="text-[12px] font-medium text-black border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#111111] text-white py-4 text-[14px] hover:bg-black transition-colors mt-6 font-medium disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                  </form>

                  <div className="my-8 flex items-center justify-center relative">
                    <div className="absolute w-full border-t border-gray-100"></div>
                    <span className="bg-white px-4 text-[12px] text-gray-400 relative z-10">
                      or login with
                    </span>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full py-3.5 border border-[#E5E5E5] text-[14px] font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors cursor-pointer">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Login with Google
                    </button>
                    <button className="w-full py-3.5 border border-[#E5E5E5] text-[14px] font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors cursor-pointer">
                      <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.49.09 2.58.64 3.29 1.62-2.83 1.7-2.3 5.43.46 6.57-.68 1.81-1.74 3.53-2.33 4.78zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.36-3.74 4.25z" />
                      </svg>
                      Login with Apple
                    </button>
                  </div>

                </motion.div>
              )}

              {authMode === 'forgot' && (
                <motion.div
                  key="forgot-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-4xl sm:text-5xl font-serif mb-3 text-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Forgot Password
                  </h1>
                  <p className="text-[13px] text-gray-500 mb-8 leading-relaxed">
                    Enter your email address and we'll send you an OTP code to reset your password.
                  </p>

                  {error && (
                    <div className="mb-6 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-[13px] text-red-600 rounded">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-700 rounded">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3.5 bg-[#F9F9F9] outline-none text-[14px] text-gray-900 transition-colors"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('reset');
                          resetMessages();
                        }}
                        className="text-[12px] text-gray-500 hover:text-black transition-colors cursor-pointer"
                      >
                        Already have an OTP code?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#111111] text-white py-4 text-[14px] hover:bg-black transition-colors mt-6 font-medium disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP Code'}
                    </button>
                  </form>

                  <div className="mt-10 text-center text-[13px] text-gray-400">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        resetMessages();
                      }}
                      className="text-black font-medium border-b border-black pb-0.5 ml-1 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      Login
                    </button>
                  </div>
                </motion.div>
              )}

              {authMode === 'reset' && (
                <motion.div
                  key="reset-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-4xl sm:text-5xl font-serif mb-3 text-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Reset Password
                  </h1>
                  <p className="text-[13px] text-gray-500 mb-8 leading-relaxed">
                    Enter the OTP code sent to your email and set your new password.
                  </p>

                  {error && (
                    <div className="mb-6 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-[13px] text-red-600 rounded">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-700 rounded">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full px-4 py-3.5 bg-[#F9F9F9] outline-none text-[14px] text-gray-900 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="OTP Code (e.g. 123456)"
                        className="w-full px-4 py-3.5 bg-[#F9F9F9] outline-none text-[14px] text-gray-900 tracking-wider font-mono transition-colors"
                        required
                      />
                    </div>

                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        className="w-full px-4 py-3.5 bg-[#F9F9F9] outline-none text-[14px] text-gray-900 transition-colors pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-1 text-[12px]">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          resetMessages();
                        }}
                        className="text-gray-500 hover:text-black transition-colors cursor-pointer"
                      >
                        Didn't receive code? Resend OTP
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#111111] text-white py-4 text-[14px] hover:bg-black transition-colors mt-6 font-medium disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                  </form>

                  <div className="mt-10 text-center text-[13px] text-gray-400">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        resetMessages();
                      }}
                      className="text-black font-medium border-b border-black pb-0.5 ml-1 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      Back to Login
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Right side - Image Background */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-900">
        <img
          src={loginBg}
          alt="Login background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Blue Overlay */}
        <div className="absolute inset-0 bg-[#106cff] mix-blend-multiply opacity-80"></div>
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-red-900/60 mix-blend-overlay"></div>

        {/* Text overlay */}
        <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
          <div className="flex justify-between text-[13px] font-medium opacity-90">
            <span>15 September 2026</span>
          </div>

          <div className="max-w-md mt-24">
            <h2 className="text-[32px] font-normal leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Love is not about finding the perfect person, but about choosing the same person every single day.
            </h2>
          </div>

          <div className="flex justify-between items-end">
            <div className="text-[13px] font-medium opacity-90">15 September 2026</div>
          </div>
        </div>
      </div>
    </div>
  );
}