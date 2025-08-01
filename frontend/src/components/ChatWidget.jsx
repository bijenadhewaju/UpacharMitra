import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Chatbot from './Chatbot';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (showGreeting) {
      const timer = setTimeout(() => setShowGreeting(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showGreeting]);

  return (
    <>
      {/* Chatbot Popup Panel - Right Side */}
      {open && (
        <div className={`fixed ${isMobile ? 'inset-0' : 'bottom-24 right-6'} z-50`}>
          <Chatbot onClose={() => setOpen(false)} isMobile={isMobile} />
        </div>
      )}

      {/* Floating Button with Greeting - Right Side */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {showGreeting && (
            <div className="bg-[#91cc8a] text-[#218551] px-4 py-2 rounded-xl shadow-lg text-base max-w-[240px] animate-fade-in">
              Welcome! How can I help you?
            </div>
          )}
          <button
            onClick={() => {
              setOpen(true);
              setShowGreeting(false);
            }}
            className="flex items-center gap-3 bg-[#218551] text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#54ac53] transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-lg font-medium">Mitra</span>
          </button>
        </div>
      )}
    </>
  );
}