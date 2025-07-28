import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogTitle, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectItem } from './ui/select';
import axios from 'axios';

const ProviderAvailability = () => {
  const providerId = '1'; // Replace with dynamic ID if needed
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    timezone: 'Asia/Kolkata',
    isRecurring: false,
    recurrencePattern: '',
    recurrenceEndDate: '',
    slotDuration: 30,
    breakDuration: 0,
    maxAppointments: 1,
    appointmentType: '',
    locationType: '',
    address: '',
    roomNumber: '',
    baseFee: '',
    insuranceAccepted: false,
    currency: 'USD',
    notes: '',
    specialRequirements: '',
  });

  // Fetch availability from API on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem('token');
        const startDate = new Date().toISOString().slice(0, 10);
        const endDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10); // 7 days ahead

        const res = await axios.get(`http://localhost:8000/api/v1/provider/1/availability`, {
          params: { start_date: startDate, end_date: endDate },
          headers: { Authorization: `Bearer ${token}` },
        });

        const transformed = res.data.data.availability.flatMap((day) =>
          day.slots.map((slot) => ({
            id: slot.slot_id,
            title: slot.appointment_type,
            start: `${day.date}T${slot.start_time}`,
            end: `${day.date}T${slot.end_time}`,
          }))
        );

        setEvents(transformed);
      } catch (err) {
        console.error('Failed to fetch availability:', err);
      }
    };

    fetchAvailability();
  }, []);

  const handleDateClick = (arg) => {
    setFormData((prev) => ({ ...prev, date: arg.dateStr }));
    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      provider_id: providerId,
      date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      timezone: formData.timezone,
      is_recurring: formData.isRecurring,
      recurrence_pattern: formData.recurrencePattern,
      recurrence_end_date: formData.recurrenceEndDate,
      slot_duration: Number(formData.slotDuration),
      break_duration: Number(formData.breakDuration),
      max_appointments: Number(formData.maxAppointments),
      appointment_type: formData.appointmentType,
      location: {
        type: formData.locationType,
        address: formData.address,
        room_number: formData.roomNumber,
      },
      pricing: {
        base_fee: formData.baseFee,
        currency: formData.currency,
        insurance_accepted: formData.insuranceAccepted,
      },
      notes: formData.notes,
      special_requirements: formData.specialRequirements,
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/v1/provider/availability', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newEvent = {
        title: formData.appointmentType,
        start: `${formData.date}T${formData.startTime}`,
        end: `${formData.date}T${formData.endTime}`,
      };

      setEvents((prev) => [...prev, newEvent]);
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to save availability:', error);
    }
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        dateClick={handleDateClick}
        events={events}
        height="auto"
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTitle>Add Availability</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
            <Input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} />
            <Input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} />
            <Input type="number" name="baseFee" value={formData.baseFee} onChange={handleInputChange} placeholder="Base Fee" />

            <Select label="Appointment Type" name="appointmentType" value={formData.appointmentType} onChange={handleSelectChange}>
              <SelectItem value="">-- Select Type --</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="telemedicine">Telemedicine</SelectItem>
            </Select>

            <Select label="Location Type" name="locationType" value={formData.locationType} onChange={handleSelectChange}>
              <SelectItem value="">-- Select Location --</SelectItem>
              <SelectItem value="clinic">Clinic</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="telemedicine">Telemedicine</SelectItem>
              <SelectItem value="home_visit">Home Visit</SelectItem>
            </Select>

            <Input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" />
            <Input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} placeholder="Room Number" />
            <Input type="number" name="slotDuration" value={formData.slotDuration} onChange={handleInputChange} placeholder="Slot Duration" />
            <Input type="number" name="breakDuration" value={formData.breakDuration} onChange={handleInputChange} placeholder="Break Duration" />
            <Input type="number" name="maxAppointments" value={formData.maxAppointments} onChange={handleInputChange} placeholder="Max Appointments" />
            <Input type="text" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Notes" />

            <div className="col-span-full">
              <Button onClick={handleSubmit}>Save Availability</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderAvailability;
