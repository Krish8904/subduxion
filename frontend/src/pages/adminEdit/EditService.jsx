import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import ExportButton from "../../components/ExportButton";
import AddSection from "../../components/AddSection";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import CoreServiceEditor from "../../core/service/CoreServiceEditor";

const EditService = ({ pageTitle }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isCoreEditMode = !!id;
  const [serviceData, setServiceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({});

  // --- FILTER & SEARCH STATE --
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ content: "", subtext: "", order: "" });

  // --- MULTI-COLUMN SORT STATE --
  const [activeSortColumn, setActiveSortColumn] = useState("pos");
  const [pos_order, setPosOrder] = useState("asc");
  const [main_text_order, setMainTextOrder] = useState("asc");
  const [subtext_order, setSubtextOrder] = useState("asc");

  // -- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;
  // --- INFINITE SCROLL STATE ---
  const [showAllRows, setShowAllRows] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef(null);

  // --- DYNAMIC TABLE DATA ---
  const tableData = React.useMemo(() => {
    return Object.keys(serviceData.sections || {}).map((key) => {
      const section = serviceData.sections[key];
      const cards = section?.items || section;

      const getPosition = () => {
        if (section.position !== undefined) return section.position;
        if (key === "hero") return 1;
        if (key === "services") return 2;
        if (key === "cta") return 3;
        return 99;
      };

      return {
        id: key,
        name: section.name || key.charAt(0).toUpperCase() + key.slice(1),
        primary: section.mainText || section.title || "Services section",
        secondary:
          section.secondaryText ||
          section.text ||
          (Array.isArray(cards) ? `${cards.length} Cards` : "Text Content"),
        pos: getPosition(),
        type: section.type || "core",
        alignment: section.alignment || "left",
        isCustom: !['hero', 'services', 'cta'].includes(key) ? "Yes" : "No"
      };
    });
  }, [serviceData.sections]);

  // --- STEP 1: FILTER THE DATA ---
  const filteredData = React.useMemo(() => {
    return tableData.filter(row => {
      const matchContent = (row.primary || "").toLowerCase().includes(searchQuery.content.toLowerCase());
      const matchSubtext = (row.secondary || "").toLowerCase().includes(searchQuery.subtext.toLowerCase());
      const matchOrder = searchQuery.order === "" || row.pos.toString() === searchQuery.order;
      return matchContent && matchSubtext && matchOrder;
    });
  }, [tableData, searchQuery.content, searchQuery.subtext, searchQuery.order]);

  // --- STEP 2: SORT THE ENTIRE DATASET ---
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (activeSortColumn === "pos") {
        return pos_order === "asc" ? a.pos - b.pos : b.pos - a.pos;
      }
      if (activeSortColumn === "main_text") {
        const valA = (a.primary || "").toLowerCase();
        const valB = (b.primary || "").toLowerCase();
        return main_text_order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (activeSortColumn === "subtext") {
        const valA = (a.secondary || "").toLowerCase();
        const valB = (b.secondary || "").toLowerCase();
        return subtext_order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
  }, [
    filteredData,
    activeSortColumn,
    pos_order,
    main_text_order,
    subtext_order,
  ]);

  // Intersection Observer for infinite scroll
  const lastRowRef = useCallback((node) => {
    if (observer.current) observer.current.disconnect();
    if (showAllRows) return;

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !showAllRows) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setShowAllRows(true);
          setIsLoadingMore(false);
        }, 800);
      }
    }, { threshold: 0.1 });

    if (node) observer.current.observe(node);
  }, [showAllRows]);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/services`);
      setServiceData(res.data || {});
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!id || !serviceData?.sections) return;

    const sectionData = serviceData.sections[id];
    if (!sectionData) return;

    if (id === "services") {
      setFormData(JSON.parse(JSON.stringify(sectionData.items || [])));
    } else {
      setFormData(JSON.parse(JSON.stringify(sectionData)));
    }

    setEditingSection({ id });

  }, [id, serviceData]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);


  // Reset infinite scroll when data changes
  useEffect(() => {
    setShowAllRows(false);
    setIsLoadingMore(false);
  }, [sortedData.length]);

  // UPDATED: Properly route to correct editor based on section type
  const handleEditClick = (row) => {
    const coreSections = ['hero', 'services', 'cta'];

    if (coreSections.includes(row.id)) {
      navigate(`/admin/services/edit/core/${row.id}`);
    } else {
      navigate(`/admin/services/edit/custom/${row.id}`);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      // Fetch fresh data from API (not stale local state)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pages/services`);
      const currentPage = response.data;

      const updatedSections = { ...currentPage.sections };
      delete updatedSections[sectionId];

      // Reset ALL positions to 1,2,3... (handles nested too)
      const sectionsWithPosition = Object.entries(updatedSections)
        .filter(([id, section]) => typeof section === 'object' && section.position !== undefined)
        .map(([id, section]) => ({ id, section }));

      sectionsWithPosition.sort((a, b) => a.section.position - b.section.position);

      sectionsWithPosition.forEach(({ id, section }, index) => {
        updatedSections[id] = { ...section, position: index + 1 };
      });

      // Save back to API
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/services`, {
        ...currentPage,
        sections: updatedSections,
      });

      await fetchData(); // Refresh table
      setEditingSection(null);
      alert("Service section deleted and positions reset!");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const addNewService = () => {
    const newCard = { title: "New Service", desc: "Description here", img: "default.jpg", color: "border-blue-600" };
    setFormData([...formData, newCard]);
  };

  const deleteService = (index) => {
    if (window.confirm("Are you sure you want to delete this service card?")) {
      const updated = formData.filter((_, i) => i !== index);
      setFormData(updated);
    }
  };

  const handleSave = async () => {
    try {
      let updatedSections = { ...serviceData.sections };

      if (editingSection.id === "services") {
        updatedSections["services"] = {
          ...updatedSections["services"],
          items: formData,
        };
      } else {
        updatedSections[editingSection.id] = formData;
      }

      const finalPayload = { ...serviceData, sections: updatedSections };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/pages/services`, finalPayload);
      setServiceData(finalPayload);
      setEditingSection(null);
      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving changes.");
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-20 font-bold text-gray-400 uppercase tracking-widest">
        Loading Services...
      </p>
    );
  }

  if (isCoreEditMode) {
    // If still loading section data, show loader
    if (!serviceData?.sections?.[id]) {
      return (
        <div className="p-10 text-center text-gray-400 font-bold">
          Loading section...
        </div>
      );
    }

    return (
      <CoreServiceEditor
        id={id}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        onCancel={() => navigate("/admin/services")}
      />
    );
  }

  // --- STEP 3: PAGINATE THE SORTED RESULTS ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  // Show initial 2 rows, or all rows if scrolled
  const currentRows = showAllRows ? sortedData : sortedData.slice(0, rowsPerPage);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPos = (key, s) => {
    if (s.position !== undefined && s.position !== null && s.position !== "") {
      return Number(s.position);
    }
    if (key === "hero") return 1;
    if (key === "services") return 2;
    if (key === "cta") return 99;
    return 10;
  };

  return (
    <div className="p-15 font-poppins bg-white min-h-screen text-left">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold text-slate-800">Services</h2>
        <div className="flex gap-2">
          <button>
            <ExportButton data={currentRows} fileName="ServicesPage" />
          </button>
          <button onClick={() => setShowFullPreview(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium">
            Preview
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className={`${(searchQuery.content || searchQuery.subtext || searchQuery.order) ? 'bg-orange-500' : 'bg-blue-600'} text-white px-6 py-2 rounded-lg hover:opacity-90 cursor-pointer transition-colors font-medium`}
          >
            Filter {(searchQuery.content || searchQuery.subtext || searchQuery.order) && "Active"}
          </button>
          <button
            onClick={() => navigate("/admin/services/new")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Create Service
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full text-left border-collapse border border-gray-300 shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            {/* SR COLUMN */}
            <th
              className="p-4 border border-gray-300 w-32 text-center cursor-pointer hover:bg-gray-200 transition-all select-none group"
              onClick={() => { setActiveSortColumn("pos"); setPosOrder(pos_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="font-bold">Sr.</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* MAIN CONTENT */}
            <th
              className="p-4 border border-gray-300 font-bold cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("main_text"); setMainTextOrder(main_text_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-between gap-2">
                <span>Main Content</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'main_text' && main_text_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'main_text' && main_text_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* SUBTEXT */}
            <th
              className="p-4 border border-gray-300 font-bold cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("subtext"); setSubtextOrder(subtext_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-between gap-2">
                <span>Subtext/Info</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'subtext' && subtext_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'subtext' && subtext_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            {/* ALIGNMENT COLUMN */}
            <th className="p-4 border border-gray-300 w-32 text-center font-bold">
              Alignment
            </th>

            {/* ORDER COLUMN */}
            <th
              className="p-4 border border-gray-300 w-24 text-center cursor-pointer hover:bg-gray-200 group"
              onClick={() => { setActiveSortColumn("pos"); setPosOrder(pos_order === "asc" ? "desc" : "asc"); setCurrentPage(1); setShowAllRows(false); }}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold">Order</span>
                <div className="flex flex-row items-center justify-center bg-gray-50 p-1 rounded-md group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200 shadow-xs">
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'asc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg className={`w-4 h-4 transition-transform ${activeSortColumn === 'pos' && pos_order === 'desc' ? 'text-blue-600 scale-110' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </th>

            <th className="p-4 border border-gray-300 w-24 text-center font-bold">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row, idx) => (
            <tr
              key={idx}
              ref={idx === rowsPerPage - 1 && !showAllRows ? lastRowRef : null}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="p-4 border border-gray-300 text-center font-bold text-slate-400">
                {idx + 1}
              </td>
              <td className="p-4 border border-gray-300 font-medium whitespace-pre-wrap text-gray-800">
                <div className="flex items-center gap-2">
                  <span>{row.primary}</span>
                  {!['hero', 'services', 'cta'].includes(row.id) && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Custom</span>
                  )}
                </div>
              </td>
              <td className="p-4 border border-gray-300 text-gray-500 text-sm">{row.secondary}</td>
              <td className="p-4 border border-gray-300 text-center">
                <span className="text-xs font-semibold text-gray-600 capitalize bg-gray-100 px-3 py-1 rounded-full">
                  {row.alignment || 'left'}
                </span>
              </td>
              <td className="p-4 border border-gray-300 text-center font-semibold text-blue-600 bg-blue-50/30">{row.pos}</td>
              <td className="p-4 border border-gray-300 text-center">
                <button
                  onClick={() => handleEditClick(row)}
                  className="text-blue-500 p-2 border cursor-pointer border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic font-medium">No results found matching your filter...</td></tr>
          )}
          {isLoadingMore && (
            <tr>
              <td colSpan="6" style={{ height: "120px" }}>
                <div className="flex flex-col justify-center items-center h-full gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-400 font-medium">Loading more sections...</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION BAR */}
      <div className="flex items-center justify-between mt-4 py-2 px-4 border-t border-gray-100">
        <span className="text-[13px] text-gray-400 font-medium">
          {filteredData.length > 0 ? 1 : 0}-{showAllRows ? filteredData.length : Math.min(rowsPerPage, filteredData.length)} of {filteredData.length}
        </span>
        <div className="flex items-center gap-1">
          <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-1 px-3 text-xs font-bold text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer">Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => paginate(i + 1)} className={`w-7 h-7 rounded text-xs cursor-pointer transition-all ${currentPage === i + 1 ? "bg-blue-50 text-blue-600 font-bold border border-blue-100" : "text-gray-400 hover:bg-gray-50"}`}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => paginate(currentPage + 1)} className="p-1 px-3 text-xs font-bold text-gray-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer">Next</button>
        </div>
      </div>

      {/* FILTER MODAL POPUP */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-10000 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Filter Services</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-red-500 text-3xl leading-none cursor-pointer">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Search Content</label>
                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Search titles..." value={searchQuery.content} onChange={(e) => { setSearchQuery({ ...searchQuery, content: e.target.value }); setCurrentPage(1); setShowAllRows(false); }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Search Info</label>
                <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Search descriptions..." value={searchQuery.subtext} onChange={(e) => { setSearchQuery({ ...searchQuery, subtext: e.target.value }); setCurrentPage(1); setShowAllRows(false); }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Order (Pos)</label>
                <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Search position..." value={searchQuery.order} onChange={(e) => { setSearchQuery({ ...searchQuery, order: e.target.value }); setCurrentPage(1); setShowAllRows(false); }} />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => { setSearchQuery({ content: "", subtext: "", order: "" }); setShowFilterModal(false); setCurrentPage(1); setShowAllRows(false); }} className="px-6 py-2 text-gray-500 font-bold text-sm cursor-pointer">Clear</button>
              <button onClick={() => setShowFilterModal(false)} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold text-sm cursor-pointer shadow-lg hover:bg-black">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black/60 z-600 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white w-[95%] h-[95%] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 px-10 text-left">
              <span className="font-bold uppercase tracking-widest text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full">Live Services Preview</span>
              <button onClick={() => setShowFullPreview(false)} className="text-gray-400 hover:text-red-500 text-4xl leading-none cursor-pointer">&times;</button>
            </div>
            <iframe
              src="/services"
              className="flex-1 w-full border-none"
              title="Services Preview"
            />
            <div className="p-4 border-t flex justify-end bg-gray-50 px-10">
              <button onClick={() => setShowFullPreview(false)} className="bg-slate-900 text-white px-10 py-2 rounded-xl font-bold uppercase text-xs cursor-pointer shadow-lg">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditService;