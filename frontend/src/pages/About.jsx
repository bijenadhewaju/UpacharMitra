import React from 'react';
import { assets } from '../assets/assets';

// Simple SVG icons for the "Why Choose Us" section
const EfficiencyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ConvenienceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PersonalizationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);


const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* --- Section 1: ABOUT US --- */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          ABOUT <span className="text-green-600">US</span>
        </h1>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <img 
          className="w-full md:w-5/12 rounded-lg shadow-2xl object-cover" 
          src={assets.about_image} 
          alt="Doctors collaborating" 
        />
        <div className="flex-1 text-gray-700 space-y-4 text-lg leading-relaxed">
          <p>
            Welcome to <strong>UpacharMitra</strong>, your trusted partner in managing your healthcare needs conveniently and efficiently. We understand the challenges individuals face when it comes to scheduling doctor appointments and managing health records.
          </p>
          <h2 className="text-2xl font-bold text-gray-800 pt-4">Our Vision</h2>
          <p>
            Our vision is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
          </p>
          <p>
            UpacharMitra is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service.
          </p>
        </div>
      </div>

      {/* --- Section 2: WHY CHOOSE US --- */}
      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            WHY <span className="text-green-600">CHOOSE US</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Card 1: Efficiency */}
          <div className="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
            <div className="flex justify-center items-center mb-4">
              <EfficiencyIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">EFFICIENCY</h3>
            <p className="text-gray-600">
              Streamlined appointment scheduling that fits into your busy lifestyle.
            </p>
          </div>
          
          {/* Card 2: Convenience */}
          <div className="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
            <div className="flex justify-center items-center mb-4">
              <ConvenienceIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">CONVENIENCE</h3>
            <p className="text-gray-600">
              Access to a network of trusted healthcare professionals in your area.
            </p>
          </div>

          {/* Card 3: Personalization */}
          <div className="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
            <div className="flex justify-center items-center mb-4">
              <PersonalizationIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">PERSONALIZATION</h3>
            <p className="text-gray-600">
              Tailored recommendations and reminders to help you stay on top of your health.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;