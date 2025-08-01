import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Chatbot({ onClose, isMobile }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I’m Mitra. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [pendingSpecialty, setPendingSpecialty] = useState(null);
  const [suggestedDoctors, setSuggestedDoctors] = useState([]);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (pendingSpecialty && input.toLowerCase().includes('yes')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}suggest-doctor/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ specialty: pendingSpecialty })
        });
        const data = await res.json();

        if (data && Array.isArray(data.doctors) && data.doctors.length > 0) {
          setSuggestedDoctors(data.doctors);

          const doctorMsgs = data.doctors.map((doc) =>
            `👨‍⚕️ <a href="#" class="doctor-link" data-id="${doc.id}" style="color:#14532d;text-decoration:underline"><strong>Dr. ${doc.doctor_name}</strong></a><br/>🏥 ${doc.hospital_name}<br/>💰 Fees: Rs. ${doc.fees}<br/><br/>`
          ).join('');

          setMessages(prev => [...prev, { from: 'bot', text: doctorMsgs }]);
        } else {
          setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, no doctors found for this specialty.' }]);
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { from: 'bot', text: 'Something went wrong while fetching doctors.' }]);
      }

      setPendingSpecialty(null);
      return;
    }

    // Predict specialty
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}predict-specialty/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptom: input })
      });

      const data = await response.json();

      if (data.specialty) {
        setMessages(prev => [
          ...prev,
          {
            from: 'bot',
            text: `🩺 Based on your symptoms, you may need <strong>${data.specialty}</strong>.<br/><br/>💬 ${data.reasoning}<br/><br/>Would you like me to suggest a doctor for this specialty? (yes/no)`
          }
        ]);
        setPendingSpecialty(data.specialty);
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, I couldn’t determine the specialty.' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { from: 'bot', text: 'Oops! Something went wrong. Please try again.' }]);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleLinkClick = (e) => {
      const target = e.target;
      if (target.tagName === 'A' && target.classList.contains('doctor-link')) {
        e.preventDefault();
        const doctorId = target.dataset.id;
        if (doctorId) navigate(`/hospital-appointment/${doctorId}`);
      }
    };

    container.addEventListener('click', handleLinkClick);
    return () => container.removeEventListener('click', handleLinkClick);
  }, [navigate]);

  return (
    <div className={`flex flex-col ${isMobile ? 'h-screen' : 'h-[500px] w-[380px]'} bg-[#f2f1ee] shadow-xl overflow-hidden rounded-2xl`}>
      <div className="flex justify-between items-center p-4 bg-[#218551] text-white rounded-t-2xl">
        <h2 className="text-xl font-bold">Mitra Assistant</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-[#54ac53] transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div
        ref={chatContainerRef}
        className="overflow-y-auto p-4 space-y-4 scroll-smooth"
        style={{
          height: isMobile ? 'calc(100vh - 160px)' : '400px',
          maxHeight: '400px'
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-full p-3 rounded-xl text-lg break-words ${
                msg.from === 'bot' ? 'bg-[#cdddb2] text-[#218551]' : 'bg-[#91cc8a] text-white'
              }`}
            >
              <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#cdddb2] p-3 bg-white rounded-b-2xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-[#cdddb2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#54ac53] text-lg"
          />
          <button onClick={handleSend} className="p-3 bg-[#218551] text-white rounded-xl hover:bg-[#54ac53] transition">
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
