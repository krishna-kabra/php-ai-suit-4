import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const ProviderRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePhoto: null,
    licenseDocument: null,
    licenseNumber: '',
    specialization: '',
    experience: '',
    qualifications: '',
    clinicName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    practiceType: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await api.get('/provider/specializations');
        setSpecializations(response.data.data);
      } catch (error) {
        toast.error('Failed to load specializations');
      }
    };
    fetchSpecializations();
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (acceptedFiles) => {
      setFormData({ ...formData, profilePhoto: acceptedFiles[0] });
      setImagePreview(URL.createObjectURL(acceptedFiles[0]));
    },
  });

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: newValue });

    if (name === 'password') checkPasswordStrength(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setErrors({ agreeToTerms: 'You must agree to the terms and conditions' });
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();

      payload.append('first_name', formData.firstName);
      payload.append('last_name', formData.lastName);
      payload.append('email', formData.email);
      payload.append('phone_number', formData.phone);
      payload.append('password', formData.password);
      payload.append('password_confirmation', formData.confirmPassword);
      payload.append('specialization', formData.specialization);
      payload.append('license_number', formData.licenseNumber);
      payload.append('years_of_experience', formData.experience);
      payload.append('medical_degree', formData.qualifications);
      payload.append('clinic_name', formData.clinicName);
      payload.append('practice_type', formData.practiceType);

      // ✅ Properly nest clinic_address fields
      payload.append('clinic_address[street]', formData.street);
      payload.append('clinic_address[city]', formData.city);
      payload.append('clinic_address[state]', formData.state);
      payload.append('clinic_address[zip]', formData.zip);

      if (formData.licenseDocument) {
        payload.append('license_document', formData.licenseDocument);
      }

      if (formData.profilePhoto) {
        payload.append('profile_photo', formData.profilePhoto);
      }

      await api.post('/provider/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Registration successful! Please check your email.');
      navigate('/login');
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['firstName', 'lastName', 'email', 'phone'].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 capitalize mb-1">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="p-3 rounded-md border border-gray-300 shadow-sm text-base"
                  />
                  {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                </div>
              ))}
            </div>

            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
              <input {...getInputProps()} />
              <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag & drop a profile photo or click to select
              </p>
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 h-24 mx-auto rounded-full object-cover" />}
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
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Specialization</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                >
                  <option value="">Select specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.name}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Experience (Years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  min={0}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Qualifications</label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                />
              </div>
            </div>
          </section>

          {/* Practice Information */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-600">Practice Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Clinic/Hospital Name</label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2 text-left">Practice Type</label>
                <select
                  name="practiceType"
                  value={formData.practiceType}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                >
                  <option value="">Select type</option>
                  <option value="Private Practice">Private Practice</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                </select>
              </div>

              {['street', 'city', 'state', 'zip'].map((field) => (
                <div className="flex flex-col" key={field}>
                  <label className="text-sm font-medium text-gray-700 mb-2 text-left capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Account Security */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-600">Account Security</h3>
            {['password', 'confirmPassword'].map((field) => (
              <div className="flex flex-col" key={field}>
                <label className="text-sm font-medium text-gray-700 mb-2 text-left capitalize">
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="password"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="p-4 rounded-md border border-gray-300 shadow-sm text-base"
                />
                {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
              </div>
            ))}

            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className={`h-full rounded-full ${
                  passwordStrength <= 25
                    ? 'bg-red-500'
                    : passwordStrength <= 50
                    ? 'bg-yellow-500'
                    : passwordStrength <= 75
                    ? 'bg-blue-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>

            <div className="flex items-start mt-4">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mr-2 mt-1"
              />
              <label className="text-sm text-gray-700">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => alert('Show terms modal or redirect')}
                  className="text-blue-600 underline bg-transparent border-none p-0 cursor-pointer"
                >
                  terms and conditions
                </button>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProviderRegister;
