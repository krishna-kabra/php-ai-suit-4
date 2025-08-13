import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaSignOutAlt, FaPlus, FaSearch, FaClock, FaMapMarkerAlt, FaStethoscope, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { providerAPI } from '../services/api';
import AppointmentDetailModal from './AppointmentDetailModal';

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [provider, setProvider] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProviderData();
    fetchAppointments();
  }, []);

  const fetchProviderData = async () => {
    try {
      const response = await providerAPI.getProfile();
      if (response.success) {
        setProvider(response.data);
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await providerAPI.getAppointments();
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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetail(true);
  };

  const handleAppointmentDetailClose = () => {
    setShowAppointmentDetail(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentUpdate = () => {
    fetchAppointments(); // Refresh the appointments list
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
              <h1 className="text-xl font-semibold text-gray-900">Provider Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaUser className="text-gray-400" />
                <span className="text-sm text-gray-700">
                  {provider?.first_name} {provider?.last_name}
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
            Welcome back, Dr. {provider?.last_name}!
          </h2>
          <p className="text-gray-600">
            Manage your appointments and availability from your dashboard.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange('appointments')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCalendarAlt />
              <span>Appointments</span>
            </button>
            <button
              onClick={() => handleTabChange('availability')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'availability'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaClock />
              <span>Availability</span>
            </button>
            <button
              onClick={() => handleTabChange('profile')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
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
          {activeTab === 'appointments' && (
            <AppointmentsTab 
              appointments={appointments} 
              onRefresh={fetchAppointments}
              provider={provider}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
          {activeTab === 'availability' && (
            <AvailabilityTab provider={provider} />
          )}
          {activeTab === 'profile' && (
            <ProfileTab provider={provider} onUpdate={fetchProviderData} />
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showAppointmentDetail && selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={handleAppointmentDetailClose}
          onUpdate={handleAppointmentUpdate}
        />
      )}
    </div>
  );
};

// Appointments Tab Component
const AppointmentsTab = ({ appointments, onRefresh, provider, onAppointmentClick }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Your Appointments</h3>
        <button
          onClick={() => setShowBookingForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          <span>Book Appointment</span>
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any appointments scheduled yet.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowBookingForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Book Your First Appointment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment} 
              onAppointmentClick={onAppointmentClick}
            />
          ))}
        </div>
      )}

      {showBookingForm && (
        <AppointmentBookingModal
          provider={provider}
          onClose={() => setShowBookingForm(false)}
          onSuccess={() => {
            setShowBookingForm(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

// Appointment Card Component
const AppointmentCard = ({ appointment, onAppointmentClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className="text-sm font-medium text-gray-900">
              {appointment.patient?.first_name} {appointment.patient?.last_name}
            </h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <FaCalendarAlt />
              <span>{new Date(appointment.episode_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaClock />
              <span>{appointment.episode_details}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{appointment.episode_type}</span>
            </div>
          </div>
          {appointment.notes && (
            <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
          )}
        </div>
        <button
          onClick={() => onAppointmentClick(appointment)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <FaEye />
        </button>
      </div>
    </div>
  );
};

// Availability Tab Component
const AvailabilityTab = ({ provider }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeZone, setTimeZone] = useState('');

  useEffect(() => {
    if (provider) {
      fetchAvailability();
    }
  }, [provider]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await providerAPI.getAvailabilities();
      if (response.success) {
        setAvailability(response.data);
        // Set timezone from first record if available
        if (response.data.length > 0 && response.data[0].time_zone) {
          setTimeZone(response.data[0].time_zone);
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability settings');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Convert HH:MM:SS to HH:MM AM/PM
    const time = timeString.substring(0, 5);
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayLabel = (dayKey) => {
    const dayMap = {
      'monday': 'Monday',
      'tuesday': 'Tuesday', 
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday'
    };
    return dayMap[dayKey] || dayKey;
  };

  const getAvailabilityTypeLabel = (item) => {
    if (item.availability_type === 'specific_date') {
      return `Specific Date (${new Date(item.specific_date).toLocaleDateString()})`;
    }
    return getDayLabel(item.day_of_week);
  };

  const getStatusBadge = (isAvailable) => {
    return isAvailable ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Available
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Not Available
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Your Availability</h3>
          {timeZone && (
            <p className="text-sm text-gray-500 mt-1">Time Zone: {timeZone}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchAvailability}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <FaClock className="w-4 h-4" />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => window.location.href = '/provider/availability'}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Configure Availability</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading availability...</p>
        </div>
      ) : availability.length === 0 ? (
        <div className="text-center py-12">
          <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No availability set</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't configured your availability schedule yet.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/provider/availability'}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Set Your Availability
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availability.map((item) => {
                  const startTime = formatTime(item.start_time);
                  const endTime = formatTime(item.end_time);
                  const duration = item.start_time && item.end_time ? 
                    `${Math.floor((new Date(`2000-01-01T${item.end_time}`) - new Date(`2000-01-01T${item.start_time}`)) / (1000 * 60 * 60))}h` : 'N/A';
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getAvailabilityTypeLabel(item)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.is_available)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{startTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{endTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{duration}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaClock className="w-5 h-5 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Available Days</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {availability.filter(item => item.is_available).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaCalendarAlt className="w-5 h-5 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Total Hours</p>
                  <p className="text-2xl font-bold text-green-600">
                    {availability
                      .filter(item => item.is_available && item.start_time && item.end_time)
                      .reduce((total, item) => {
                        const start = new Date(`2000-01-01T${item.start_time}`);
                        const end = new Date(`2000-01-01T${item.end_time}`);
                        return total + (end - start) / (1000 * 60 * 60);
                      }, 0).toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaUser className="w-5 h-5 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">Time Zone</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {timeZone || 'Not Set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ provider, onUpdate }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <p className="mt-1 text-sm text-gray-900">{provider?.first_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <p className="mt-1 text-sm text-gray-900">{provider?.last_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{provider?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Specialization</label>
            <p className="mt-1 text-sm text-gray-900">{provider?.specialization}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointment Booking Modal Component
const AppointmentBookingModal = ({ provider, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: 'consultation',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.appointment_date) {
      fetchAvailableSlots(formData.appointment_date);
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [formData.appointment_date]);

  const fetchAvailableSlots = async (date) => {
    try {
      setLoadingSlots(true);
      const response = await providerAPI.getAvailableSlots(date);
      if (response.success) {
        setAvailableSlots(response.data);
        setSelectedSlot(null); // Reset selected slot when date changes
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
      setFormData(prev => ({
        ...prev,
        appointment_time: slot.time
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      toast.error('Please select an available time slot');
      return;
    }
    
    setLoading(true);

    try {
      // Use the provider API to create appointment
      const response = await fetch('http://localhost:8000/api/v1/provider/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          ...formData,
          appointment_time: selectedSlot.display_time // Use the display time for the appointment
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Appointment booked successfully!');
        onSuccess();
      } else {
        throw new Error(result.message || 'Failed to book appointment');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Book Appointment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Email
            </label>
            <input
              type="email"
              name="patient_email"
              value={formData.patient_email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Phone
            </label>
            <input
              type="tel"
              name="patient_phone"
              value={formData.patient_phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Time
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
                {selectedSlot ? selectedSlot.display_time : 'Select a time slot below'}
              </div>
            </div>
          </div>

          {/* Available Time Slots */}
          {formData.appointment_date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Time Slots
              </label>
              {loadingSlots ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading available slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No available slots for this date</p>
                  <p className="text-sm">Please select a different date or check availability</p>
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
                          ? 'bg-blue-600 text-white border-blue-600'
                          : slot.available
                          ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-500'
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              name="appointment_type"
              value={formData.appointment_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow Up</option>
              <option value="check_up">Check Up</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderDashboard; 