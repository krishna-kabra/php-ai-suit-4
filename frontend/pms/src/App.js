import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import LandingPage from './components/LandingPage';
import ProviderLogin from './components/ProviderLogin';
import ProviderRegister from './components/ProviderRegister';
import PatientLogin from './components/PatientLogin';
import PatientRegister from './components/PatientRegister';
import ProviderDashboard from './components/ProviderDashboard';
import PatientDashboard from './components/PatientDashboard';
import RoleProtectedRoute from './components/RoleProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/provider/login" element={<ProviderLogin />} />
          <Route path="/provider/register" element={<ProviderRegister />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          
          {/* Protected Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <RoleProtectedRoute
                allowedRoles={['provider']}
                redirectTo="/provider/login"
                component={ProviderDashboard}
              />
            }
          />
          
          {/* Protected Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <RoleProtectedRoute
                allowedRoles={['patient']}
                redirectTo="/patient/login"
                component={PatientDashboard}
              />
            }
          />
          
          {/* Default redirects */}
          <Route path="/dashboard" element={<Navigate to="/provider/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          
          {/* Catch all route - redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
