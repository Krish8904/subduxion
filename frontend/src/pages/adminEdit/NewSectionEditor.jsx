import React, { useState, useEffect } from "react";
import axios from "axios";

const NewSectionEditor = ({ section, pageData, onClose, pageName, onRefresh, onDelete }) => {
  const [formData, setFormData] = useState({
    mainText: "",
    secondaryText: "",
    alignment: "left",
    position: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pageData?.sections || !section?.id) return;

    const freshSection = pageData.sections[section.id];
    if (!freshSection) return;

    setFormData({
      mainText: freshSection.mainText || "",
      secondaryText: freshSection.secondaryText || "",
      alignment: freshSection.alignment || "left",
      position: freshSection.position ?? 1,
    });
  }, [pageData, section?.id]);

  const handleSave = async () => {
    if (!pageData?.sections) {
      alert("Page data missing");
      return;
    }

    setLoading(true);
    try {
      const sectionsArray = Object.entries(pageData.sections).map(([id, sec]) => ({
        id,
        ...sec,
      }));

      // Remove the current section
      const currentIndex = sectionsArray.findIndex(sec => sec.id === section.id);
      const [currentSec] = sectionsArray.splice(currentIndex, 1);

      // Clamp desired position
      let updatedPosition = Number(formData.position);
      if (updatedPosition < 1) updatedPosition = 1;
      if (updatedPosition > sectionsArray.length + 1) updatedPosition = sectionsArray.length + 1;

      // Insert the current section at the new position
      sectionsArray.splice(updatedPosition - 1, 0, {
        ...currentSec,
        mainText: formData.mainText,
        secondaryText: formData.secondaryText,
        alignment: formData.alignment,
        position: updatedPosition,
        type: currentSec.type || "custom",
      });

      // Reassign consecutive positions
      const reorderedSections = {};
      sectionsArray.forEach((sec, index) => {
        const { id, ...secData } = sec;
        reorderedSections[id] = { ...secData, position: index + 1 };
      });

      // Save
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`, {
        ...pageData,
        sections: reorderedSections,
      });

      await onRefresh();
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-start justify-end font-poppins text-left">
  <div className="bg-white w-[77.5%] h-[full] shadow-2xl overflow-hidden">
    {/* HEADER */}
    <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
      <h2 className="font-black text-gray-800 uppercase tracking-tight text-sm">Edit Custom Section</h2>
      <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl cursor-pointer">&times;</button>
    </div>

    {/* MAIN FORM */}
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-blue-500 uppercase mb-2">Order</label>
          <input
            type="number"
            className="w-full p-3 border rounded-xl font-bold text-blue-600 outline-none"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-blue-500 uppercase mb-2">Alignment</label>
          <select
            className="w-full p-3 border rounded-xl bg-white outline-none"
            value={formData.alignment}
            onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-blue-500 uppercase mb-2">Main Content</label>
        <input
          className="w-full p-4 border rounded-xl font-bold text-lg outline-none focus:border-blue-500"
          value={formData.mainText}
          onChange={(e) => setFormData({ ...formData, mainText: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-blue-500 uppercase mb-2">Subtext/Description</label>
        <textarea
          className="w-full p-4 border rounded-xl h-40 outline-none focus:border-blue-500 resize-none"
          value={formData.secondaryText}
          onChange={(e) => setFormData({ ...formData, secondaryText: e.target.value })}
        />
      </div>
    </div>

    {/* FOOTER */}
    <div className="p-6 bg-gray-50 flex justify-between items-center">
      <button
        onClick={() => { if (window.confirm("Delete this section?")) onDelete(section.id); }}
        className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-lg transition cursor-pointer"
      >
        Delete Section
      </button>

      <div className="flex gap-3">
        <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold text-[10px] uppercase cursor-pointer">Cancel</button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default NewSectionEditor;