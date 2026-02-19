import React, { useState } from "react";
import axios from "axios";
import Map from "../components/Map";
import { useNavigate } from "react-router-dom";
import { PhoneCall, Building2, Mail, ArrowUpRight } from "lucide-react";

const Touch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, formData);
      showNotification("success", "Email sent successfully!");
      setFormData({ firstName: "", lastName: "", company: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error(err.response?.data || err.message);
      showNotification("error", err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cards = [
    {
      icon: PhoneCall,
      label: "Book a Call",
      desc: "Schedule a consultation & speak directly with our experts. Choose a time that works best for you.",
      color: "text-blue-600",
      iconBg: "bg-blue-100",
      iconBorder: "border-blue-200",
      hoverBorder: "hover:border-blue-500",
      hoverIcon: "group-hover:bg-blue-600 group-hover:text-white",
      glow: "bg-blue-50",
      cta: "text-blue-600",
      onClick: () => navigate("/call"),
    },
    {
      icon: Mail,
      label: "Email Us Directly",
      desc: "Prefer writing? Send us your message using the form given below and we'll respond within  24 hours.",
      color: "text-slate-600",
      iconBg: "bg-slate-200",
      iconBorder: "border-slate-200",
      hoverBorder: "hover:border-slate-500",
      hoverIcon: "group-hover:bg-slate-600 group-hover:text-white",
      glow: "bg-slate-100",
      cta: "text-slate-600",
      onClick: () => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      icon: Building2,
      label: "Company Registration",
      desc: "Register your company with us and unlock partnership opportunities. Quick and easy process.",
      color: "text-green-600",
      iconBg: "bg-green-100",
      iconBorder: "border-green-200",
      hoverBorder: "hover:border-green-500",
      hoverIcon: "group-hover:bg-green-600 group-hover:text-white",
      glow: "bg-green-50",
      cta: "text-green-600",
      onClick: () => navigate("/companyform"),
    },
  ];

  const stats = [
    { emoji: "⚡", text: "Response within 24h" },
    { emoji: "🤝", text: "500+ companies served" },
    { emoji: "✦", text: "Free consultation" },
  ];

  return (
    <>
      <div className="max-w-5xl mt-20 mx-auto px-4 py-16">

        {/* Toast Notification */}
        {notification && (
          <div className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-lg shadow-2xl transform transition-all duration-300 animate-slide-in ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}>
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                {notification.type === "success" ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{notification.type === "success" ? "Success!" : "Error"}</p>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="shrink-0 ml-2 hover:opacity-75 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>          
          </div>
        )}

        {/* Intro */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-blue-600 font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 text-lg mb-6">
            Our experts are always happy to discuss your challenge. Reach out, and we will connect <br />
            you with a member of our team.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {stats.map((s) => (
              <span
                key={s.text}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 bg-slate-100 border border-slate-200"
              >
                <span>{s.emoji}</span>{s.text}
              </span>
            ))}
          </div>

          {/* Cards */}
          <div className="flex flex-col sm:flex-row justify-center items-stretch gap-8  max-w-6xl mx-auto">
            {cards.map((c) => (
              <div
                key={c.label}
                onClick={c.onClick}
                className={`flex flex-col h-full flex-1 bg-white rounded-2xl p-6 cursor-pointer text-left group relative overflow-hidden border min-w-[350px] border-slate-200 ${c.hoverBorder} hover:-translate-y-1 hover:shadow-xl transition-all duration-250`}
              >
                {/* Glow blob */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c.glow}`}
                  style={{ transform: "translate(40%, -40%)" }} />

                {/* Icon */}
                <div className={`relative w-13 h-13 flex items-center justify-center rounded-2xl mb-5 border transition-all duration-250 group-hover:scale-105 ${c.iconBg} ${c.iconBorder} ${c.color} ${c.hoverIcon}`}
                  style={{ width: 59, height: 59 }}>
                  <c.icon size={32} />
                </div>

                <h3 className="relative text-2xl whitespace-nowrap  font-bold text-slate-900 mb-2">{c.label}</h3>
                <p className="relative text-slate-500 text-md leading-relaxed mb-5">{c.desc}</p>

                <div className={`relative inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 mt-auto transition-all duration-200 ${c.cta}`}>
                  Get started
                  <ArrowUpRight size={15} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-50 p-8 pt-12 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-10 text-center">The opportunities are here. So why wait?</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">First Name</label>
              <input name="firstName" type="text" placeholder="Your first name"
                value={formData.firstName} onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium">Last Name</label>
              <input name="lastName" type="text" placeholder="Your last name"
                value={formData.lastName} onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone Number</label>
              <input name="phone" type="tel" placeholder="Your phone number"
                value={formData.phone} onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input name="email" type="email" placeholder="Your email address"
                value={formData.email} onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required disabled={isSubmitting} />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Message</label>
              <textarea name="message" placeholder="How can we help you . . . . ?"
                rows="5" value={formData.message} onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required disabled={isSubmitting} />
            </div>

            <div className="md:col-span-2 text-center">
              <button type="submit" disabled={isSubmitting}
                className={`w-[30%] px-6 py-3 rounded-xl font-bold transition shadow-lg text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div><Map /></div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default Touch;