import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const ImageManager = () => {
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch pages
  const fetchPages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages`);
      setPages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch pages:", err);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Recursively extract all "image" fields
  const extractImages = (obj, path = "") => {
    let results = [];
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        results = results.concat(extractImages(item, `${path}[${i}]`));
      });
    } else if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        if (key === "image" && typeof obj[key] === "string") {
          results.push({ path: `${path}.${key}`, value: obj[key] });
        } else {
          results = results.concat(extractImages(obj[key], `${path}.${key}`));
        }
      });
    }
    return results;
  };

  // Update image in page JSON
  const updateImage = async (pageName, imgPath, newImg) => {
    try {
      const pageRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`);
      const pageData = pageRes.data;

      const pathParts = imgPath.split(".").filter((p) => p && p !== "sections");
      let current = pageData.sections;

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (part.includes("[")) {
          const key = part.substring(0, part.indexOf("["));
          const index = parseInt(part.match(/\[(\d+)\]/)[1]);
          current = current[key][index];
        } else {
          current = current[part];
        }
      }

      current[pathParts[pathParts.length - 1]] = newImg;

      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`, pageData);
      fetchPages();
      setSelected(null);
      alert("Image updated successfully!");
    } catch (err) {
      console.error("Error updating image:", err);
      alert("Failed to update image");
    }
  };

  // Delete image
  const deleteImage = async (imgPath) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      const fileName = imgPath.split("/").pop();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/images/delete/${fileName}`);
      fetchPages();
      alert("Image deleted successfully!");
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Failed to delete image");
    }
  };

  const filteredPages = pages.filter((p) => ["home", "services"].includes(p.pageName.toLowerCase()));

  // Direct file upload handler
  const handleFileChange = async (e) => {
    if (!e.target.files?.length || !selected) return;
    const file = e.target.files[0];

    // Extract the old filename
    const oldImgValue = selected?.oldPath;
    if (!oldImgValue) return; // prevent errors  
    const oldFileName = oldImgValue.split("/").pop();

    const formData = new FormData();
    formData.append("image", file);
    formData.append("filename", oldFileName); // tell backend to overwrite

    try {
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/images/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await updateImage(selected.page, selected.path, selected.oldPath); 
      setSelected(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-5">Media Management</h1>

      {filteredPages.map((page) => {
        const images = page.sections ? extractImages(page.sections) : [];
        if (!images.length) return null;

        return (
          <div key={page.pageName} className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-4 capitalize text-slate-800">{page.pageName} Page Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="border border-slate-200 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${img.value.startsWith("/") ? "" : "/uploads/"}${img.value}`}
                    className="h-32 w-full object-cover rounded mb-2"
                    alt=""
                    onError={(e) => (e.target.src = "https://via.placeholder.com/150?text=Image+Not+Found")}
                  />
                  <p className="text-xs mb-2 break-all text-slate-600">{img.value}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelected({ page: page.pageName, path: img.path, oldPath: img.value });
                        fileInputRef.current.click(); // directly open file picker
                      }}
                      className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Change
                    </button>

                    <button
                      onClick={() => deleteImage(`${import.meta.env.VITE_API_URL}${img.value}`)}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filteredPages.length === 0 && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
          <p className="text-slate-600">No images found in Home or Services pages</p>
        </div>
      )}

      {/* Hidden input for direct PC upload */}
      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};

export default ImageManager;