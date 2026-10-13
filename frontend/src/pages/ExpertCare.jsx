import { useState, useEffect } from 'react';
import { Star, Clock, Video, Calendar, Search, MapPin, Shield, Award } from 'lucide-react';
import { trackPendoEvent } from '../utils/pendo';

const doctors = [
  {
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    rating: 4.9,
    experience: '15 years',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    availability: 'Available Today',
    location: 'New York, NY',
    languages: ['English', 'Spanish'],
    certifications: ['American Board of Cardiology', 'Fellow of Cardiology'],
    nextAvailable: '2:30 PM Today',
    consultationFee: '$150'
  },
  {
    name: 'Dr. Michael Chen',
    specialty: 'Nutritionist',
    rating: 4.8,
    experience: '10 years',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    availability: 'Next Available: Tomorrow',
    location: 'Los Angeles, CA',
    languages: ['English', 'Mandarin'],
    certifications: ['Certified Nutrition Specialist', 'Sports Nutrition Expert'],
    nextAvailable: '10:00 AM Tomorrow',
    consultationFee: '$100'
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialty: 'Physical Therapist',
    rating: 4.7,
    experience: '12 years',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    availability: 'Available Today',
    location: 'Chicago, IL',
    languages: ['English', 'Portuguese'],
    certifications: ['Doctor of Physical Therapy', 'Sports Therapy Certified'],
    nextAvailable: '4:00 PM Today',
    consultationFee: '$120'
  }
];

const specialties = ['All Specialties', 'Cardiologist', 'Nutritionist', 'Physical Therapist', 'Dermatologist', 'Psychologist'];
const locations = ['All Locations', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX'];

// Wait until the user stops typing / changing filters before recording a search
const SEARCH_TRACKING_DELAY_MS = 1000;

// Defaults match the first option of each booking modal field
const initialBookingDetails = {
  appointmentDate: '',
  appointmentTime: '9:00 AM',
  consultationType: 'Video Call',
  notes: ''
};

const ExpertCare = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(initialBookingDetails);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All Specialties' || doctor.specialty === selectedSpecialty;
    const matchesLocation = selectedLocation === 'All Locations' || doctor.location === selectedLocation;
    return matchesSearch && matchesSpecialty && matchesLocation;
  });
  const resultsCount = filteredDoctors.length;

  // Pendo: record the combined search / filter state once the user pauses (skips the unfiltered default)
  useEffect(() => {
    const isDefaultSearch =
      !searchTerm.trim() && selectedSpecialty === 'All Specialties' && selectedLocation === 'All Locations';
    if (isDefaultSearch) return;

    const timeoutId = setTimeout(() => {
      trackPendoEvent('doctor_search_performed', {
        searchTerm: searchTerm.trim().slice(0, 100),
        selectedSpecialty,
        selectedLocation,
        resultsCount
      });
    }, SEARCH_TRACKING_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSpecialty, selectedLocation, resultsCount]);

  const handleBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingDetails(initialBookingDetails);
    setShowBookingModal(true);
  };

  const handleBookingDetailChange = (e) => {
    setBookingDetails({
      ...bookingDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleConfirmBooking = () => {
    // Pendo: consultation booking confirmed. There is no booking API yet, so this fires on confirm.
    // Only whether notes were added is sent, never the notes text.
    trackPendoEvent('appointment_booked', {
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      location: selectedDoctor.location,
      consultationFee: selectedDoctor.consultationFee,
      rating: selectedDoctor.rating,
      availability: selectedDoctor.availability,
      consultationType: bookingDetails.consultationType,
      appointmentDate: bookingDetails.appointmentDate || undefined,
      appointmentTime: bookingDetails.appointmentTime,
      hasNotes: Boolean(bookingDetails.notes.trim())
    });
    setShowBookingModal(false);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expert Care</h1>
          <p className="text-gray-600">Connect with healthcare professionals for virtual consultations</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors or specialties..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="relative h-48">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-teal-600">
                  {doctor.availability}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{doctor.name}</h3>
                <div className="flex items-center mb-2">
                  <Award className="w-4 h-4 text-teal-600 mr-2" />
                  <p className="text-gray-600">{doctor.specialty}</p>
                </div>
                
                <div className="flex items-center mb-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="ml-2 text-gray-700">{doctor.rating}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="ml-2 text-gray-700">{doctor.experience}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {doctor.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    Next Available: {doctor.nextAvailable}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Shield className="w-4 h-4 mr-2 text-gray-400" />
                    {doctor.certifications[0]}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((language, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {language}
                      </span>
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-teal-600">{doctor.consultationFee}</span>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleBooking(doctor)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Book Video Call
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors">
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Book Appointment with {selectedDoctor.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={bookingDetails.appointmentDate}
                    onChange={handleBookingDetailChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Time
                  </label>
                  <select
                    name="appointmentTime"
                    value={bookingDetails.appointmentTime}
                    onChange={handleBookingDetailChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option>9:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Type
                  </label>
                  <select
                    name="consultationType"
                    value={bookingDetails.consultationType}
                    onChange={handleBookingDetailChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option>Video Call</option>
                    <option>Voice Call</option>
                    <option>Chat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={bookingDetails.notes}
                    onChange={handleBookingDetailChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Any specific concerns or questions..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertCare;