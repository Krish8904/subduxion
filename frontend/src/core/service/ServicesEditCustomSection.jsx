import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NewSectionEditor from "../../pages/adminEdit/NewSectionEditor";

const ServicesEditCustomSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pages/services`
      );
      setServiceData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;

    try {
      const updatedSections = { ...serviceData.sections };
      delete updatedSections[sectionId];

      // Reassign positions consecutively
      const sectionsArray = Object.entries(updatedSections)
        .map(([id, sec]) => ({ id, ...sec }))
        .sort((a, b) => a.position - b.position); // sort by old position just in case

      const reorderedSections = {};
      sectionsArray.forEach((sec, index) => {
        const { id, ...secData } = sec;
        reorderedSections[id] = { ...secData, position: index + 1 }; // reset positions
      });

      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/services`, {
        ...serviceData,
        sections: reorderedSections,
      });

      alert("Section deleted successfully!");
      navigate("/admin/services");
    } catch (err) {
      console.error(err);
      alert("Failed to delete section: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;
  if (!serviceData?.sections[id]) return <p className="p-10">Section not found</p>;

  return (
    <div className="min-h-screen bg-white p-10 font-poppins">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-slate-800">
            Edit Custom Section
          </h2>

          <button
            onClick={() => navigate("/admin/services")}
            className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Back
          </button>
        </div>

        <NewSectionEditor
          section={{ id }}
          pageData={serviceData}
          pageName="services"
          onClose={() => navigate("/admin/services")}
          onRefresh={fetchData}
          onDelete={handleDeleteSection} // ✅ must be "onDelete"

        />

      </div>
    </div>
  );
};

export default ServicesEditCustomSection;