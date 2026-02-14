import React, { useState } from "react";
import axios from "axios";
import Map from "../components/Map";

const Touch = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // {type: 'success'|'error', message: ''}

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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/contact`,
        formData
      );

      showNotification("success", "Email sent successfully!");

      setFormData({
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        phone: "",
        message: "",
      });

    } catch (err) {
      console.error(err.response?.data || err.message);

      showNotification(
        "error",
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mt-20 mx-auto px-4 py-16">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-lg shadow-2xl transform transition-all duration-300 animate-slide-in ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
          >
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

        {/* Intro Text */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-blue-600 font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 text-xxl">
            Our experts are always happy to discuss your challenge. Reach out, and we will connect <br /> you with a member of our team.
          </p>
           <div className="flex flex-row gap-5">
            <div className="max-w-5xl">Book a call</div>
            <div>Email us directly</div>
          </div>

        </div>

        {/* Form */}
        <div className="bg-gray-50 p-8 pt-2  rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-10 text-center">The opportunities are here. So why wait?</h2>
         
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">First Name</label>
              <input
                name="firstName"
                type="text"
                placeholder="Your first name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Last Name</label>
              <input
                name="lastName"
                type="text"
                placeholder="Your last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone Number</label>
              <input
                name="phone"
                type="tel"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Message</label>
              <textarea
                name="message"
                placeholder="How can we help you . . . . ?"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Submit button with spinner */}
            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-[30%] px-6 py-3 rounded-xl font-bold transition shadow-lg ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  } text-white`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div>
        <Map />
      </div>

      {/* Toast animation */}
      <style>{`
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`}</style>
    </>
  );
};

export default Touch;