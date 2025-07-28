import React, { useState, useEffect } from "react";
import { 
  FaStethoscope, 
  FaUserMd, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaExclamationCircle,
  FaCheckCircle
} from "react-icons/fa";
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

// Validation utils
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
const validatePhone = (phone) =>
  /^\+?\d{10,15}$/.test(phone.replace(/[-()\s]/g, ''));

const validatePassword = (password) => 
  password.length >= 8;

export default function ProviderLogin() {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [credentialType, setCredentialType] = useState("email"); // "email" or "phone"
  const [isFocused, setIsFocused] = useState({
    credential: false,
    password: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Detect credential type when input changes
    if (credential.includes('@')) {
      setCredentialType('email');
    } else if (/\d/.test(credential)) {
      setCredentialType('phone');
    }
  }, [credential]);

  // Validate credential based on type
  const isValidCredential = credential 
    ? credentialType === 'email' 
      ? validateEmail(credential)
      : validatePhone(credential)
    : true;

  const isValidPassword = password ? validatePassword(password) : true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate credential
    const isEmail = credentialType === 'email';
    if (!isValidCredential) {
      setError(isEmail ? "Please enter a valid email address." : "Please enter a valid phone number.");
      toast.error(isEmail ? "Invalid email format" : "Invalid phone number format");
      return;
    }

    // Validate password
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters.");
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({
        credential,
        password,
        remember: rememberMe
      });

      // If we reach here, login was successful
      setSuccess(true);
      toast.success('Login successful! Redirecting to dashboard...');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'provider');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500); // Slight delay for better UX
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = '';

      if (error.isRateLimited) {
        errorMsg = error.message;
      } else if (error.errors) {
        const validationErrors = error.errors;
        errorMsg = Object.values(validationErrors)?.[0]?.[0] || "Validation failed. Please check your input.";
      } else if (error.response?.status === 429) {
        errorMsg = 'Too many login attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMsg = 'Network error. Please check your connection.';
      } else {
        errorMsg = 'Something went wrong. Please try again.';
      }

      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
  }
  };
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="mb-8 flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4">
          <FaStethoscope className="w-full h-full text-blue-600" />
          <div className="absolute inset-0 bg-blue-100 opacity-20 rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          Provider Login
        </h1>
        <p className="text-gray-600 mt-2 text-center max-w-md">
          Secure access portal for medical professionals
        </p>
      </header>

      {/* Login Form */}
      <form
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 relative overflow-hidden"
        autoComplete="on"
        onSubmit={handleSubmit}
        aria-label="Provider Login Form"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-emerald-600/10" />
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-8 border-blue-100/30" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full border-8 border-emerald-100/30" />
        </div>

        {/* Form Content */}
        <div className="relative z-10 space-y-6">
          {/* Credential Input */}
          <div>
            <label htmlFor="credential" className="block text-sm font-medium text-gray-700 mb-1">
              Email or Phone Number
            </label>
            <div className="relative group">
              <input
                id="credential"
                name="credential"
                type="text"
                autoComplete={credentialType === 'email' ? 'email' : 'tel'}
                placeholder={credentialType === 'email' ? "doctor@example.com" : "(555) 000-0000"}
                className={`
                  w-full px-4 py-3 pl-11 pr-10 border rounded-lg
                  transition-all duration-200 ease-in-out
                  bg-white focus:bg-white
                  ${isFocused.credential ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'}
                  ${!isValidCredential && credential ? 'border-red-300 ring-2 ring-red-500/20' : ''}
                  ${isValidCredential && credential ? 'border-emerald-300 ring-2 ring-emerald-500/20' : ''}
                `}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                onFocus={() => setIsFocused(prev => ({ ...prev, credential: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, credential: false }))}
                aria-invalid={!isValidCredential && credential !== ""}
                aria-describedby={!isValidCredential && credential ? "credential-error" : undefined}
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-hover:text-gray-500">
                {credentialType === 'email' ? (
                  <FaEnvelope className="w-5 h-5" />
                ) : (
                  <FaPhone className="w-5 h-5" />
                )}
              </div>
              {credential && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidCredential ? (
                    <FaCheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <FaExclamationCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {!isValidCredential && credential && (
              <p id="credential-error" className="mt-1 text-sm text-red-500 flex items-center">
                <FaExclamationCircle className="w-4 h-4 mr-1" />
                {credentialType === 'email' 
                  ? "Please enter a valid email address"
                  : "Please enter a valid phone number"
                }
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative group">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className={`
                  w-full px-4 py-3 pl-11 pr-10 border rounded-lg
                  transition-all duration-200 ease-in-out
                  bg-white focus:bg-white
                  ${isFocused.password ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'}
                  ${!isValidPassword && password ? 'border-red-300 ring-2 ring-red-500/20' : ''}
                  ${isValidPassword && password ? 'border-emerald-300 ring-2 ring-emerald-500/20' : ''}
                `}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                aria-invalid={!isValidPassword && password !== ""}
                aria-describedby={!isValidPassword && password ? "password-error" : undefined}
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-hover:text-gray-500">
                <FaLock className="w-5 h-5" />
              </div>
              <button
                type="button"
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
            {!isValidPassword && password && (
              <p id="password-error" className="mt-1 text-sm text-red-500 flex items-center">
                <FaExclamationCircle className="w-4 h-4 mr-1" />
                Password must be at least 8 characters
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((v) => !v)}
                className="
                  w-4 h-4 rounded border-gray-300 text-blue-600 
                  focus:ring-blue-500 focus:ring-offset-0
                  transition-all duration-200
                "
              />
              <span className="group-hover:text-gray-900">Remember Me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-start"
              role="alert"
            >
              <FaExclamationCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div 
              className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg flex items-center"
              role="status"
            >
              <FaCheckCircle className="w-5 h-5 mr-3" />
              <p className="text-sm">Login successful! Redirecting to dashboard...</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-white
              bg-gradient-to-r from-blue-600 to-blue-700
              hover:from-blue-700 hover:to-blue-800
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
              disabled:opacity-80 disabled:cursor-not-allowed
              transition-all duration-200 ease-in-out
              flex items-center justify-center
              ${loading ? "" : "transform hover:-translate-y-0.5"}
            `}
          >
            {loading ? (
              <>
                <FaSpinner className="w-5 h-5 mr-3 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>

          {/* Registration Link */}
          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-2 py-1"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-700 hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-700 hover:underline">Terms of Service</Link>
            <Link to="/support" className="hover:text-gray-700 hover:underline">Support</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
