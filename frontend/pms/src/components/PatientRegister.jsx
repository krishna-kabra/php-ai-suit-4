import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const PatientRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    password: '',
    password_confirmation: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    },
    insurance_info: {
      provider: '',
      policy_number: ''
    },
    terms_accepted: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, address: { ...formData.address, [field]: value } });
    } else if (name.startsWith('emergency_contact.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, emergency_contact: { ...formData.emergency_contact, [field]: value } });
    } else if (name.startsWith('insurance_info.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, insurance_info: { ...formData.insurance_info, [field]: value } });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

    if (!formData.terms_accepted) {
      setErrors({ terms_accepted: 'You must accept the terms and conditions' });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/patient/register', formData);
      if (response.success) {
        setSuccess(true);
        toast.success('Registration successful! Please check your email for verification.');
        
        // Redirect to patient login after successful registration
        setTimeout(() => {
          navigate('/patient/login');
        }, 2000);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        Object.values(error.response.data.errors).forEach((msg) => toast.error(msg[0]));
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Patient Registration</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <section>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['first_name', 'last_name', 'email', 'phone_number', 'date_of_birth'].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}</label>
                  <input
                    type={field === 'email' ? 'email' : field === 'date_of_birth' ? 'date' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="p-3 rounded-md border border-gray-300 shadow-sm"
                  />
                  {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                </div>
              ))}

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="p-3 rounded-md border border-gray-300 shadow-sm"
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
            </div>
          </section>

          {/* Address Info */}
          <section>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['street', 'city', 'state', 'zip'].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 capitalize">{field}</label>
                  <input
                    type="text"
                    name={`address.${field}`}
                    value={formData.address[field]}
                    onChange={handleInputChange}
                    className="p-3 rounded-md border border-gray-300 shadow-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Emergency Contact */}
          <section>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['name', 'phone', 'relationship'].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 capitalize">{field}</label>
                  <input
                    type="text"
                    name={`emergency_contact.${field}`}
                    value={formData.emergency_contact[field]}
                    onChange={handleInputChange}
                    className="p-3 rounded-md border border-gray-300 shadow-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Insurance Info */}
          <section>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Insurance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['provider', 'policy_number'].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 capitalize">{field.replace('_', ' ')}</label>
                  <input
                    type="text"
                    name={`insurance_info.${field}`}
                    value={formData.insurance_info[field]}
                    onChange={handleInputChange}
                    className="p-3 rounded-md border border-gray-300 shadow-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Password */}
          <section>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Set Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['password', 'password_confirmation'].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 capitalize">{field.replace('_', ' ')}</label>
                  <input
                    type="password"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="p-3 rounded-md border border-gray-300 shadow-sm"
                  />
                  {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Terms and Submit */}
          <div className="flex items-start mt-4">
            <input
              type="checkbox"
              name="terms_accepted"
              checked={formData.terms_accepted}
              onChange={handleInputChange}
              className="mr-2 mt-1"
            />
            <label className="text-sm text-gray-700">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => alert('Show terms modal or redirect')}
                className="text-blue-600 underline"
              >
                terms and conditions
              </button>
            </label>
          </div>
          {errors.terms_accepted && (
            <p className="text-red-500 text-sm">{errors.terms_accepted}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/patient/login" className="font-medium text-green-600 hover:text-green-500">
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

export default PatientRegister;
