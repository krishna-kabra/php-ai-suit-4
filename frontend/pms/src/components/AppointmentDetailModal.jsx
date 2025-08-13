import React, { useState } from 'react';
import { FaTimes, FaUser, FaCalendar, FaClock, FaStethoscope, FaPills, FaNotesMedical, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { providerAPI } from '../services/api';

const AppointmentDetailModal = ({ appointment, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    evaluation_notes: '',
    diagnosis: '',
    treatment_plan: '',
    prescriptions: [],
    follow_up_date: '',
    vital_signs: {
      blood_pressure: '',
      heart_rate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    next_appointment_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleEvaluationChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEvaluationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEvaluationData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addPrescription = () => {
    setEvaluationData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { medication: '', dosage: '', instructions: '' }]
    }));
  };

  const removePrescription = (index) => {
    setEvaluationData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const updatePrescription = (index, field, value) => {
    setEvaluationData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map((prescription, i) => 
        i === index ? { ...prescription, [field]: value } : prescription
      )
    }));
  };

  const handleCompleteAppointment = async (e) => {
    e.preventDefault();
    
    if (!evaluationData.evaluation_notes || !evaluationData.diagnosis || !evaluationData.treatment_plan) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await providerAPI.completeAppointment(appointment.id, evaluationData);
      
      if (response.success) {
        toast.success('Appointment completed successfully!');
        onUpdate(); // Refresh the appointments list
        onClose(); // Close the modal
      } else {
        throw new Error(response.message || 'Failed to complete appointment');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error(error.message || 'Failed to complete appointment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: '⏰' },
      completed: { color: 'bg-green-100 text-green-800', icon: '✅' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' },
      no_show: { color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaNotesMedical className="inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'evaluation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaStethoscope className="inline mr-2" />
              Evaluation
            </button>
            {appointment.status === 'completed' && (
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCheckCircle className="inline mr-2" />
                Completed
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {appointment.patient?.first_name} {appointment.patient?.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">Patient</p>
                </div>
                {getStatusBadge(appointment.status)}
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FaCalendar className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Appointment Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.episode_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FaClock className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Time</p>
                      <p className="text-sm text-gray-600">{appointment.episode_details}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FaStethoscope className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Type</p>
                      <p className="text-sm text-gray-600 capitalize">{appointment.episode_type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Patient Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      {appointment.notes || 'No notes provided'}
                    </p>
                  </div>
                  
                  {appointment.vitals && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Vitals</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {appointment.vitals || 'No vitals recorded'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {appointment.status === 'scheduled' && (
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setActiveTab('evaluation')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Complete Evaluation
                  </button>
                  <button
                    onClick={() => onClose()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Complete Evaluation</h3>
              
              <form onSubmit={handleCompleteAppointment} className="space-y-6">
                {/* Required Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evaluation Notes *
                    </label>
                    <textarea
                      value={evaluationData.evaluation_notes}
                      onChange={(e) => handleEvaluationChange('evaluation_notes', e.target.value)}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detailed evaluation findings..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis *
                    </label>
                    <textarea
                      value={evaluationData.diagnosis}
                      onChange={(e) => handleEvaluationChange('diagnosis', e.target.value)}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Primary diagnosis..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Plan *
                  </label>
                  <textarea
                    value={evaluationData.treatment_plan}
                    onChange={(e) => handleEvaluationChange('treatment_plan', e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Recommended treatment approach..."
                  />
                </div>

                {/* Vitals */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Vital Signs</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">BP</label>
                      <input
                        type="text"
                        value={evaluationData.vital_signs.blood_pressure}
                        onChange={(e) => handleEvaluationChange('vital_signs.blood_pressure', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="120/80"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">HR</label>
                      <input
                        type="text"
                        value={evaluationData.vital_signs.heart_rate}
                        onChange={(e) => handleEvaluationChange('vital_signs.heart_rate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Temp</label>
                      <input
                        type="text"
                        value={evaluationData.vital_signs.temperature}
                        onChange={(e) => handleEvaluationChange('vital_signs.temperature', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="98.6°F"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Weight</label>
                      <input
                        type="text"
                        value={evaluationData.vital_signs.weight}
                        onChange={(e) => handleEvaluationChange('vital_signs.weight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="70 kg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Height</label>
                      <input
                        type="text"
                        value={evaluationData.vital_signs.height}
                        onChange={(e) => handleEvaluationChange('vital_signs.height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="170 cm"
                      />
                    </div>
                  </div>
                </div>

                {/* Prescriptions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">Prescriptions</label>
                    <button
                      type="button"
                      onClick={addPrescription}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      + Add Medication
                    </button>
                  </div>
                  
                  {evaluationData.prescriptions.map((prescription, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">Medication {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removePrescription(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={prescription.medication}
                          onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                          placeholder="Medication name"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={prescription.dosage}
                          onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                          placeholder="Dosage"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={prescription.instructions}
                          onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                          placeholder="Instructions"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Follow-up and Next Appointment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={evaluationData.follow_up_date}
                      onChange={(e) => handleEvaluationChange('follow_up_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Appointment Date
                    </label>
                    <input
                      type="date"
                      value={evaluationData.next_appointment_date}
                      onChange={(e) => handleEvaluationChange('next_appointment_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Back to Details
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Completing...' : 'Complete Appointment'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'completed' && appointment.status === 'completed' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Completed Evaluation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Evaluation Notes</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                    {appointment.evaluation_notes}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                    {appointment.diagnosis}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Treatment Plan</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                  {appointment.treatment_plan}
                </p>
              </div>

              {appointment.prescriptions && appointment.prescriptions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Prescriptions</h4>
                  <div className="space-y-2">
                    {appointment.prescriptions.map((prescription, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium text-gray-900">{prescription.medication}</p>
                        <p className="text-sm text-gray-600">Dosage: {prescription.dosage}</p>
                        <p className="text-sm text-gray-600">Instructions: {prescription.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {appointment.follow_up_date && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Follow-up Date</h4>
                  <p className="text-gray-600">
                    {new Date(appointment.follow_up_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {appointment.next_appointment_date && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Next Appointment</h4>
                  <p className="text-gray-600">
                    {new Date(appointment.next_appointment_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal; 