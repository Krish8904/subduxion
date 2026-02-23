import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ChevronDown, Plus, Pencil, Trash2, Check, X, Search,
  Layers, Radio, Tag, Tags, AlertCircle, Loader2
} from "lucide-react";

const API = "http://localhost:5000/api/masters";

// ── Config for each master ──────────────────────────────────────────────────
const MASTERS = [
  {
    key: "nature-of-business",
    label: "Nature of Business",
    icon: Layers,
    color: "blue",
    endpoint: `${API}/nature-of-business`,
    createLabel: "Create Nature of Business",
    hasParent: false,
  },
  {
    key: "channel",
    label: "Channel",
    icon: Radio,
    color: "green",
    endpoint: `${API}/channel`,
    createLabel: "Create Channel",
    hasParent: false,
  },
  {
    key: "category",
    label: "Category",
    icon: Tag,
    color: "purple",
    endpoint: `${API}/category`,
    createLabel: "Create Category",
    hasParent: false,
  },
  {
    key: "subcategory",
    label: "Subcategory",
    icon: Tags,
    color: "orange",
    endpoint: `${API}/subcategory`,
    createLabel: "Create Subcategory",
    hasParent: true,
    parentLabel: "Category",
    parentEndpoint: `${API}/category`,
  },
];

// ── Color map ───────────────────────────────────────────────────────────────
const COLOR = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-700",  icon: "text-blue-600",  btn: "bg-blue-600 hover:bg-blue-700",   badge: "bg-blue-100 text-blue-700",   ring: "focus:ring-blue-400"  },
  green:  { bg: "bg-green-50",  border: "border-green-200", text: "text-green-700", icon: "text-green-600", btn: "bg-green-600 hover:bg-green-700",  badge: "bg-green-100 text-green-700", ring: "focus:ring-green-400" },
  purple: { bg: "bg-purple-50", border: "border-purple-200",text: "text-purple-700",icon: "text-purple-600",btn: "bg-purple-600 hover:bg-purple-700", badge: "bg-purple-100 text-purple-700",ring: "focus:ring-purple-400"},
  orange: { bg: "bg-orange-50", border: "border-orange-200",text: "text-orange-700",icon: "text-orange-600",btn: "bg-orange-600 hover:bg-orange-700", badge: "bg-orange-100 text-orange-700",ring: "focus:ring-orange-400"},
};

// ── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ toasts, remove }) => (
  <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
    {toasts.map((t) => (
      <div key={t.id}
        className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm max-w-sm animate-slide-in ${
          t.type === "success" ? "bg-green-600" : "bg-red-500"
        }`}>
        {t.type === "success"
          ? <Check size={16} className="mt-0.5 shrink-0" />
          : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
        <span className="flex-1">{t.message}</span>
        <button onClick={() => remove(t.id)} className="shrink-0 hover:opacity-75">
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

// ── Confirm Dialog ──────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Confirm Delete</h3>
            <p className="text-sm text-slate-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Master Page ─────────────────────────────────────────────────────────────
const MastersMainDropdown = ({ master, toast }) => {
  const c = COLOR[master.color];
  const Icon = master.icon;

  const [items, setItems] = useState([]);
  const [parents, setParents] = useState([]);   // categories (for subcategory)
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create form
  const [createName, setCreateName] = useState("");
  const [createParent, setCreateParent] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editParent, setEditParent] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const inputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [itemsRes, parentsRes] = await Promise.all([
        axios.get(master.endpoint),
        master.hasParent ? axios.get(master.parentEndpoint) : Promise.resolve(null),
      ]);
      setItems(itemsRes.data.data || []);
      if (parentsRes) setParents(parentsRes.data.data || []);
    } catch {
      toast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [master.key]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    if (master.hasParent && !createParent) { toast("error", "Please select a category"); return; }
    setCreating(true);
    try {
      const body = { name: createName.trim() };
      if (master.hasParent) body.category = createParent;
      const res = await axios.post(master.endpoint, body);
      setItems((prev) => [...prev, res.data.data].sort((a, b) => a.name.localeCompare(b.name)));
      setCreateName("");
      setCreateParent("");
      toast("success", `${master.label} created successfully`);
    } catch (err) {
      toast("error", err.response?.data?.message || "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setEditName(item.name);
    setEditParent(item.category?._id || item.category || "");
  };

  const cancelEdit = () => { setEditId(null); setEditName(""); setEditParent(""); };

  const handleSave = async (id) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const body = { name: editName.trim() };
      if (master.hasParent) body.category = editParent;
      const res = await axios.put(`${master.endpoint}/${id}`, body);
      setItems((prev) =>
        prev.map((item) => item._id === id ? res.data.data : item)
            .sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelEdit();
      toast("success", `${master.label} updated successfully`);
    } catch (err) {
      toast("error", err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${master.endpoint}/${confirmId}`);
      setItems((prev) => prev.filter((item) => item._id !== confirmId));
      toast("success", `${master.label} deleted successfully`);
    } catch {
      toast("error", "Failed to delete");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.category?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <ConfirmDialog
        open={!!confirmId}
        message={`This will remove the item from the system. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />

      {/* Header */}
      <div className={`flex items-center gap-3 p-5 rounded-2xl border mb-6 ${c.bg} ${c.border}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
          <Icon size={24} className={c.icon} />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${c.text}`}>{master.label}</h2>
          <p className="text-sm text-slate-500">{items.length} active {master.label.toLowerCase()} entries</p>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
        <h3 className="font-semibold text-slate-700 mb-4">{master.createLabel}</h3>
        <form onSubmit={handleCreate} className="flex gap-3 flex-wrap">
          {master.hasParent && (
            <select
              value={createParent}
              onChange={(e) => setCreateParent(e.target.value)}
              className={`border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${c.ring} focus:border-transparent bg-white min-w-44`}
              disabled={creating}
            >
              <option value="">Select Category *</option>
              {parents.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          )}
          <input
            ref={inputRef}
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder={`Enter ${master.label.toLowerCase()} name`}
            className={`flex-1 min-w-48 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${c.ring} focus:border-transparent`}
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !createName.trim()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${c.btn}`}
          >
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Add
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${master.label.toLowerCase()}...`}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <Icon size={32} className="opacity-30" />
            <p className="text-sm">{search ? "No results found" : `No ${master.label.toLowerCase()} entries yet`}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
                {master.hasParent && (
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                )}
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, idx) => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 font-medium">{idx + 1}</td>

                  {master.hasParent && (
                    <td className="px-5 py-3.5">
                      {editId === item._id ? (
                        <select
                          value={editParent}
                          onChange={(e) => setEditParent(e.target.value)}
                          className={`border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 ${c.ring} w-full max-w-44`}
                        >
                          <option value="">Select Category</option>
                          {parents.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.badge}`}>
                          {item.category?.name || "—"}
                        </span>
                      )}
                    </td>
                  )}

                  <td className="px-5 py-3.5">
                    {editId === item._id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave(item._id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className={`border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 ${c.ring} w-full max-w-xs`}
                      />
                    ) : (
                      <span className="font-medium text-slate-700">{item.name}</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {editId === item._id ? (
                        <>
                          <button
                            onClick={() => handleSave(item._id)}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition disabled:opacity-50"
                          >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition"
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-semibold transition"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmId(item._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-semibold transition"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ── Masters Dropdown Nav ─────────────────────────────────────────────────────
const MastersDropdown = ({ active, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = MASTERS.find((m) => m.key === active);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
      >
        {current ? (
          <>
            {React.createElement(current.icon, { size: 15, className: COLOR[current.color].icon })}
            <span>{current.label}</span>
          </>
        ) : (
          <span>Masters</span>
        )}
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Master</p>
          </div>
          {MASTERS.map((m) => {
            const MIcon = m.icon;
            const c = COLOR[m.color];
            const isActive = active === m.key;
            return (
              <button
                key={m.key}
                onClick={() => { onChange(m.key); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition ${
                  isActive ? `${c.bg} ${c.text} font-semibold` : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <MIcon size={15} className={isActive ? c.icon : "text-slate-400"} />
                {m.label}
                {isActive && <Check size={13} className={`ml-auto ${c.icon}`} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const MastersAdmin = () => {
  const [activeMaster, setActiveMaster] = useState("nature-of-business");
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const currentMaster = MASTERS.find((m) => m.key === activeMaster);

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast toasts={toasts} remove={removeToast} />

      {/* Top nav bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
        <span className="text-slate-300">/</span>
        <MastersDropdown active={activeMaster} onChange={setActiveMaster} />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tab pills (alternate navigation) */}
        <div className="flex gap-2 flex-wrap mb-8">
          {MASTERS.map((m) => {
            const MIcon = m.icon;
            const c = COLOR[m.color];
            const isActive = activeMaster === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActiveMaster(m.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                  isActive
                    ? `${c.bg} ${c.text} ${c.border}`
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <MIcon size={14} className={isActive ? c.icon : "text-slate-400"} />
                {m.label}
              </button>
            );
          })}
        </div>

        {currentMaster && (
          <MastersMainDropdown
            key={activeMaster}
            master={currentMaster}
            toast={addToast}
          />
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default MastersAdmin