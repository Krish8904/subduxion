import React, { useState } from "react";
import axios from "axios";

// Added onDelete prop here
const HomeSr1 = ({ section, homeData, onClose, onRefresh, onDelete }) => {
  if (!section) return null;

  const [formData, setFormData] = useState({
    primary: section.primary || "",
    secondary: section.secondary || "",
    image: section.id === 'hero' ? homeData.sections.hero.image : (homeData.sections.intro?.image || ""),
    align: section.align || "Left",
    pos: section.pos || 1
  });

  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null); // NEW: Store the actual file
  const [imagePreview, setImagePreview] = useState(formData.image); // NEW: Separate preview

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the file for upload
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!homeData || !homeData.sections) return;
    setSaving(true);
    try {
      let uploadedImagePath = formData.image; // Default to existing image

      // NEW: Upload image if a new file was selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);
        
        // Send old filename so backend can overwrite it (prevents duplicates)
        if (formData.image) {
          const oldFileName = formData.image.split("/").pop();
          imageFormData.append("oldFileName", oldFileName);
        }

        const uploadRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/images/upload`,
          imageFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        uploadedImagePath = uploadRes.data.filePath || uploadRes.data.path;

        if (!uploadedImagePath) {
          throw new Error("Backend didn't return the new file path");
        }
      }

      const updatedSections = JSON.parse(JSON.stringify(homeData.sections));
      
      // Ensure numerical position for sorting
      const numericPos = Number(formData.pos);

      if (section.id === 'hero') {
        updatedSections.hero = { 
          ...updatedSections.hero, 
          mainText: formData.primary, 
          secondaryText: formData.secondary,
          image: uploadedImagePath, // Use the uploaded path
          pos: numericPos,
          position: numericPos
        };
      } else if (section.id === 'intro') {
        updatedSections.intro = { 
          ...updatedSections.intro, 
          secondaryText: formData.secondary,
          image: uploadedImagePath, // Use the uploaded path
          pos: numericPos,
          position: numericPos
        };
      } else if (section.id === 'cta') {
        updatedSections.cta = { 
          ...updatedSections.cta, 
          mainText: formData.primary, 
          secondaryText: formData.secondary,
          pos: numericPos,
          position: numericPos
        };
      } else if (section.isCustom) {
        updatedSections[section.id] = {
          ...updatedSections[section.id],
          mainText: formData.primary,
          secondaryText: formData.secondary,
          image: uploadedImagePath, // Add image support for custom sections
          pos: numericPos,
          position: numericPos
        };
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/home`, { sections: updatedSections });
      onRefresh(); 
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Failed to save: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // NEW: Helper to build image URL for display
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("data:")) return imagePath; // Base64 preview
    const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
    const path = imagePath.includes("/") ? imagePath : `/uploads/${imagePath}`;
    return `${base}${path}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-250 flex items-center justify-center font-['Poppins']">
      <div className="bg-white w-full h-full shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center pt-3 pb-3 bg-white px-10">
          <h2 className="text-2xl font-bold text-slate-900">Edit Section: <span className="text-blue-600">{section.name}</span></h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 text-4xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-6 bg-white">
          <div className="grid grid-cols-1 gap-10 max-w-5xl">
            {section.id !== 'intro' && (
              <div className="space-y-3">
                <label className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">Main Primary Title</label>
                <input name="primary" type="text" value={formData.primary} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-5 text-base outline-none focus:ring-2 focus:ring-blue-600 h-10 shadow-sm" />
              </div>
            )}

            {['hero', 'intro', 'cta'].includes(section.id) && (
              <div className="space-y-3">
                <label className="text-[14px] font-bold text-slate-500 uppercase tracking-widest">Secondary Title / Sub-headline</label>
                <textarea name="secondary" value={formData.secondary} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-5 text-base outline-none focus:ring-2 focus:ring-blue-600 shadow-sm h-20 resize-none" />
              </div>
            )}
            
            {['hero', 'intro'].includes(section.id) && (
              <div className="max-w-5xl">
                <label className="text-[15px] font-bold text-slate-500 uppercase tracking-widest">Section Image (Drag & Drop)</label>
                <div 
                  className="relative w-full h-48 border-2 border-dashed border-slate-400 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all group overflow-hidden"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {  
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    handleImageChange({ target: { files: [file] } });
                  }}
                >
                  {imagePreview ? (
                    <img src={getImageUrl(imagePreview)} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <p className="text-slate-400 text-sm">Drag image here or click to upload</p>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                {imageFile && (
                  <p className="text-xs text-green-600 mt-2">✓ New image selected: {imageFile.name}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-slate-100 max-w-2xl pt-6">
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-500 uppercase">Box Alignment</label>
              <select name="align" value={formData.align} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-4 text-sm bg-white outline-none">
                <option value="Left">Left Align</option>
                <option value="Center">Center Align</option>
                <option value="Right">Right Align</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-slate-500 uppercase">Order Position</label>
              <select name="pos" value={formData.pos} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-4 text-sm bg-white outline-none">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Slot {n}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center px-12">
          <div className="flex gap-6">
            <button onClick={onClose} className="bg-slate-900 hover:bg-black text-white px-14 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-14 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {section.isCustom && (
            <button 
              onClick={() => {
                if(window.confirm("Are you sure you want to delete this section?")) {
                  onDelete(section.id);
                  onClose();
                }
              }}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-6 py-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all border border-transparent hover:border-red-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Section
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeSr1;
