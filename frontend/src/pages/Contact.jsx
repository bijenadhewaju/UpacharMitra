import React from 'react';

// --- SVG Icons for Contact Details (for a professional look) ---
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);


const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would handle the form submission, e.g., send data to a backend or an email service
    alert("Thank you for your message! We will get back to you soon.");
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* --- Header --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Get In <span className="text-green-600">Touch</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            We'd love to hear from you. Please fill out the form below or reach us through our contact details.
          </p>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* --- Left Side: Contact Form --- */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="name" required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="email" required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"/>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" rows="5" required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
              </div>
              <div>
                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300">
                  Submit Message
                </button>
              </div>
            </form>
          </div>

          {/* --- Right Side: Contact Info --- */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg flex items-start space-x-6">
              <div className="flex-shrink-0 bg-green-600 p-4 rounded-full">
                <LocationIcon />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Our Office</h3>
                <p className="mt-1 text-gray-600">
                  123 Health Lane, Medical Plaza <br />
                  Pokhara, Gandaki Province, Nepal
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg flex items-start space-x-6">
              <div className="flex-shrink-0 bg-green-600 p-4 rounded-full">
                <PhoneIcon />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Phone</h3>
                <p className="mt-1 text-gray-600">+977-61-5550132</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg flex items-start space-x-6">
              <div className="flex-shrink-0 bg-green-600 p-4 rounded-full">
                <EmailIcon />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Email</h3>
                <p className="mt-1 text-gray-600">contact@upacharmitra.com</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;