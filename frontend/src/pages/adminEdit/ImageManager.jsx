import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ImagePlus, Upload, Trash2, RefreshCw, Image, AlertTriangle } from "lucide-react";

const ImageManager = () => {
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageTimestamps, setImageTimestamps] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [replacingId, setReplacingId] = useState(null);
  const fileInputRef = useRef(null);
  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const fetchPages = async () => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages`);
      setPages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load pages. Please check your connection.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    fetchPages();
  }, []);

  useEffect(() => {
    const filtered = pages.filter((p) => ["home", "services"].includes(p.pageName.toLowerCase()));
    if (filtered.length && !activeTab) setActiveTab(filtered[0].pageName);
  }, [pages]);

  const extractImages = (obj, path = "sections") => {
    let results = [];
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => { results = results.concat(extractImages(item, `${path}[${i}]`)); });
    } else if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        const newPath = `${path}.${key}`;
        if (key === "image" && typeof obj[key] === "string") results.push({ path: newPath, value: obj[key] });
        else results = results.concat(extractImages(obj[key], newPath));
      });
    }
    return results;
  };

  const getImageUrl = (value) => {
    if (!value) return "";
    const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
    const path = value.includes("/") ? value : `/uploads/${value}`;
    const ts = imageTimestamps[value] || Date.now();
    return `${base}${path}?t=${ts}`;
  };

  const updateImage = async (pageName, imgPath, newImg) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`);
      const pageData = res.data;
      const pathParts = imgPath.split(".").filter((p) => p && p !== "sections");
      let current = pageData.sections;
      if (!current) throw new Error("Page sections not found");
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (part.includes("[")) {
          const key = part.substring(0, part.indexOf("["));
          const index = parseInt(part.match(/\[(\d+)\]/)?.[1]);
          current = current[key][index];
        } else {
          current = current[part];
        }
      }
      current[pathParts[pathParts.length - 1]] = newImg;
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/${pageName}`, pageData);
      setImageTimestamps((prev) => ({ ...prev, [newImg]: Date.now() }));
      if (!isFetchingRef.current) await fetchPages();
      setSelected(null);
      setReplacingId(null);
      alert("Image updated successfully!");
    } catch (err) {
      alert(`Failed to update image: ${err.message}`);
    }
  };

  const deleteImage = async (imgValue) => {
    if (!window.confirm("Delete this image permanently?")) return;
    try {
      const fileName = imgValue.split("/").pop();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/images/delete/${fileName}`);
      if (!isFetchingRef.current) await fetchPages();
      alert("Image deleted successfully!");
    } catch (err) {
      alert(`Failed to delete image: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleFileChange = async (e) => {
    if (!e.target.files?.length || !selected) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    formData.append("oldFileName", selected.oldPath.split("/").pop());
    try {
      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/images/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const newFilePath = uploadRes.data.filePath || uploadRes.data.path;
      if (!newFilePath) throw new Error("Backend didn't return the new file path");
      await updateImage(selected.page, selected.path, newFilePath);
      setSelected(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert(`Failed to upload image: ${err.response?.data?.message || err.message}`);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>
        <div className="text-center">
          <div className="w-9 h-9 rounded-full border-[3px] border-slate-200 border-t-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Loading media…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 mb-1">{error}</p>
          <p className="text-xs text-slate-400">API: {import.meta.env.VITE_API_URL || "Not configured"}</p>
        </div>
        <button
          onClick={() => { if (!isFetchingRef.current) fetchPages(); }}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw size={13} /> Try again
        </button>
      </div>
    );
  }

  const filteredPages = pages.filter((p) => ["home", "services"].includes(p.pageName.toLowerCase()));
  const activePage = filteredPages.find((p) => p.pageName === activeTab);
  const images = activePage?.sections ? extractImages(activePage.sections) : [];
  const totalAssets = filteredPages.reduce((acc, p) => acc + (p.sections ? extractImages(p.sections).length : 0), 0);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 mb-1.5">
            Content Management
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Media Library
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 mb-1">
            Total Assets
          </p>
          <p className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
            {totalAssets}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-5">
        {filteredPages.map((page) => {
          const count = page.sections ? extractImages(page.sections).length : 0;
          const isActive = activeTab === page.pageName;
          return (
            <button
              key={page.pageName}
              onClick={() => setActiveTab(page.pageName)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className="capitalize">{page.pageName}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                isActive ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-slate-100 mb-4" />

      {/* ── Image List ── */}
      {images.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {images.map((img, i) => {
            const filename = img.value.split("/").pop();
            const sectionName = img.path.split(".")[0] || "Unknown";

            return (
              <div
                key={i}
                className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-3 pr-4 hover:border-slate-300 hover:shadow-md transition-all duration-200 relative overflow-hidden"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-black rounded-l-2xl transition-all duration-200" />

                {/* Thumbnail */}
                <div className="relative w-[88px] h-[60px] rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                  <img
                    src={getImageUrl(img.value)}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => { e.target.src = "https://via.placeholder.com/88x60?text=?"; }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Image size={15} className="text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-800 truncate mb-1">
                    {filename}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500 capitalize">
                      {sectionName}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                    <span className="text-[10.5px] font-mono text-slate-400 truncate max-w-[200px]">
                      {img.value}
                    </span>
                  </div>
                </div>

                {/* Actions — visible on hover */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => {
                      setSelected({ page: activePage.pageName, path: img.path, oldPath: img.value });
                      setReplacingId(i);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 active:scale-95 text-white text-[12px] font-semibold px-3.5 py-2 rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
                  >
                    <Upload size={12} />
                    Replace
                  </button>
                  <button
                    onClick={() => deleteImage(img.value)}
                    title="Delete image"
                    className="w-[34px] h-[34px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 active:scale-95 transition-all duration-150 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-slate-200 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <ImagePlus size={22} className="text-slate-400" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-slate-600 mb-1">No images found</p>
            <p className="text-xs text-slate-400">
              No images configured in the{" "}
              <span className="font-semibold text-slate-500 capitalize">{activeTab}</span> page sections.
            </p>
          </div>
        </div>
      )}

      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </div>
  );
};

export default ImageManager;