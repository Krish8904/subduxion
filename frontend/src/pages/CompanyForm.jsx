import React, { useState } from "react";
import axios from "axios";
import { Building2, Globe, Phone, Mail, User, ChevronDown } from "lucide-react";

const CompanyForm = () => {
  const [formData, setFormData] = useState({

    companyName: "",
    companyEmail: "",
    website: "",
    countryCode: "+1",
    companyMobile: "",

    natureOfBusiness: [],
    channel: [],
    category: [],
    subcategory: [],

    firstName: "",
    middleName: "",
    lastName: "",
    personalEmail: "",
    personalCountryCode: "+1",
    personalMobile: "",
    gender: "",
  });

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const dropdownData = {
    natureOfBusiness: [
      "Manufacturing",
      "Retail",
      "Wholesale",
      "E-commerce",
      "Services",
      "Technology",
      "Healthcare",
      "Education",
      "Finance",
      "Real Estate"
    ],
    channel: [
      "Direct Sales",
      "Online Store",
      "Distributors",
      "Retailers",
      "Marketplace",
      "B2B Platform",
      "Franchise",
      "Agent Network"
    ],
    category: [
      "Electronics",
      "Fashion & Apparel",
      "Food & Beverages",
      "Home & Garden",
      "Beauty & Personal Care",
      "Sports & Outdoors",
      "Automotive",
      "Books & Media",
      "Toys & Games",
      "Industrial Equipment"
    ]
  };

  const categorySubcategoryMap = {
    "Electronics": [
      "Mobile Phones",
      "Laptops & Computers",
      "Tablets",
      "Smart Watches",
      "Headphones & Earbuds",
      "Cameras",
      "Gaming Consoles",
      "Home Appliances"
    ],
    "Fashion & Apparel": [
      "Men's Clothing",
      "Women's Clothing",
      "Kids' Clothing",
      "Footwear",
      "Accessories",
      "Jewelry",
      "Bags & Luggage",
      "Ethnic Wear"
    ],
    "Food & Beverages": [
      "Organic Foods",
      "Beverages",
      "Snacks",
      "Dairy Products",
      "Frozen Foods",
      "Bakery Items",
      "Health Foods",
      "Gourmet Foods"
    ],
    "Home & Garden": [
      "Furniture",
      "Home Decor",
      "Kitchen & Dining",
      "Bedding & Bath",
      "Lighting",
      "Garden Tools",
      "Plants & Seeds",
      "Storage & Organization"
    ],
    "Beauty & Personal Care": [
      "Skincare",
      "Makeup",
      "Hair Care",
      "Fragrances",
      "Bath & Body",
      "Nail Care",
      "Men's Grooming",
      "Beauty Tools"
    ],
    "Sports & Outdoors": [
      "Fitness Equipment",
      "Camping Gear",
      "Cycling",
      "Yoga & Pilates",
      "Team Sports",
      "Water Sports",
      "Winter Sports",
      "Outdoor Recreation"
    ],
    "Automotive": [
      "Car Accessories",
      "Motorcycle Parts",
      "Car Care",
      "Tires & Wheels",
      "Tools & Equipment",
      "Audio & Electronics",
      "Interior Accessories",
      "Performance Parts"
    ],
    "Books & Media": [
      "Fiction Books",
      "Non-Fiction Books",
      "Educational Books",
      "E-Books",
      "Magazines",
      "Music CDs",
      "Movies & TV",
      "Video Games"
    ],
    "Toys & Games": [
      "Action Figures",
      "Board Games",
      "Educational Toys",
      "Dolls & Plush",
      "Building Blocks",
      "Outdoor Toys",
      "Puzzles",
      "RC Toys"
    ],
    "Industrial Equipment": [
      "Manufacturing Machinery",
      "Construction Equipment",
      "Material Handling",
      "Power Tools",
      "Safety Equipment",
      "Testing Equipment",
      "Packaging Equipment",
      "Electrical Equipment"
    ]
  };

  const getAvailableSubcategories = () => {
    if (formData.category.length === 0) {
      return [];
    }

    const subcategories = new Set();
    formData.category.forEach((cat) => {
      if (categorySubcategoryMap[cat]) {
        categorySubcategoryMap[cat].forEach((sub) => subcategories.add(sub));
      }
    });

    return Array.from(subcategories);
  };

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
    { code: "+65", country: "Singapore" }
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      if (field === "category") {
        const availableSubcategories = new Set();
        newValues.forEach((cat) => {
          if (categorySubcategoryMap[cat]) {
            categorySubcategoryMap[cat].forEach((sub) => availableSubcategories.add(sub));
          }
        });

        const validSubcategories = prev.subcategory.filter((sub) =>
          availableSubcategories.has(sub)
        );

        return { ...prev, [field]: newValues, subcategory: validSubcategories };
      }

      return { ...prev, [field]: newValues };
    });
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Form submitted:", formData);
      showNotification("success", "Company registration submitted successfully!");

      // Reset form
      setFormData({
        companyName: "",
        companyEmail: "",
        website: "",
        countryCode: "+1",
        companyMobile: "",
        natureOfBusiness: [],
        channel: [],
        category: [],
        subcategory: [],
        firstName: "",
        middleName: "",
        lastName: "",
        personalEmail: "",
        personalCountryCode: "+1",
        personalMobile: "",
        gender: "",
      });
    } catch (err) {
      console.error(err);
      showNotification("error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mt-20 mx-auto px-4 py-16">

      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-lg shadow-2xl transform transition-all duration-300 animate-slide-in ${notification.type === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
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
              <p className="font-semibold text-sm">
                {notification.type === "success" ? "Success!" : "Error"}
              </p>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="shrink-0 ml-2 hover:opacity-75 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-5xl text-blue-600 font-bold mb-4">Company Registration</h1>
        <p className="text-gray-600 text-lg">
          Complete your company profile to get started with us
        </p>
      </div>


      <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-15">
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-200 p-2 rounded-xl"> <Building2 className="text-blue-600 " size={34} /></div>

              <h2 className="text-3xl font-bold text-slate-900">Company Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium text-slate-700">
                  Company Name *
                </label>
                <input
                  name="companyName"
                  type="text"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Company Email *
                </label>
                <input
                  name="companyEmail"
                  type="email"
                  placeholder="company@example.com"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-slate-700">Website</label>
                <input
                  name="website"
                  type="url"
                  placeholder="https://www.example.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-medium text-slate-700">
                  Company Mobile Number *
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    {countryCodes.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} ({item.country})
                      </option>
                    ))}
                  </select>
                  <input
                    name="companyMobile"
                    type="tel"
                    placeholder="Enter mobile number"
                    value={formData.companyMobile}
                    onChange={handleChange}
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-200 p-2 rounded-xl">
                <Globe className="text-blue-600 " size={34} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900"> Business Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="relative">
                <label className="block mb-1 font-medium text-slate-700">
                  Nature of Business *
                </label>
                <button
                  type="button"
                  onClick={() => toggleDropdown("natureOfBusiness")}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                  disabled={isSubmitting}
                >
                  <span className="text-slate-700">
                    {formData.natureOfBusiness.length > 0
                      ? formData.natureOfBusiness.join(", ")
                      : "Select nature of business"}
                  </span>
                  <ChevronDown
                    className={`transition-transform ${openDropdown === "natureOfBusiness" ? "rotate-180" : ""
                      }`}
                    size={20}
                  />
                </button>
                {openDropdown === "natureOfBusiness" && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {dropdownData.natureOfBusiness.map((item) => (
                      <label
                        key={item}
                        className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.natureOfBusiness.includes(item)}
                          onChange={() => handleCheckboxChange("natureOfBusiness", item)}
                          className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              
              <div className="relative">
                <label className="block mb-1 font-medium text-slate-700">Channel *</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown("channel")}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                  disabled={isSubmitting}
                >
                  <span className="text-slate-700">
                    {formData.channel.length > 0
                      ? formData.channel.join(", ")
                      : "Select channels"}
                  </span>
                  <ChevronDown
                    className={`transition-transform ${openDropdown === "channel" ? "rotate-180" : ""
                      }`}
                    size={20}
                  />
                </button>
                {openDropdown === "channel" && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {dropdownData.channel.map((item) => (
                      <label
                        key={item}
                        className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.channel.includes(item)}
                          onChange={() => handleCheckboxChange("channel", item)}
                          className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              
              <div className="relative">
                <label className="block mb-1 font-medium text-slate-700">Category *</label>
                <button
                  type="button"
                  onClick={() => toggleDropdown("category")}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                  disabled={isSubmitting}
                >
                  <span className="text-slate-700">
                    {formData.category.length > 0
                      ? formData.category.join(", ")
                      : "Select categories"}
                  </span>
                  <ChevronDown
                    className={`transition-transform ${openDropdown === "category" ? "rotate-180" : ""
                      }`}
                    size={20}
                  />
                </button>
                {openDropdown === "category" && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {dropdownData.category.map((item) => (
                      <label
                        key={item}
                        className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.category.includes(item)}
                          onChange={() => handleCheckboxChange("category", item)}
                          className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              
              <div className="relative">
                <label className="block mb-1 font-medium text-slate-700">
                  Subcategory *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.category.length > 0) {
                      toggleDropdown("subcategory");
                    }
                  }}
                  className={`w-full border border-slate-300 rounded-lg px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${formData.category.length === 0
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-white"
                    }`}
                  disabled={isSubmitting || formData.category.length === 0}
                >
                  <span className={formData.category.length === 0 ? "text-slate-400" : "text-slate-700"}>
                    {formData.subcategory.length > 0
                      ? `${formData.subcategory.length} selected`
                      : formData.category.length === 0
                        ? "Please select a category first"
                        : "Select subcategories"}
                  </span>
                  <ChevronDown
                    className={`transition-transform ${openDropdown === "subcategory" ? "rotate-180" : ""
                      } ${formData.category.length === 0 ? "text-slate-400" : ""}`}
                    size={20}
                  />
                </button>
                {openDropdown === "subcategory" && formData.category.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {getAvailableSubcategories().length > 0 ? (
                      getAvailableSubcategories().map((item) => (
                        <label
                          key={item}
                          className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={formData.subcategory.includes(item)}
                            onChange={() => handleCheckboxChange("subcategory", item)}
                            className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                          />
                          <span className="text-slate-700">{item}</span>
                        </label>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-500 text-center">
                        No subcategories available
                      </div>
                    )}
                  </div>
                )}
                {formData.category.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Showing subcategories for: {formData.category.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>

          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-200 p-2 rounded-xl">
                <User className="text-blue-600 " size={34} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Contact Person Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  First Name *
                </label>
                <input
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Middle Name
                </label>
                <input
                  name="middleName"
                  type="text"
                  placeholder="Middle name"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-slate-700">
                  Last Name *
                </label>
                <input
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-medium text-slate-700">
                  Personal Email *
                </label>
                <input
                  name="personalEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-slate-700">Gender *</label>
                <div className="flex gap-6 mt-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleChange}
                      className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      required
                      disabled={isSubmitting}
                    />
                    <span className="text-slate-700">Male</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleChange}
                      className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-slate-700">Female</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === "other"}
                      onChange={handleChange}
                      className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-slate-700">Other</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block mb-1 font-medium text-slate-700">
                  Personal Mobile Number *
                </label>
                <div className="flex gap-2">
                  <select
                    name="personalCountryCode"
                    value={formData.personalCountryCode}
                    onChange={handleChange}
                    className="border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    {countryCodes.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} ({item.country})
                      </option>
                    ))}
                  </select>
                  <input
                    name="personalMobile"
                    type="tel"
                    placeholder="Enter mobile number"
                    value={formData.personalMobile}
                    onChange={handleChange}
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          
          <div className="text-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-12 py-4 rounded-xl font-bold transition shadow-lg text-white ${isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Register Company"
              )}
            </button>
          </div>
        </form>
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
    </div>
  );
};

export default CompanyForm;