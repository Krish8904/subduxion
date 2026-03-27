import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Clock, Filter, Search } from "lucide-react";

export default function AllLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef();

  const FILTERS = [
    { label: "All Types", value: "all" },
    { label: "Create", value: "create" },
    { label: "Update", value: "update" },
    { label: "Delete", value: "delete" },
    { label: "Booking", value: "booking" },
  ];

  /* ---------------- FETCH ---------------- */
  const fetchLogs = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://subduxion.onrender.com/api/logs"
      );

      const data = Array.isArray(res.data.logs)
        ? res.data.logs
        : Array.isArray(res.data)
        ? res.data
        : [];

      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  /* ---------------- CLOSE DROPDOWN ---------------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredLogs = logs
    .filter((log) =>
      log.message?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((log) => {
      if (typeFilter === "all") return true;
      if (typeFilter === "create")
        return log.message?.toLowerCase().includes("added");
      if (typeFilter === "update")
        return log.message?.toLowerCase().includes("updated");
      if (typeFilter === "delete")
        return log.message?.toLowerCase().includes("deleted");
      if (typeFilter === "booking") return log.type === "booking";
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  /* ---------------- STYLE ---------------- */
  const getTypeStyle = (log) => {
    const msg = log.message?.toLowerCase() || "";

    if (msg.includes("added"))
      return {
        text: "text-green-600",
        accent: "bg-green-500",
        label: "Create",
      };

    if (msg.includes("updated"))
      return {
        text: "text-blue-600",
        accent: "bg-blue-500",
        label: "Update",
      };

    if (msg.includes("deleted"))
      return {
        text: "text-red-600",
        accent: "bg-red-500",
        label: "Delete",
      };

    if (log.type === "booking")
      return {
        text: "text-purple-600",
        accent: "bg-purple-500",
        label: "Booking",
      };

    return {
      text: "text-slate-500",
      accent: "bg-slate-400",
      label: "Activity",
    };
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Activity Logs
        </h2>
        <p className="text-sm text-slate-500">
          Monitor system activity in real-time
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-3 flex-col md:flex-row">
        {/* SEARCH */}
        <div className="flex items-center gap-2 flex-1 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          <Search size={16} className="text-slate-400" />
          <input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        {/* CUSTOM DROPDOWN */}
        <div ref={dropdownRef} className="relative w-full md:w-56">
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between bg-white border border-slate-200 px-4 py-2 rounded-xl cursor-pointer shadow-sm hover:border-blue-300 transition"
          >
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Filter size={14} className="text-slate-400" />
              {
                FILTERS.find((f) => f.value === typeFilter)
                  ?.label
              }
            </div>
            <span className="text-xs text-slate-400">▼</span>
          </div>

          {dropdownOpen && (
            <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10">
              {FILTERS.map((f) => (
                <div
                  key={f.value}
                  onClick={() => {
                    setTypeFilter(f.value);
                    setDropdownOpen(false);
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer transition ${
                    typeFilter === f.value
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {f.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LOGS */}
      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
        {filteredLogs.map((log, i) => {
          const style = getTypeStyle(log);

          return (
            <div
              key={log._id || i}
              className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all"
            >
              {/* ACCENT BAR */}
              <div
                className={`absolute left-0 top-3 h-[70%] w-[3px] rounded-l-xl ${style.accent} opacity-70`}
              />

              <div className="flex justify-between gap-4 pl-2">
                {/* MESSAGE */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {log.message || "No message"}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <Clock size={12} />
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "Unknown time"}
                  </div>
                </div>

                {/* CAPSULE TYPE */}
                <div
                  className={`text-[11px] font-medium  px-2.5 pb-1.5 pt-1.5 h-7 items-center rounded-full border backdrop-blur-sm
                  ${style.text}
                  ${
                    style.text.includes("green")
                      ? "bg-green-50/60 border-green-200/60"
                      : style.text.includes("blue")
                      ? "bg-blue-50/60 border-blue-200/60"
                      : style.text.includes("red")
                      ? "bg-red-50/60 border-red-200/60"
                      : style.text.includes("purple")
                      ? "bg-purple-50/60 border-purple-200/60"
                      : "bg-slate-100 border-slate-200"
                  }`}
                >
                  {style.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}