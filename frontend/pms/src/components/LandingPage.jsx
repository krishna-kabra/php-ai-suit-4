import React from 'react';
import { FaUserMd, FaUser, FaStethoscope, FaHeartbeat, FaArrowRight, FaShieldAlt, FaClock, FaCalendarCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <FaHeartbeat className="text-3xl text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">HealthCare PMS</h1>
            </div>
            <div className="text-sm text-gray-600">
              Professional Medical Practice Management
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to HealthCare PMS
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your medical practice with our comprehensive patient management system. 
            Connect providers and patients seamlessly for better healthcare delivery.
          </p>
        </div>

        {/* Main Content - Two Vertical Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Provider Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition-all duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <FaUserMd className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Healthcare Providers</h3>
              <p className="text-gray-600">Manage your practice, patients, and appointments efficiently</p>
            </div>

            {/* Provider Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <FaCalendarCheck className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Appointment scheduling & management</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaUser className="text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Patient records & history</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaStethoscope className="text-purple-500 flex-shrink-0" />
                <span className="text-gray-700">Clinical evaluations & notes</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">Availability management</span>
              </div>
            </div>

            {/* Provider Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/provider/login"
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 group"
              >
                <span>Provider Login</span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/provider/register"
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
              >
                Provider Registration
              </Link>
            </div>
          </div>

          {/* Patient Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 hover:shadow-2xl transition-all duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <FaUser className="text-3xl text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Patients</h3>
              <p className="text-gray-600">Book appointments, manage your health records, and stay connected</p>
            </div>

            {/* Patient Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <FaCalendarCheck className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Easy appointment booking</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaUser className="text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Personal health records</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaStethoscope className="text-purple-500 flex-shrink-0" />
                <span className="text-gray-700">View medical evaluations</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaShieldAlt className="text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">Secure & private access</span>
              </div>
            </div>

            {/* Patient Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/patient/login"
                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 group"
              >
                <span>Patient Login</span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/patient/register"
                className="w-full flex items-center justify-center px-6 py-3 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors duration-200 border border-green-200"
              >
                Patient Registration
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Why Choose HealthCare PMS?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <FaShieldAlt className="text-xl text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Secure & HIPAA Compliant</h4>
                <p className="text-sm text-gray-600">Your data is protected with enterprise-grade security</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <FaClock className="text-xl text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">24/7 Availability</h4>
                <p className="text-sm text-gray-600">Access your information anytime, anywhere</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                  <FaHeartbeat className="text-xl text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Patient-Centered Care</h4>
                <p className="text-sm text-gray-600">Focus on what matters most - patient health</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 HealthCare PMS. All rights reserved.</p>
            <p className="text-sm mt-2">Professional Medical Practice Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 