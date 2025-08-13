import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { patientAuthAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\+?\d{10,15}$/.test(phone.replace(/[-()\s]/g, ''));
const validatePassword = (password) => password.length >= 8;

export default function PatientLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [credentialType, setCredentialType] = useState("email");
  const [isFocused, setIsFocused] = useState({ identifier: false, password: false });
  const navigate = useNavigate();

  useEffect(() => {
    if (identifier.includes('@')) setCredentialType('email');
    else if (/\d/.test(identifier)) setCredentialType('phone');
  }, [identifier]);

  const isValidIdentifier = identifier 
    ? credentialType === 'email' 
      ? validateEmail(identifier) 
      : validatePhone(identifier) 
    : true;

  const isValidPassword = password ? validatePassword(password) : true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidIdentifier) {
      const msg = credentialType === 'email'
        ? "Please enter a valid email address."
        : "Please enter a valid phone number.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters.");
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await patientAuthAPI.login({
        identifier,
        password,
        remember: rememberMe,
      });
      if (response.success) {
        // Store tokens and user data
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('role', 'patient');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('Patient login successful:', response.data);
        toast.success('Login successful!');
        
        // Redirect to patient dashboard
        navigate('/patient/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      let errorMsg = error.message || 'Something went wrong. Try again.';
      if (error.errors) {
        const validationErrors = error.errors;
        errorMsg = Object.values(validationErrors)?.[0]?.[0] || errorMsg;
      }
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="mb-8 flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4">
          <FaUser className="w-full h-full text-green-600" />
          <div className="absolute inset-0 bg-green-100 opacity-20 rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Patient Login
        </h1>
        <p className="text-gray-600 mt-2 text-center max-w-md">
          Access your health records and appointments
        </p>
      </header>

      <form className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 relative overflow-hidden" onSubmit={handleSubmit}>
        <div className="relative z-10 space-y-6">
          {/* Identifier Input */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Email or Phone Number</label>
            <div className="relative group">
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete={credentialType === 'email' ? 'email' : 'tel'}
                placeholder={credentialType === 'email' ? "jane@example.com" : "(555) 000-0000"}
                className={`w-full px-4 py-3 pl-11 pr-10 border rounded-lg transition-all duration-200 ease-in-out bg-white focus:bg-white ${isFocused.identifier ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200'} ${!isValidIdentifier && identifier ? 'border-red-300 ring-2 ring-red-500/20' : ''} ${isValidIdentifier && identifier ? 'border-emerald-300 ring-2 ring-emerald-500/20' : ''}`}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onFocus={() => setIsFocused(prev => ({ ...prev, identifier: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, identifier: false }))}
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {credentialType === 'email' ? <FaEnvelope className="w-5 h-5" /> : <FaPhone className="w-5 h-5" />}
              </div>
              {identifier && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidIdentifier ? <FaCheckCircle className="w-5 h-5 text-emerald-500" /> : <FaExclamationCircle className="w-5 h-5 text-red-500" />}
                </div>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative group">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className={`w-full px-4 py-3 pl-11 pr-10 border rounded-lg transition-all duration-200 ease-in-out bg-white focus:bg-white ${isFocused.password ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200'} ${!isValidPassword && password ? 'border-red-300 ring-2 ring-red-500/20' : ''} ${isValidPassword && password ? 'border-emerald-300 ring-2 ring-emerald-500/20' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock className="w-5 h-5" />
              </div>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((v) => !v)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 hover:underline">Forgot Password?</Link>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <FaExclamationCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg flex items-center">
              <FaCheckCircle className="w-5 h-5 mr-3" />
              <p className="text-sm">Login successful! Redirecting...</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <FaSpinner className="w-5 h-5 mr-3 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/patient/register" className="font-medium text-green-600 hover:text-green-500">
                Register here
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <Link to="/" className="font-medium text-gray-600 hover:text-gray-500">
                ← Back to Home
              </Link>
            </p>
          </div>

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
