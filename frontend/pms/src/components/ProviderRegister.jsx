import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ProviderRegister = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    specialization_id: '',
    license_number: '',
    years_of_experience: '',
    address: '',
    bio: ''
  });
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await api.get('/specializations');
      setSpecializations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();

      payload.append('first_name', formData.first_name);
      payload.append('last_name', formData.last_name);
      payload.append('email', formData.email);
      payload.append('phone_number', formData.phone_number);
      payload.append('password', formData.password);
      payload.append('password_confirmation', formData.password_confirmation);
      payload.append('specialization_id', formData.specialization_id);
      payload.append('license_number', formData.license_number);
      payload.append('years_of_experience', formData.years_of_experience);
      payload.append('address', formData.address);
      payload.append('bio', formData.bio);

      const response = await api.post('/provider/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.success) {
        setSuccess(true);
        toast.success('Registration successful! Please check your email for verification.');
        
        // Redirect to provider login after successful registration
        setTimeout(() => {
          navigate('/provider/login');
        }, 2000);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        Object.values(error.response.data.errors).forEach((msg) =>
          toast.error(msg[0])
        );
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Provider Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-600">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  required
                />
                {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name[0]}</p>}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  required
                />
                {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name[0]}</p>}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  required
                />
                {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number[0]}</p>}
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-600">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Medical License Number</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  required
                />
                {errors.license_number && <p className="text-red-500 text-sm mt-1">{errors.license_number[0]}</p>}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Specialization</label>
                <select
                  name="specialization_id"
                  value={formData.specialization_id}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  required
                >
                  <option value="">Select specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
                {errors.specialization_id && <p className="text-red-500 text-sm mt-1">{errors.specialization_id[0]}</p>}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Years of Experience</label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  min={0}
                  required
                />
                {errors.years_of_experience && <p className="text-red-500 text-sm mt-1">{errors.years_of_experience[0]}</p>}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  required
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address[0]}</p>}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2 text-left">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                placeholder="Tell us about your medical background and expertise..."
              />
              {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio[0]}</p>}
            </div>
          </section>

          {/* Account Security */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-600">Account Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  required
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Confirm Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  required
                />
                {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation[0]}</p>}
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-md font-medium text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Navigation Links */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/provider/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <Link to="/" className="font-medium text-gray-600 hover:text-gray-500">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;
