import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaSignOutAlt, FaPlus, FaSearch, FaClock, FaMapMarkerAlt, FaStethoscope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('book-appointment');
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientData();
    fetchAppointments();
    fetchProviders();
  }, []);

  const fetchPatientData = async () => {
    try {
      const response = await patientAPI.getProfile();
      if (response.success) {
        setPatient(response.data);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await patientAPI.getAppointments();
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      console.log('Fetching providers...');
      const response = await patientAPI.getProviders();
      console.log('Providers response:', response);
      if (response.success) {
        setProviders(response.data);
        console.log('Providers set to state:', response.data);
      } else {
        console.error('Providers API failed:', response.message);
        toast.error('Failed to load providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to load providers');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    navigate('/patient/login');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Patient Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaUser className="text-gray-400" />
                <span className="text-sm text-gray-700">
                  {patient?.first_name} {patient?.last_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {patient?.first_name}!
          </h2>
          <p className="text-gray-600">
            Book appointments with healthcare providers and manage your healthcare journey.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange('book-appointment')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'book-appointment'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCalendarAlt />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => handleTabChange('my-appointments')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-appointments'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaClock />
              <span>My Appointments</span>
            </button>
            <button
              onClick={() => handleTabChange('profile')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUser />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'book-appointment' && (
            <BookAppointmentTab 
              providers={providers}
              onRefresh={fetchAppointments}
              patient={patient}
            />
          )}
          {activeTab === 'my-appointments' && (
            <MyAppointmentsTab 
              appointments={appointments} 
              onRefresh={fetchAppointments}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileTab patient={patient} onUpdate={fetchPatientData} />
          )}
        </div>
      </div>
    </div>
  );
};

// Book Appointment Tab Component
const BookAppointmentTab = ({ providers, onRefresh, patient }) => {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    episode_details: '',
    vitals: '',
    episode_occur_date: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch available slots when provider and date change
  useEffect(() => {
    if (selectedProvider && selectedDate) {
      fetchAvailableSlots(selectedProvider, selectedDate);
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedProvider, selectedDate]);

  const fetchAvailableSlots = async (providerId, date) => {
    try {
      setLoadingSlots(true);
      const response = await patientAPI.getProviderAvailableSlots(providerId, date);
      if (response.success) {
        setAvailableSlots(response.data);
        setSelectedSlot(null);
      } else {
        setAvailableSlots([]);
        toast.error(response.message || 'Failed to load available slots');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
      toast.error('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProvider || !selectedDate || !selectedSlot) {
      toast.error('Please select a provider, date, and time slot');
      return;
    }
    
    if (!formData.episode_details || !formData.episode_occur_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);

    try {
      const appointmentData = {
        provider_id: selectedProvider,
        appointment_date: selectedDate,
        appointment_time: selectedSlot.display_time,
        episode_details: formData.episode_details,
        vitals: formData.vitals,
        episode_occur_date: formData.episode_occur_date
      };

      const response = await patientAPI.bookAppointment(appointmentData);

      if (response.success) {
        toast.success('Appointment booked successfully!');
        // Reset form
        setSelectedProvider('');
        setSelectedDate('');
        setSelectedSlot(null);
        setFormData({
          episode_details: '',
          vitals: '',
          episode_occur_date: ''
        });
        // Refresh appointments
        onRefresh();
      } else {
        throw new Error(response.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Book New Appointment</h3>
        <p className="text-sm text-gray-600 mt-1">Select a provider and choose an available time slot</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Healthcare Provider
          </label>
          {/* Debug info */}
          <div className="mb-2 text-xs text-gray-500">
            Debug: Providers count: {providers.length}
          </div>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Choose a provider...</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                Dr. {provider.first_name} {provider.last_name} - {provider.specialization}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Available Time Slots */}
        {selectedProvider && selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Time Slots
            </label>
            {loadingSlots ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading available slots...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No available slots for this date</p>
                <p className="text-sm">Please select a different date or provider</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!slot.available}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      selectedSlot?.time === slot.time
                        ? 'bg-green-600 text-white border-green-600'
                        : slot.available
                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-green-500'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {slot.display_time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Slot Display */}
        {selectedSlot && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">Selected Appointment Time</h4>
            <p className="text-green-700">{selectedSlot.display_time}</p>
          </div>
        )}

        {/* Patient Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Episode Details *
            </label>
            <textarea
              name="episode_details"
              value={formData.episode_details}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Describe your symptoms or reason for visit..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vitals (Optional)
            </label>
            <input
              type="text"
              name="vitals"
              value={formData.vitals}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., BP: 120/80, Temp: 98.6°F"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Episode Occur Date *
          </label>
          <input
            type="date"
            name="episode_occur_date"
            value={formData.episode_occur_date}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !selectedSlot}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="w-4 h-4" />
            <span>{loading ? 'Booking...' : 'Book Appointment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// My Appointments Tab Component
const MyAppointmentsTab = ({ appointments, onRefresh }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">My Appointments</h3>
        <button
          onClick={onRefresh}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any appointments scheduled yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Dr. {appointment.provider?.first_name} {appointment.provider?.last_name}
                  </h4>
                  <p className="text-sm text-gray-600">{appointment.provider?.specialization}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.episode_date).toLocaleDateString()} at {appointment.episode_details}
                  </p>
                  <p className="text-sm text-gray-600">Status: {appointment.status}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ patient, onUpdate }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <p className="mt-1 text-sm text-gray-900">{patient?.first_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <p className="mt-1 text-sm text-gray-900">{patient?.last_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{patient?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-sm text-gray-900">{patient?.phone_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 