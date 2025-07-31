import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const BookAppointment = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [episodeDetails, setEpisodeDetails] = useState('');
  const [vitals, setVitals] = useState('');
  const [episodeOccurDate, setEpisodeOccurDate] = useState('');

  const fetchSlots = async (date) => {
    try {
      const res = await api.get(`/appointment-slots?date=${date}`);
      setSlots(res.data.slots || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Unauthorized. Please log in again.');
      } else {
        toast.error('Failed to fetch slots');
      }
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!selectedSlot || !episodeOccurDate) {
      toast.warning('Please select a time slot and enter episode occur date');
      return;
    }

    try {
      await api.post('/book-appointment', {
        slot_id: selectedSlot.id,
        episode_details: episodeDetails,
        vitals,
        episode_occur_date: episodeOccurDate,
      });

      toast.success('Appointment booked successfully');
    } catch (err) {
      toast.error('Booking failed. Please try again.');
    }
  };

  return (
    <div className="w-screen">
      {/* Header Section */}
      <div className="relative mx-auto mt-20 mb-20 max-w-screen-lg overflow-hidden rounded-t-xl bg-emerald-400/60 py-32 text-center shadow-xl shadow-gray-300">
        <h1 className="mt-2 px-8 text-3xl font-bold text-white md:text-5xl">Book an Appointment</h1>
        <p className="mt-6 text-lg text-white">Choose your preferred date and time</p>
        <img
          className="absolute top-0 left-0 -z-10 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1504672281656-e4981d70414b"
          alt=""
        />
      </div>

      <div className="mx-auto grid max-w-screen-lg px-6 pb-20 gap-6">
        {/* Date Picker */}
        <div>
          <p className="mt-4 font-serif text-xl font-bold text-blue-900">Select a date</p>
          <div className="relative mt-4 w-56">
            <input
              type="date"
              className="datepicker-input block w-full rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 pl-3 text-emerald-800 outline-none focus:ring focus:ring-emerald-300 sm:text-sm"
              onChange={(e) => setSelectedDate(e.target.value)}
              value={selectedDate}
            />
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <p className="mt-8 font-serif text-xl font-bold text-blue-900">Select a time</p>
          <div className="mt-4 grid grid-cols-4 gap-2 lg:max-w-xl">
            {slots.length === 0 ? (
              <p className="col-span-4 text-gray-600 italic">No slots available</p>
            ) : (
              slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg px-4 py-2 font-medium ${
                    selectedSlot?.id === slot.id
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {new Date(slot.slot_start_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Selected Slot Details */}
        {selectedSlot && (
          <div className="mt-6 bg-white p-4 rounded-md shadow-md">
            <h3 className="text-xl font-semibold text-emerald-700">Selected Slot</h3>
            <p><strong>Provider:</strong> {selectedSlot.provider?.first_name} {selectedSlot.provider?.last_name}</p>
            <p><strong>Date:</strong> {new Date(selectedSlot.slot_start_time).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {new Date(selectedSlot.slot_start_time).toLocaleTimeString([], {
              hour: '2-digit', minute: '2-digit'
            })} - {new Date(selectedSlot.slot_end_time).toLocaleTimeString([], {
              hour: '2-digit', minute: '2-digit'
            })}</p>
          </div>
        )}

        {/* Patient Inputs */}
        <div className="mt-6 grid gap-4 lg:max-w-xl">
          <div>
            <label className="block mb-1 text-blue-900 font-semibold">Episode Details</label>
            <textarea
              rows={3}
              value={episodeDetails}
              onChange={(e) => setEpisodeDetails(e.target.value)}
              className="w-full rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Describe the issue or symptoms..."
            />
          </div>

          <div>
            <label className="block mb-1 text-blue-900 font-semibold">Vitals</label>
            <input
              type="text"
              value={vitals}
              onChange={(e) => setVitals(e.target.value)}
              className="w-full rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="e.g., BP: 120/80, Temp: 98.6°F"
            />
          </div>

          <div>
            <label className="block mb-1 text-blue-900 font-semibold">Episode Occur Date</label>
            <input
              type="date"
              value={episodeOccurDate}
              onChange={(e) => setEpisodeOccurDate(e.target.value)}
              className="w-full rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="mt-8 w-56 rounded-full border-8 border-emerald-500 bg-emerald-600 px-10 py-4 text-lg font-bold text-white transition hover:translate-y-1"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default BookAppointment;
