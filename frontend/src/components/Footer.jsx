import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className='bg-gray-800 text-gray-300'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>

          {/* Column 1: Logo and About */}
          <div className='flex flex-col items-start'>
            <img className='mb-5 w-48' src={assets.logo} alt="UpacharMitra Logo" />
            <p className='text-sm leading-6'>
              Connecting you with trusted doctors and hospitals for seamless, accessible healthcare. Your health is our priority.
            </p>
            <div className='flex gap-4 mt-6'>
              {/* Social Media Icons */}
              <a href="#" className='hover:opacity-80 transition-opacity'><img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="facebook" className='w-6 h-6'/></a>
              <a href="#" className='hover:opacity-80 transition-opacity'><img src="https://img.icons8.com/ios-filled/50/ffffff/twitter.png" alt="twitter" className='w-6 h-6'/></a>
              <a href="#" className='hover:opacity-80 transition-opacity'><img src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" alt="linkedin" className='w-6 h-6'/></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className='text-xl font-semibold text-white mb-5'>QUICK LINKS</h3>
            <ul className='flex flex-col gap-3 text-sm'>
              <li><Link to="/" className='hover:text-white transition-colors'>Home</Link></li>
              <li><Link to="/hospitals" className='hover:text-white transition-colors'>Hospitals</Link></li>
              <li><Link to="/doctors" className='hover:text-white transition-colors'>Doctors</Link></li>
              <li><Link to="/about" className='hover:text-white transition-colors'>About Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className='text-xl font-semibold text-white mb-5'>GET IN TOUCH</h3>
            <ul className='flex flex-col gap-3 text-sm'>
              <li className='flex items-center gap-2'>
                <span>📞</span>
                <span>+977-9800000000</span>
              </li>
              <li className='flex items-center gap-2'>
                <span>📧</span>
                <span>contact@upacharmitra.com</span>
              </li>
              <li className='flex items-center gap-2'>
                <span>📍</span>
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className='border-t border-gray-700'>
        <p className='py-5 text-sm text-center text-gray-500'>
          Copyright 2024 © UpacharMitra.com - All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;