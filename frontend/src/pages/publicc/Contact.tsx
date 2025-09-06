import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Contact Us</h1>
        <p className="text-lg text-gray-700 text-center">
          We're here to help! Reach out to us with any questions, feedback, or partnership opportunities.
        </p>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-indigo-600" />
            <span className="text-gray-700">support@impacthub.org</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-indigo-600" />
            <span className="text-gray-700">+94 91 222 2226</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-indigo-600" />
            <span className="text-gray-700">17/F New Kandy Road, Yakkala</span>
          </div>
        </div>
        <form className="mt-8 space-y-4">
          <input type="text" placeholder="Your Name" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <input type="email" placeholder="Your Email" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <textarea placeholder="Your Message" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={4} required />
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-2 rounded-md hover:from-indigo-700 hover:to-blue-700 transition-colors">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
