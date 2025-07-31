import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProviderLogin from './components/ProviderLogin';
import ProviderRegister from './components/ProviderRegister';
import PatientRegister from './components/PatientRegister';
import PatientLogin from './components/PatientLogin';
import ProviderAvailability from './components/ProviderAvailability';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Unauthorized from './components/Unauthorized';
import Navbar from './components/Navbar';
import './App.css';
import BookAppointment from './components/BookAppoinment';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><ProviderLogin /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><ProviderRegister /></PublicRoute>} />
          <Route path="/patient/login" element={<PublicRoute><PatientLogin /></PublicRoute>} />
          <Route path="/patient/register" element={<PublicRoute><PatientRegister /></PublicRoute>} />

          {/* Role Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <RoleProtectedRoute allowedRole="provider">
                <ProviderAvailability />
              </RoleProtectedRoute>
            }
          />
          {/* Example of patient-protected route */}
          <Route
            path="/patient/dashboard"
            element={
              <RoleProtectedRoute allowedRole="patient">
                <BookAppointment />
              </RoleProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>

        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </Router>
  );
}

export default App;
