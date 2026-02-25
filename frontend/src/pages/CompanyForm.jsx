import React, { useState, useEffect } from "react";
import axios from "axios";
import { Building2, Globe, User, ChevronDown, X } from "lucide-react";

const CompanyForm = ({ editData = null, onSuccess = null, onClose = null }) => {
  const isEditMode = !!editData;

  const emptyForm = {
    companyName: "", companyEmail: "", website: "",
    countryCode: "+1", companyMobile: "",
    natureOfBusiness: [], channel: [], category: "", subcategory: [],
    firstName: "", middleName: "", lastName: "",
    personalEmail: "", personalCountryCode: "+1",
    personalMobile: "", gender: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const [masterData, setMasterData] = useState({
    natureOfBusiness: [], channel: [], category: [], subcategory: {}
  });

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // editData now has name strings (from $lookup), 
  // so we convert them back to _ids for the form
  useEffect(() => {
    if (!editData || !masterData.category.length) return;

    const findId = (list, name) => list.find((x) => x.name === name)?._id || "";
    const findIds = (list, names = []) =>
      names.map((n) => list.find((x) => x.name === n)?._id).filter(Boolean);

    const catId = findId(masterData.category, editData.category);

    setFormData({
      companyName: editData.companyName || "",
      companyEmail: editData.companyEmail || "",
      website: editData.website || "",
      countryCode: editData.countryCode || "+1",
      companyMobile: editData.companyMobile || "",
      natureOfBusiness: findIds(masterData.natureOfBusiness, editData.natureOfBusiness),
      channel: findIds(masterData.channel, editData.channel),
      category: catId,
      subcategory: findIds(masterData.subcategory[catId] || [], editData.subcategory),
      firstName: editData.firstName || "",
      middleName: editData.middleName || "",
      lastName: editData.lastName || "",
      personalEmail: editData.personalEmail || "",
      personalCountryCode: editData.personalCountryCode || "+1",
      personalMobile: editData.personalMobile || "",
      gender: editData.gender || "",
    });
  }, [editData, masterData]);
  // ── Fetch masters — store full {_id, name} objects ──
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/masters/all");
        if (response.data.success) {
          const data = response.data.data;

          // subcategoryMap keyed by category _id (not name)
          const subcategoryMap = {};
          (data.subcategory || []).forEach((sub) => {
            const catId = sub.category?._id || sub.category;
            if (!catId) return;
            if (!subcategoryMap[catId]) subcategoryMap[catId] = [];
            subcategoryMap[catId].push({ _id: sub._id, name: sub.name });
          });

          setMasterData({
            natureOfBusiness: data.natureOfBusiness || [],  // [{_id, name}]
            channel: data.channel || [],  // [{_id, name}]
            category: data.category || [],  // [{_id, name}]
            subcategory: subcategoryMap,               // { catId: [{_id,name}] }
          });
        }
      } catch (err) {
        console.error("Failed to load master data:", err);
        showNotification("error", "Failed to load form options");
      } finally {
        setLoading(false);
      }
    };
    fetchMasters();
  }, []);

  const countryCodes = [
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+86", country: "China" },
    { code: "+81", country: "Japan" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+61", country: "Australia" },
    { code: "+971", country: "UAE" },
    { code: "+65", country: "Singapore" },
  ];

  const getAvailableSubcategories = () => {
    if (!formData.category) return [];
    return masterData.subcategory[formData.category] || [];
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── handleCheckboxChange — values are now _ids ──
  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      if (field === "category") return { ...prev, category: value, subcategory: [] };
      const cur = prev[field];
      return {
        ...prev,
        [field]: cur.includes(value) ? cur.filter((i) => i !== value) : [...cur, value],
      };
    });
  };
  const toggleDropdown = (d) => setOpenDropdown(openDropdown === d ? null : d);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        response = await axios.put(
          "http://localhost:5000/api/companies/" + editData._id,
          formData
        );
      } else {
        response = await axios.post("http://localhost:5000/api/companies", formData);
      }

      if (response.data.success) {
        showNotification(
          "success",
          isEditMode ? "Company updated successfully!" : "Company registered successfully!"
        );
        if (!isEditMode) setFormData(emptyForm);
        if (onSuccess) setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      showNotification(
        "error",
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white";

  function MultiDropdown({ id, label, value, options, onChange, placeholder, disabled }) {
    // options is now [{_id, name}] or [] 
    // value is _id string or [_id strings]

    const getLabel = () => {
      if (Array.isArray(value)) {
        if (value.length === 0) return placeholder;
        return value
          .map((id) => options.find((o) => o._id === id)?.name || id)
          .join(", ");
      }
      return options.find((o) => o._id === value)?.name || placeholder;
    };

    const hasValue = Array.isArray(value) ? value.length > 0 : !!value;

    return (
      <div>
        <label className="block mb-1 font-medium text-slate-700">{label}</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && toggleDropdown(id)}
            disabled={disabled}
            className={
              "w-full border border-slate-300 rounded-lg px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white " +
              (disabled ? "bg-gray-100 cursor-not-allowed " : "cursor-pointer ") +
              (openDropdown === id ? "ring-2 ring-blue-400 border-transparent" : "")
            }
          >
            <span className={"truncate text-sm " + (hasValue ? "text-slate-700" : "text-slate-400")}>
              {getLabel()}
            </span>
            <ChevronDown
              size={16}
              className={"shrink-0 text-slate-400 transition-transform duration-200 " + (openDropdown === id ? "rotate-180" : "")}
            />
          </button>

          {openDropdown === id && (
            <div className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No options available</div>
              ) : (
                options.map((item) => {
                  const checked = Array.isArray(value)
                    ? value.includes(item._id)
                    : value === item._id;
                  return (
                    <label
                      key={item._id}
                      className={"flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors " + (checked ? "bg-blue-50" : "hover:bg-slate-50")}
                    >
                      <div className={"w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-colors " + (checked ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white")}>
                        {checked && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" checked={checked} onChange={() => onChange(item._id)} className="hidden" />
                      <span className={"text-sm " + (checked ? "text-blue-700 font-medium" : "text-slate-700")}>{item.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function SectionHeader({ icon: Icon, title, iconBg, iconColor, iconBorder }) {
    return (
      <div className="flex items-center gap-3 mb-6">
        <div className={"w-13 h-13 rounded-xl flex items-center justify-center shrink-0 border " + iconBg + " " + iconBorder}>
          <Icon size={28} className={iconColor} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
    );
  }

  const steps = [
    { label: "Company Info", dot: "bg-blue-600" },
    { label: "Business Details", dot: "bg-green-600" },
    { label: "Contact Person", dot: "bg-slate-500" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600" />
        <p className="text-gray-500 text-sm">Loading form...</p>
      </div>
    );
  }

  const formBody = (
    <div className="bg-gray-50 p-8 rounded-lg shadow-lg">

      {/* Step indicator */}
      <div className="flex items-center mb-10 max-w-md">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="flex items-center gap-2 shrink-0">
              <div className={"w-6 h-6 rounded-full " + s.dot + " text-white text-xs font-bold flex items-center justify-center shrink-0"}>
                {i + 1}
              </div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-3 min-w-4" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">

        {/* ── Company Information ── */}
        <div>
          <SectionHeader icon={Building2} title="Company Information"
            iconBg="bg-blue-50" iconColor="text-blue-600" iconBorder="border-blue-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-slate-700">Company Name *</label>
              <input name="companyName" type="text" placeholder="Enter company name"
                value={formData.companyName} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Company Email *</label>
              <input name="companyEmail" type="email" placeholder="company@example.com"
                value={formData.companyEmail} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Website</label>
              <input name="website" type="url" placeholder="https://www.example.com"
                value={formData.website} onChange={handleChange}
                className={inputCls} disabled={isSubmitting} />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-slate-700">Company Mobile Number *</label>
              <div className="flex gap-2">
                <select name="countryCode" value={formData.countryCode} onChange={handleChange}
                  className="border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                  disabled={isSubmitting}>
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                  ))}
                </select>
                <input name="companyMobile" type="tel" placeholder="Enter mobile number"
                  value={formData.companyMobile} onChange={handleChange}
                  className={inputCls + " flex-1"} required disabled={isSubmitting} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* ── Business Details ── */}
        <div>
          <SectionHeader icon={Globe} title="Business Details"
            iconBg="bg-green-50" iconColor="text-green-600" iconBorder="border-green-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MultiDropdown id="natureOfBusiness" label="Nature of Business *"
              value={formData.natureOfBusiness} options={masterData.natureOfBusiness}
              onChange={(v) => handleCheckboxChange("natureOfBusiness", v)}
              placeholder="Select nature of business" disabled={isSubmitting} />
            <MultiDropdown id="channel" label="Channel *"
              value={formData.channel} options={masterData.channel}
              onChange={(v) => handleCheckboxChange("channel", v)}
              placeholder="Select channels" disabled={isSubmitting} />
            <MultiDropdown id="category" label="Category *"
              value={formData.category} options={masterData.category}
              onChange={(v) => handleCheckboxChange("category", v)}
              placeholder="Select category" disabled={isSubmitting} />
            <div>
              <MultiDropdown id="subcategory" label="Subcategory *"
                value={formData.subcategory} options={getAvailableSubcategories()}
                onChange={(v) => handleCheckboxChange("subcategory", v)}
                placeholder={!formData.category ? "Select a category first" : "Select subcategories"}
                disabled={isSubmitting || !formData.category} />
              {formData.category && (
                <p className="mt-1 text-xs text-slate-400">
                  Subcategories for:{" "}
                  <span className="font-semibold text-slate-500">{formData.category}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* ── Contact Person ── */}
        <div>
          <SectionHeader icon={User} title="Contact Person Details"
            iconBg="bg-slate-100" iconColor="text-slate-600" iconBorder="border-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-1 font-medium text-slate-700">First Name *</label>
              <input name="firstName" type="text" placeholder="First name"
                value={formData.firstName} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Middle Name</label>
              <input name="middleName" type="text" placeholder="Middle name"
                value={formData.middleName} onChange={handleChange}
                className={inputCls} disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Last Name *</label>
              <input name="lastName" type="text" placeholder="Last name"
                value={formData.lastName} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-slate-700">Personal Email *</label>
              <input name="personalEmail" type="email" placeholder="your.email@example.com"
                value={formData.personalEmail} onChange={handleChange}
                className={inputCls} required disabled={isSubmitting} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-slate-700">Gender *</label>
              <div className="flex gap-6 mt-3">
                {["male", "female", "other"].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value={g}
                      checked={formData.gender === g} onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting} />
                    <span className="text-slate-700 capitalize text-sm">{g}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block mb-1 font-medium text-slate-700">Personal Mobile Number *</label>
              <div className="flex gap-2">
                <select name="personalCountryCode" value={formData.personalCountryCode} onChange={handleChange}
                  className="border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                  disabled={isSubmitting}>
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                  ))}
                </select>
                <input name="personalMobile" type="tel" placeholder="Enter mobile number"
                  value={formData.personalMobile} onChange={handleChange}
                  className={inputCls + " flex-1"} required disabled={isSubmitting} />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={
              "px-12 py-4 rounded-xl font-bold transition shadow-lg text-white " +
              (isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer")
            }
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isEditMode ? "Updating..." : "Submitting..."}
              </span>
            ) : isEditMode ? "Update Company" : "Register Company"}
          </button>
        </div>
      </form>
    </div>
  );

  // ── If used as modal (edit mode from cards) ──
  if (isEditMode && onClose) {
    return (
      <>
        {notification && (
          <div className={"fixed top-6 right-6 z-[200] max-w-md p-4 rounded-lg shadow-2xl animate-slide-in " + (notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
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

        <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-black/50 py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl relative">

            {/* Modal header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Edit Company</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Editing: <span className="font-semibold text-blue-600">{editData.companyName}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl bg-white border-red-500 border cursor-pointer  hover:bg-red-500  flex items-center hover:text-white justify-center transition"
              >
                <X size={23} className="text-red-500  hover:text-white m-1" />
              </button>
            </div>

            {/* Form body inside modal */}
            <div className="px-8 py-6">
              {formBody}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes slide-in {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);   opacity: 1; }
          }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
        `}</style>
      </>
    );
  }

  // ── Standalone page (original usage) ──
  return (
    <div className="max-w-7xl mt-20 mx-auto px-4 py-16">
      {notification && (
        <div className={"fixed top-6 right-6 z-50 max-w-md p-4 rounded-lg shadow-2xl animate-slide-in " + (notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
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

      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Partner With Us
        </span>
        <h1 className="text-5xl text-blue-600 font-bold mb-4">Company Registration</h1>
        <p className="text-gray-600 text-md">Complete your company profile to get started with us. Add a few  more details about your business <br /> to unlock all features and opportunities.</p>
      </div>

      {formBody}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default CompanyForm;