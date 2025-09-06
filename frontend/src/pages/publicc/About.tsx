import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">About ImpactHub</h1>
        <p className="text-lg text-gray-700 text-center">
          ImpactHub is a charity donation platform built to empower donors with transparency, trust, and real-world impact. Our mission is to connect hearts and change lives by making charitable giving simple, secure, and meaningful.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Our Vision</h2>
            <p className="text-gray-600">To create a world where every act of generosity leads to measurable change and every donor feels the impact of their contribution.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Our Values</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Transparency & Trust</li>
              <li>Community Empowerment</li>
              <li>Real-World Impact</li>
              <li>Security & Privacy</li>
              <li>Continuous Improvement</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-indigo-700">Meet the Team</h2>
          <p className="text-gray-600 mb-4">A passionate group of developers, designers, and changemakers dedicated to making a difference.</p>
          <ul className="flex flex-wrap justify-center gap-6 text-gray-700">
            <li>Janitha Gamage – Product Owner</li>
            <li>Dewmini Navodya – Scrum Master</li>
            <li>Dulmi Kaushalya – Full-Stack Developer</li>
            <li>Yoshini Lakna – Full-Stack Developer</li>
          </ul>
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-indigo-700">Contact Us</h2>
          <p className="text-gray-600">Have questions or want to partner with us? <a href="/contact" className="text-indigo-600 hover:underline">Reach out here</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
