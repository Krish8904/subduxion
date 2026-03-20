import React, { useState } from "react";
import { Building2, Calendar, User, DollarSign, X } from "lucide-react";

const ServicesForm = ({ editData = null, onSuccess = null, onClose = null }) => {
  const isEditMode = !!editData;

  const emptyForm = {
    serviceName: "",
    description: "",
    estimatedCost: "",
    actualCost: "",
    taxPercent: "",
    discount: "",
    totalPayable: "",
    dateOfService: "",
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    paymentMethod: "",
  };

  const [formData, setFormData] = useState(editData || emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const inputCls = "w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white";

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    // Auto-calculate total
    if (["estimatedCost", "taxPercent", "discount"].includes(name)) {
      const est = parseFloat(updated.estimatedCost) || 0;
      const tax = parseFloat(updated.taxPercent) || 0;
      const disc = parseFloat(updated.discount) || 0;
      updated.totalPayable = (est + (est * tax) / 100 - disc).toFixed(2);
    }

    setFormData(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Replace with API call
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({ type: "success", message: "Service booked successfully!" });
      if (onSuccess) onSuccess();
    }, 1200);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="bg-gray-50 p-8 mt-20 rounded-lg shadow-lg max-w-4xl mx-auto">
      {notification && (
        <div className={`p-4 rounded-lg mb-4 ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {notification.message}
        </div>
      )}

      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Book a Service
        </span>
        <h1 className="text-4xl text-blue-600 font-bold mb-2">Service Booking Form</h1>
        <p className="text-gray-600">Fill in details about the service and estimated cost.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Service Info */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-200">
              <Building2 size={28} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Service Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-slate-700">Service Name *</label>
              <input
                name="serviceName"
                type="text"
                placeholder="Enter service name"
                value={formData.serviceName}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Date of Service *</label>
              <input
                name="dateOfService"
                type="date"
                value={formData.dateOfService}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                placeholder="Details about the service"
                value={formData.description}
                onChange={handleChange}
                className={inputCls + " h-24"}
              />
            </div>
          </div>
        </div>

        {/* Cost Details */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 border border-green-200">
              <DollarSign size={28} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Cost Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-1 font-medium text-slate-700">Estimated Cost ($) *</label>
              <input
                name="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Tax (%)</label>
              <input
                name="taxPercent"
                type="number"
                value={formData.taxPercent}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Discount ($)</label>
              <input
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block mb-1 font-medium text-slate-700">Total Payable ($)</label>
              <input
                name="totalPayable"
                type="number"
                value={formData.totalPayable}
                className={inputCls + " bg-slate-100"}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Requester Info */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 border border-slate-200">
              <User size={28} className="text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Requester Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-slate-700">Requester Name *</label>
              <input
                name="requesterName"
                type="text"
                value={formData.requesterName}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Requester Email *</label>
              <input
                name="requesterEmail"
                type="email"
                value={formData.requesterEmail}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-slate-700">Requester Phone *</label>
              <input
                name="requesterPhone"
                type="tel"
                value={formData.requesterPhone}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-slate-700">Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className={inputCls}
                required
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="online">Online Wallet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-12 py-4 rounded-xl font-bold transition shadow-lg text-white ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Submitting..." : isEditMode ? "Update Booking" : "Book Service"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicesForm;
