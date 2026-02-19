import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Mail, ExternalLink, Search, X, ChevronLeft, ChevronRight, Users, Building2 } from "lucide-react";

/* ─── helpers ───────────────────────────────────────────────── */
const toStr = (v) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" ").toLowerCase();
  return String(v).toLowerCase();
};

const PAGE_SIZES = [10, 25, 50];

const hueOf = (s = "") => (s.charCodeAt(0) * 47) % 360;
const avatarStyle = (name = "") => {
  const h = hueOf(name);
  return { bg: `hsl(${h},60%,88%)`, text: `hsl(${h},55%,32%)` };
};

const gmailLink = (email) => `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`;
const whatsappLink = (cc, num) => `https://wa.me/${`${cc ?? ""}${num ?? ""}`.replace(/\D/g, "")}`;

const WaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ─── sub-components ────────────────────────────────────────── */
const Avatar = ({ name = "" }) => {
  const { bg, text } = avatarStyle(name);
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0 font-semibold text-xs"
      style={{ width: 28, height: 28, background: bg, color: text }}
    >
      {initials}
    </span>
  );
};

const Pill = ({ label, color = "gray" }) => {
  const palettes = {
    gray: { bg: "#e9ebee", text: "#1a202c", border: "#c1c7d0" },
    blue: { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
    violet: { bg: "#ede9fe", text: "#3730a3", border: "#c4b5fd" },
    pink: { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
    green: { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
  };
  const c = palettes[color] ?? palettes.gray;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {label}
    </span>
  );
};

const genderColor = (g = "") =>
  g.toLowerCase() === "female" ? "pink" : g.toLowerCase() === "male" ? "blue" : "gray";

/* ─── main ──────────────────────────────────────────────────── */
const CompanyInquiries = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // inject Poppins once
    if (!document.getElementById("poppins-font")) {
      const link = document.createElement("link");
      link.id = "poppins-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies");
      if (res.data.success) setCompanies(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── CHANGE 1: reverse so newest entries appear at the bottom ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q
      ? companies.filter((c) =>
          [c.companyName, c.companyEmail, c.personalEmail, c.category,
           c.firstName, c.lastName, c.website,
           c.natureOfBusiness, c.channel, c.subcategory]
            .some((v) => toStr(v).includes(q))
        )
      : companies;
    return [...list].reverse();
  }, [companies, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated   = filtered.slice((page - 1) * pageSize, page * pageSize);
  // ── CHANGE 2: track visible range for subtitle ──
  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo   = Math.min(page * pageSize, filtered.length);
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  const wrapStyle = { fontFamily: "'Poppins', sans-serif" };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-13 w-13 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 pl-1">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen " style={wrapStyle}>

      {/* ── sticky header ── */}
      <div
        className="bg-white border-b border-gray-300 rounded sticky top-0 z-20"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
      >
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 mr-auto">
            <div
              className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center"
            >
              <Building2 size={30} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Registered Companies</h1>
              {/* ── CHANGE 2: show paginated range vs total ── */}
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Showing {showingFrom}–{showingTo} of {filtered.length} companies
              </p>
            </div>
          </div>

          {/* search */}
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search companies…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            />
            {search && (
              <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── body ── */}
      <div className="max-w-400 mx-auto py-6">
        <div
          className="bg-white rounded border border-gray-300 overflow-hidden"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-max w-full">

              {/* ── thead ── */}
              <thead>
                <tr style={{ background: "#f0f2f5", borderBottom: "2px solid #d1d5db" }}>
                  {[
                    "#", "Company", "Website", "Nature of Business", "Channel",
                    "Company Email", "Category", "Subcategory", "Company Mobile",
                    "Contact Person", "Personal Email", "Gender",
                    "Personal Mobile",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3.5  text-left text-xl whitespace-nowrap"
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "black",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ── tbody ── */}
              <tbody className="divide-y divide-gray-200">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={13}>
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users size={22} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">No companies found</p>
                        <p className="text-sm text-gray-500">
                          {search ? `No results for "${search}".` : "No data available."}
                        </p>
                        {search && (
                          <button onClick={() => handleSearch("")} className="text-sm font-semibold text-violet-700 hover:text-violet-900 transition">
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((c, idx) => {
                    const rowNum = (page - 1) * pageSize + idx + 1;
                    const fullName = [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ");
                    return (
                      <tr
                        key={c._id}
                        className="transition-colors duration-100"
                        onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        {/* # */}
                        <td className="px-6 py-4 text-sm font-semibold tabular-nums" style={{ color: "#6b7280" }}>
                          {rowNum}
                        </td>

                        {/* Company */}
                        <td className="px-6 py-4">
                          <span className="text-l text-gray-700  font-semibold whitespace-nowrap">
                            {c.companyName}
                          </span>
                        </td>

                        {/* Website */}
                        <td className="px-6 py-4">
                          <a
                            href={c.website?.startsWith("http") ? c.website : `https://${c.website}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline max-w-[160px] truncate transition-colors"
                            style={{ color: "#5b21b6" }}
                          >
                            <ExternalLink size={12} className="shrink-0" />
                            <span className="truncate">{c.website}</span>
                          </a>
                        </td>

                        {/* Nature of Business */}
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>
                          {c.natureOfBusiness?.join(", ")}
                        </td>

                        {/* Channel */}
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>
                          {c.channel?.join(", ")}
                        </td>

                        {/* Company Email → Gmail */}
                        <td className="px-6 py-4">
                          <a
                            href={gmailLink(c.companyEmail)}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                            style={{ color: "#374151" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#5b21b6"}
                            onMouseLeave={e => e.currentTarget.style.color = "#374151"}
                          >
                            <Mail size={17} style={{ color: "#9ca3af" }} className="shrink-0" />
                            {c.companyEmail}
                          </a>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Pill label={c.category} color="violet" />
                        </td>

                        {/* Subcategory */}
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: "#374151" }}>
                          {c.subcategory?.join(", ")}
                        </td>

                        {/* Company Mobile → WhatsApp */}
                        <td className="px-6 py-4">
                          <a
                            href={whatsappLink(c.countryCode, c.companyMobile)}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                            style={{ color: "#374151" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#16a34a"}
                            onMouseLeave={e => e.currentTarget.style.color = "#374151"}
                          ><span className="text-green-500">
                              <WaIcon /></span>
                            {c.countryCode} {c.companyMobile}
                          </a>
                        </td>

                        {/* Contact Person */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={fullName} />
                            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "#111827" }}>
                              {fullName}
                            </span>
                          </div>
                        </td>

                        {/* Personal Email → Gmail */}
                        <td className="px-6 py-4">
                          <a
                            href={gmailLink(c.personalEmail)}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                            style={{ color: "#374151" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#5b21b6"}
                            onMouseLeave={e => e.currentTarget.style.color = "#374151"}
                          >
                            <Mail size={13} style={{ color: "#9ca3af" }} className="shrink-0" />
                            {c.personalEmail}
                          </a>
                        </td>

                        {/* Gender */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.gender && <Pill label={c.gender} color={genderColor(c.gender)} />}
                        </td>

                        {/* Personal Mobile → WhatsApp */}
                        <td className="px-6 py-4">
                          <a
                            href={whatsappLink(c.personalCountryCode, c.personalMobile)}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                            style={{ color: "#374151" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#16a34a"}
                            onMouseLeave={e => e.currentTarget.style.color = "#374151"}
                          >
                            <span className="text-green-500">
                              <WaIcon /></span>
                            {c.personalCountryCode} {c.personalMobile}
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── pagination ── */}
          {filtered.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="border border-gray-300 rounded-lg text-sm px-2 py-1.5 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700">
                  Page <span className="font-bold text-gray-900">{page}</span> of{" "}
                  <span className="font-bold text-gray-900">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={15} /> Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyInquiries;