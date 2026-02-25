import React, { useState } from "react";
import axios from "axios";
import { Clock, BarChart2, Map, CalendarCheck, CheckCircle2 } from "lucide-react";

const Call = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookCall = async (e) => {
    e.preventDefault();
    if (!name || !phone || !topic || !date || !time) return;
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, { name, phone, topic, date, time });
      setShowSuccess(true);
      setName(""); setPhone(""); setTopic(""); setDate(""); setTime("");
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      alert("Failed to book call. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const perks = [
    { icon: Clock, text: "30-minute strategy discussion" },
    { icon: BarChart2, text: "Technical & business evaluation" },
    { icon: Map, text: "Clear roadmap & recommendations" },
  ];

  const steps = [
    { n: "1", label: "Fill the form" },
    { n: "2", label: "We confirm your slot" },
    { n: "3", label: "Join the call" },
  ];

  return (
    <div className="relative max-w-5xl mx-auto mt-10 px-4 py-20 text-left">

      {/* Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-start gap-3 bg-white border border-green-200 border-l-4 border-l-green-500 rounded-xl px-5 py-4 shadow-xl animate-slide-in min-w-72">
          <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-green-700">Call Booked!</p>
            <p className="text-sm text-slate-500 mt-0.5">We'll contact you at the scheduled time.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Free Consultation
        </span>
        <h1 className="text-4xl text-blue-600 font-bold mb-3">Book a Consultation Call</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Schedule a one-on-one session with our experts and get a clear path forward for your project.
        </p>
      </div>

      {/* How it works strip */}
      <div className="flex items-center max-w-lg mx-auto mb-12 px-2">
        {steps.map((step, i) => (
          <React.Fragment key={step.n}>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {step.n}
              </div>
              <span className="text-sm text-slate-500 font-medium whitespace-nowrap">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-slate-200 mx-3 min-w-4" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Body */}
      <div className="grid md:grid-cols-2 gap-10 items-start">

        {/* Left */}
        <div className="space-y-4 mr-10">
          <h2 className="text-2xl text-blue-600 font-semibold mb-6">What to Expect <span className="text-3xl">↴</span></h2>
          {perks.map((p) => (
            <div key={p.text}
              className="flex items-center gap-4 border border-slate-200 rounded-2xl p-4 bg-white hover:border-blue-300 hover:shadow-md hover:translate-x-1 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <p.icon size={18} />
              </div>
              <span className="text-sm font-medium text-slate-700">{p.text}</span>
            </div>
          ))}
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
            ✦ &nbsp;No commitment required — the call is completely free.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleBookCall} className="border border-slate-200 w-[550px] rounded-2xl p-8  shadow-sm space-y-5  bg-white">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarCheck size={22} className="text-blue-600" />
            Schedule Your Call
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Your Name" required disabled={isSubmitting} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+91 XXXXX XXXXX" required disabled={isSubmitting} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Topic / Discussion</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              placeholder="What do you want to discuss?" rows={3} required disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required disabled={isSubmitting} />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition shadow-lg text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}>
            {isSubmitting ? "Booking your call..." : (
              <><CalendarCheck size={18} /> Confirm Booking</>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>
    </div>
  );
};

export default Call;