import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Check, SlidersHorizontal } from "lucide-react";

export const DEFAULT_FILTERS = {
  companyName: "",
  category: [],
  natureOfBusiness: [],
  channel: [],
  subcategory: [],
  gender: [],
  registeredDate: "",
  dateFrom: "",
  dateTo: "",
};

function FilterCompanyInq({ open, onClose, filters, onChange, companies, onReset }) {
  const overlayRef = useRef(null);
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function uniqueVals(key) {
    const vals = [];
    (companies || []).forEach((c) => {
      const v = c[key];
      if (Array.isArray(v)) v.forEach((i) => { if (i && !vals.includes(i)) vals.push(i); });
      else if (v && !vals.includes(v)) vals.push(v);
    });
    return vals.sort();
  }

  const toggleMulti = (key, val) => {
    const cur = filters[key] || [];
    onChange({ ...filters, [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] });
  };

  const totalActive = Object.entries(filters).reduce((n, [, v]) => {
    return n + (Array.isArray(v) ? v.length : v ? 1 : 0);
  }, 0);

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition placeholder-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2";

  const CollapsibleMulti = ({ label, optionKey }) => {
    const opts = uniqueVals(optionKey);
    const selected = filters[optionKey] || [];
    const isOpen = expanded[optionKey];
    if (!opts.length) return null;
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggle(optionKey)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">{label}</span>
            {selected.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {selected.length}
              </span>
            )}
          </div>
          <ChevronDown size={15} className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <div className="flex flex-wrap gap-1.5">
              {opts.map((opt) => {
                const active = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(optionKey, opt)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      background: active ? "#4F46E5" : "#ffffff",
                      color:      active ? "white"   : "#374151",
                      border:     active ? "1px solid #4F46E5" : "1px solid #e5e7eb",
                    }}
                  >
                    {active && <Check size={10} />}
                    {opt}
                  </button>
                );
              })}
            </div>
            {selected.length > 0 && (
              <button
                onClick={() => onChange({ ...filters, [optionKey]: [] })}
                className="mt-2.5 text-[11px] text-red-400 hover:text-red-600 font-semibold cursor-pointer transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Clear {label}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {open && (
        <div ref={overlayRef} onClick={onClose} className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-[2px]" />
      )}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out"
        style={{ width: 400, transform: open ? "translateX(0)" : "translateX(100%)", fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <SlidersHorizontal size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white m-0 leading-tight">Filter</h2>
              {totalActive > 0 && (
                <p className="text-[11px] text-white/70 m-0 font-medium">
                  {totalActive} filter{totalActive > 1 ? "s" : ""} active
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border-none flex items-center justify-center cursor-pointer transition-colors">
            <X size={17} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Company Name */}
          <div>
            <label className={labelCls}>Company Name</label>
            <input
              type="text"
              placeholder="Search company..."
              value={filters.companyName}
              onChange={(e) => onChange({ ...filters, companyName: e.target.value })}
              className={inputCls}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            />
          </div>

          {/* Registered On */}
          <div>
            <label className={labelCls}>Registered On</label>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-medium">Exact date</p>
                <input
                  type="date"
                  value={filters.registeredDate}
                  onChange={(e) => onChange({ ...filters, registeredDate: e.target.value })}
                  className={inputCls}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 font-medium">or range</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5 font-medium">From</p>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    max={filters.dateTo || undefined}
                    onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                    className={inputCls}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5 font-medium">To</p>
                  <input
                    type="date"
                    value={filters.dateTo}
                    min={filters.dateFrom || undefined}
                    onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                    className={inputCls}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className={labelCls}>Gender</label>
            <div className="flex gap-2">
              {["Male", "Female", "Other"].map((g) => {
                const active = (filters.gender || []).includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleMulti("gender", g)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      background: active ? "#ede9fe" : "#f9fafb",
                      color:      active ? "#4F46E5" : "#374151",
                      border:     active ? "1.5px solid #a5b4fc" : "1px solid #e5e7eb",
                    }}
                  >
                    {active && <Check size={11} />}{g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <CollapsibleMulti label="Category"           optionKey="category" />
          <CollapsibleMulti label="Nature of Business" optionKey="natureOfBusiness" />
          <CollapsibleMulti label="Channel"            optionKey="channel" />
          <CollapsibleMulti label="Subcategory"        optionKey="subcategory" />

        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 px-6 py-4 flex items-center gap-3 bg-gray-50">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors cursor-pointer border-none"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            ↺ Reset
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <X size={14} /> Close
          </button>
        </div>
      </div>
    </>
  );
}

export default FilterCompanyInq;