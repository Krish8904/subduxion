import React from "react";
import { useNavigate } from "react-router-dom";
import AddSection from "../../components/AddSection";

const ServicesNewSection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-10 font-poppins">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-slate-800">
            Create Service Section
          </h2>

          <button
            onClick={() => navigate("/admin/services")}
            className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Back
          </button>
        </div>

        {/* Your existing component reused */}
        <AddSection
          pageName="services"
          onClose={() => navigate("/admin/services")}
          onSectionAdded={() => navigate("/admin/services")}
        />

      </div>
    </div>
  );
};

export default ServicesNewSection;