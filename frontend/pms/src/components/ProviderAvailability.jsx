import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaTrash, FaPlus, FaArrowLeft, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { providerAPI } from '../services/api';

const ProviderAvailability = () => {
  const navigate = useNavigate();
  const [timeZone, setTimeZone] = useState('UTC+5:30');
  const [availability, setAvailability] = useState({
    monday: { day: 'monday', from: '09:00', to: '18:00', enabled: true },
    tuesday: { day: 'tuesday', from: '09:00', to: '18:00', enabled: true },
    wednesday: { day: 'wednesday', from: '09:00', to: '18:00', enabled: true },
    thursday: { day: 'thursday', from: '09:00', to: '18:00', enabled: true },
    friday: { day: 'friday', from: '09:00', to: '17:00', enabled: true },
    saturday: { day: 'saturday', from: '10:00', to: '16:00', enabled: true },
    sunday: { day: 'sunday', from: '10:00', to: '14:00', enabled: false }
  });
  const [specificDates, setSpecificDates] = useState([]);
  const [blockDays, setBlockDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'specific'

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    fetchProviderData();
    fetchAvailability();
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

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await providerAPI.getAvailabilities();
      if (response.success && response.data.length > 0) {
        // Transform API data to match our state structure
        const apiAvailability = {};
        response.data.forEach(item => {
          apiAvailability[item.day_of_week] = {
            day: item.day_of_week,
            from: item.start_time.substring(0, 5), // Convert HH:MM:SS to HH:MM
            to: item.end_time.substring(0, 5),
            enabled: item.is_available
          };
        });
        
        setAvailability(prev => ({
          ...prev,
          ...apiAvailability
        }));
        
        // Set timezone from first record
        if (response.data[0].time_zone) {
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

  const handleDayToggle = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const addBlockDay = () => {
    setBlockDays(prev => [...prev, {
      id: Date.now(),
      date: '',
      from: '09:00',
      to: '17:00'
    }]);
  };

  const addSpecificDate = () => {
    setSpecificDates(prev => [...prev, {
      id: Date.now(),
      date: '',
      from: '09:00',
      to: '17:00',
      enabled: true
    }]);
  };

  const removeSpecificDate = (id) => {
    setSpecificDates(prev => prev.filter(date => date.id !== id));
  };

  const handleSpecificDateChange = (id, field, value) => {
    setSpecificDates(prev => prev.map(date => 
      date.id === id ? { ...date, [field]: value } : date
    ));
  };

  const removeBlockDay = (id) => {
    setBlockDays(prev => prev.filter(day => day.id !== id));
  };

  const handleBlockDayChange = (id, field, value) => {
    setBlockDays(prev => prev.map(day => 
      day.id === id ? { ...day, [field]: value } : day
    ));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare data for API with correct format
      const availabilityData = {
        time_zone: timeZone,
        day_wise_availability: Object.entries(availability)
          .filter(([key, value]) => value.enabled) // Only send enabled days
          .map(([key, value]) => ({
            day: key,
            from_time: value.from,
            to_time: value.to,
            is_available: value.enabled
          })),
        specific_date_availability: specificDates
          .filter(date => date.date && date.enabled) // Only send dates with valid dates and enabled
          .map(date => ({
            date: date.date,
            from_time: date.from,
            to_time: date.to,
            is_available: date.enabled
          })),
        block_days: blockDays.map(day => ({
          date: day.date,
          from_time: day.from,
          to_time: day.to
        }))
      };

      console.log('Sending availability data:', availabilityData);

      const response = await providerAPI.createAvailability(availabilityData);
      
      if (response.success) {
        toast.success('Availability settings saved successfully!');
        // Optionally navigate back to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to save availability settings');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading && !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading availability settings...</p>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Manage Availability</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Dr. {provider?.first_name} {provider?.last_name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Time Zone Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Time Zone</h2>
            <div className="max-w-xs">
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="UTC-8">Pacific Time (UTC-8)</option>
                <option value="UTC-7">Mountain Time (UTC-7)</option>
                <option value="UTC-6">Central Time (UTC-6)</option>
                <option value="UTC-5">Eastern Time (UTC-5)</option>
                <option value="UTC+0">UTC</option>
                <option value="UTC+1">Central European Time (UTC+1)</option>
                <option value="UTC+5:30">India Standard Time (UTC+5:30)</option>
              </select>
            </div>
          </div>

          {/* Availability Type Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'weekly'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Weekly Schedule
                </button>
                <button
                  onClick={() => setActiveTab('specific')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'specific'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Specific Dates
                </button>
              </nav>
            </div>
          </div>

          {/* Weekly Availability */}
          {activeTab === 'weekly' && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Availability</h2>
              <div className="space-y-4">
                {days.map(({ key, label }) => (
                  <DayAvailabilityRow
                    key={key}
                    dayKey={key}
                    dayLabel={label}
                    data={availability[key]}
                    onToggle={() => handleDayToggle(key)}
                    onTimeChange={(field, value) => handleTimeChange(key, field, value)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Specific Date Availability */}
          {activeTab === 'specific' && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Specific Date Availability</h2>
                <button
                  onClick={addSpecificDate}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Add Specific Date</span>
                </button>
              </div>
              
              {specificDates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No specific dates configured</p>
                  <p className="text-sm">Add dates when you have different availability than your weekly schedule</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {specificDates.map(specificDate => (
                    <SpecificDateRow
                      key={specificDate.id}
                      data={specificDate}
                      onChange={(field, value) => handleSpecificDateChange(specificDate.id, field, value)}
                      onRemove={() => removeSpecificDate(specificDate.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Block Days */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Block Days</h2>
              <button
                onClick={addBlockDay}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Block Day</span>
              </button>
            </div>
            
            {blockDays.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No blocked days configured</p>
                <p className="text-sm">Add specific dates when you're not available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blockDays.map(blockDay => (
                  <BlockDayRow
                    key={blockDay.id}
                    data={blockDay}
                    onChange={(field, value) => handleBlockDayChange(blockDay.id, field, value)}
                    onRemove={() => removeBlockDay(blockDay.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Availability'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Day Availability Row (removed unwanted dropdown)
const DayAvailabilityRow = ({ dayKey, dayLabel, data, onToggle, onTimeChange }) => {
  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={onToggle}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-900 w-20">
          {dayLabel}
        </label>
      </div>
      
      {data.enabled && (
        <>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">From:</label>
            <input
              type="time"
              value={data.from}
              onChange={(e) => onTimeChange('from', e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">To:</label>
            <input
              type="time"
              value={data.to}
              onChange={(e) => onTimeChange('to', e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </>
      )}
      
      {!data.enabled && (
        <span className="text-sm text-gray-500 italic">Not available</span>
      )}
    </div>
  );
};

// Specific Date Row Component
const SpecificDateRow = ({ data, onChange, onRemove }) => {
  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-yellow-50">
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700">Date:</label>
        <input
          type="date"
          value={data.date}
          onChange={(e) => onChange('date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700">From:</label>
        <input
          type="time"
          value={data.from}
          onChange={(e) => onChange('from', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700">To:</label>
        <input
          type="time"
          value={data.to}
          onChange={(e) => onChange('to', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <button
        onClick={onRemove}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
        title="Remove specific date"
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  );
};

// Block Day Row Component
const BlockDayRow = ({ data, onChange, onRemove }) => {
  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-red-50">
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700">Date:</label>
        <input
          type="date"
          value={data.date}
          onChange={(e) => onChange('date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700">From:</label>
        <input
          type="time"
          value={data.from}
          onChange={(e) => onChange('from', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700">To:</label>
        <input
          type="time"
          value={data.to}
          onChange={(e) => onChange('to', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <button
        onClick={onRemove}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
        title="Remove block day"
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ProviderAvailability;
