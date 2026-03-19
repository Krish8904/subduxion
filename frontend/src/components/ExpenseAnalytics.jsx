import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import {
  TrendingUp, TrendingDown, BarChart2, PieChart, Activity,
  ArrowUpRight, ArrowDownRight, ChevronDown,
  Building2, Globe, Layers, Calendar, DollarSign, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line,
  PieChart as RPie, Pie, Sector,
} from "recharts";

/* ─── palette ─────────────────────────────────────── */
const COLORS = [
  "#6d4fc2", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#ec4899",
  "#14b8a6", "#a855f7", "#eab308", "#0ea5e9", "#22c55e",
];
const ACCENT = "#6d4fc2";
const RED = "#ef4444";
const GREEN = "#10b981";

/* ─── formatters ──────────────────────────────────── */
const fmt = (n) => {
  if (n == null) return "—";
  const a = Math.abs(n);
  if (a >= 1e7) return (n / 1e7).toFixed(2) + "Cr";
  if (a >= 1e5) return (n / 1e5).toFixed(2) + "L";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Number(n).toFixed(0);
};
const fmtFull = (n) => {
  if (n == null) return "—";
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const mo = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return mo[dt.getMonth()] + " " + String(dt.getFullYear()).slice(-2);
};
const pct = (v, t) => t > 0 ? ((v / t) * 100).toFixed(1) + "%" : "0%";

/* ═══════════════════════════════════════════════════
   TOOLTIP COMPONENTS
═══════════════════════════════════════════════════ */
const TT = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-xl min-w-[180px]"
    style={{ fontFamily: "'Poppins',sans-serif" }}>
    {children}
  </div>
);

const TTLabel = ({ children }) => (
  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-2.5 mt-0">{children}</p>
);

const TTRow = ({ color, name, value, sub }) => (
  <div className="flex items-start gap-2 mb-1.5">
    {color && <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0 mt-0.5" style={{ background: color }} />}
    <div className="flex-1">
      <span className="text-xs text-gray-500">{name}: </span>
      <span className="text-xs font-bold text-gray-900">{value}</span>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

const CashFlowTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const credit = payload.find(p => p.dataKey === "credit")?.value || 0;
  const spend = payload.find(p => p.dataKey === "spend")?.value || 0;
  const net = payload.find(p => p.dataKey === "net")?.value || 0;
  return (
    <TT>
      <TTLabel>{label}</TTLabel>
      <TTRow color={GREEN} name="Credit" value={fmtFull(credit)} />
      <TTRow color={RED} name="Spend" value={fmtFull(spend)} />
      <div className="border-t border-gray-100 mt-2 pt-2">
        <TTRow color={ACCENT} name="Net" value={fmtFull(net)}
          sub={net >= 0 ? "Surplus this month" : "Deficit this month"} />
      </div>
    </TT>
  );
};

const BarTT = ({ active, payload, label, total }) => {
  if (!active || !payload?.length) return null;
  return (
    <TT>
      <TTLabel>{label}</TTLabel>
      {payload.map((p, i) => (
        <TTRow key={i} color={p.fill} name={p.name} value={fmtFull(p.value)}
          sub={total ? `${pct(p.value, total)} of total` : undefined} />
      ))}
    </TT>
  );
};

const NetTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value || 0;
  return (
    <TT>
      <TTLabel>{label}</TTLabel>
      <TTRow color={v >= 0 ? GREEN : RED} name="Net Flow" value={fmtFull(v)}
        sub={v >= 0 ? "Surplus" : "Deficit"} />
    </TT>
  );
};

const CurrTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <TT>
      <TTLabel>{label}</TTLabel>
      <TTRow color={payload[0]?.fill} name="INR Volume" value={fmtFull(payload[0]?.value)} />
    </TT>
  );
};

/* ═══════════════════════════════════════════════════
   ACTIVE PIE SHAPE
═══════════════════════════════════════════════════ */
const ActivePieShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 14} outerRadius={outerRadius + 16}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#111827"
        style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>
        {payload.name?.length > 10 ? payload.name.slice(0, 9) + "…" : payload.name}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#6b7280"
        style={{ fontSize: 11, fontFamily: "'Poppins',sans-serif" }}>
        ₹{fmt(value)}
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#9ca3af"
        style={{ fontSize: 10, fontFamily: "'Poppins',sans-serif" }}>
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

/* ═══════════════════════════════════════════════════
   TABLE ROW
═══════════════════════════════════════════════════ */
const CPRow = ({ cp, i, total }) => {
  const [hov, setHov] = useState(false);
  const net = cp.credit - cp.spend;
  const share = pct(cp.spend + cp.credit, total);
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`border-b border-gray-50 transition-colors duration-150 cursor-default ${hov ? "bg-violet-50" : "bg-transparent"}`}
    >
      <td className="py-3 px-3.5 text-center text-xs text-gray-400 font-semibold">{i + 1}</td>
      <td className="py-3 px-3.5 text-sm font-semibold text-gray-900">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors duration-150"
            style={{
              background: COLORS[i % COLORS.length] + (hov ? "44" : "22"),
              color: COLORS[i % COLORS.length],
            }}
          >
            {cp.name.slice(0, 2).toUpperCase()}
          </div>
          {cp.name}
        </div>
      </td>
      <td className="py-3 px-3.5 text-center">
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-700">{cp.count}</span>
      </td>
      <td className="py-3 px-3.5 text-right">
        <div className="text-xs font-bold" style={{ color: RED }}>₹{fmt(cp.spend)}</div>
        {hov && <div className="text-[10px] text-gray-400">{fmtFull(cp.spend)}</div>}
      </td>
      <td className="py-3 px-3.5 text-right">
        <div className="text-xs font-bold" style={{ color: GREEN }}>₹{fmt(cp.credit)}</div>
        {hov && <div className="text-[10px] text-gray-400">{fmtFull(cp.credit)}</div>}
      </td>
      <td className="py-3 px-3.5 text-right">
        <div className="text-xs font-bold" style={{ color: net >= 0 ? GREEN : RED }}>
          {net >= 0 ? "+" : "-"}₹{fmt(Math.abs(net))}
        </div>
        {hov && <div className="text-[10px] text-gray-400">{net >= 0 ? "Surplus" : "Deficit"}</div>}
      </td>
      <td className="py-3 px-3.5 text-right">
        <div className="flex items-center gap-1.5 justify-end">
          <div className="w-15 h-1.5 rounded-full bg-gray-100 overflow-hidden" style={{ width: 60 }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: share, background: COLORS[i % COLORS.length] }}
            />
          </div>
          <span className="text-[11px] font-semibold text-gray-700 min-w-[36px] text-right">{share}</span>
        </div>
      </td>
    </tr>
  );
};

/* ═══════════════════════════════════════════════════
   UI PRIMITIVES
═══════════════════════════════════════════════════ */
const StatCard = ({ label, value, sub, color, icon: Icon }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="bg-white rounded-2xl p-5 flex-1 min-w-[160px] transition-all duration-200 cursor-default"
      style={{
        border: `1px solid ${hov ? color + "44" : "#f0f0f0"}`,
        boxShadow: hov ? `0 8px 24px ${color}22` : "0 2px 10px rgba(0,0,0,0.04)",
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200"
          style={{
            background: color + "18",
            transform: hov ? "scale(1.15)" : "scale(1)",
          }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-[22px] font-bold text-gray-900 m-0 leading-none">₹{fmt(value)}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1.5">{sub}</p>}
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, sub }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center" style={{ background: ACCENT + "18" }}>
      <Icon size={16} style={{ color: ACCENT }} />
    </div>
    <div>
      <h2 className="m-0 text-[15px] font-bold text-gray-900" style={{ fontFamily: "'Poppins',sans-serif" }}>{title}</h2>
      {sub && <p className="m-0 text-[11px] text-gray-400" style={{ fontFamily: "'Poppins',sans-serif" }}>{sub}</p>}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   LEGAL ENTITY SELECTOR
═══════════════════════════════════════════════════ */
const LegalEntitySelector = ({ entities, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const entityOptions = [
    { key: "__all__", label: "All Legal Entities", entity: null },
    ...entities.map(e => ({
      key: e._id,
      label: e.companyName,
      entity: e
    }))
  ];

  const selectedLabel = value === "__all__"
    ? "All Legal Entities"
    : entities.find(e => e._id === value)?.companyName || "Select Legal Entity";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-all"
        style={{
          background: value !== "__all__" ? "#ede9fe" : "white",
          color: value !== "__all__" ? "#3730a3" : "#374151",
          border: value !== "__all__" ? "1px solid #c4b5fd" : "1px solid #d1d5db",
          fontFamily: "'Poppins',sans-serif",
        }}
      >
        <Building2 size={14} />
        {selectedLabel}
        <ChevronDown size={12} className="opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] bg-white border border-gray-200 rounded-xl z-50 min-w-[220px] shadow-xl max-h-[280px] overflow-y-auto">
          {entityOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className="w-full text-left px-4 py-[9px] text-[13px] font-medium cursor-pointer border-none border-b border-gray-50 flex items-center gap-2 transition-colors"
              style={{
                background: value === opt.key ? "#ede9fe" : "transparent",
                color: value === opt.key ? "#3730a3" : "#374151",
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              {opt.entity && (
                <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                  {opt.entity.companyName?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="flex-1">{opt.label}</span>
              {opt.entity?.localCurrencyCode && (
                <span className="text-[10px] text-gray-400">{opt.entity.localCurrencyCode}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const ExpenseAnalytics = ({ expenses: propExpenses }) => {
  const [expenses, setExpenses] = useState(propExpenses || []);
  const [legalEntities, setLegalEntities] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(!propExpenses);
  const [selectedEntity, setSelectedEntity] = useState("__all__");
  const [activePieType, setActivePieType] = useState(0);
  const [activePieRatio, setActivePieRatio] = useState(0);

  const LEGAL_ENTITIES_API = "http://localhost:5000/api/legal-entities";
  const COMPANIES_API = "http://localhost:5000/api/companies";

  useEffect(() => {
    if (propExpenses) setExpenses(propExpenses);
  }, [propExpenses]);

  useEffect(() => {
    if (!document.getElementById("poppins-font")) {
      const l = document.createElement("link");
      l.id = "poppins-font"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
      document.head.appendChild(l);
    }
    if (!propExpenses) fetchExpenses();
    fetchLegalEntities();
    fetchCompanies();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const r = await axios.get("http://localhost:5000/api/expenses");
      if (r.data.success) setExpenses(r.data.data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLegalEntities = async () => {
    try {
      const r = await axios.get(LEGAL_ENTITIES_API);
      if (r.data.success) setLegalEntities(r.data.data);
    } catch (error) {
      console.error("Failed to fetch legal entities:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const r = await axios.get(COMPANIES_API);
      if (r.data.success) setCompanies(r.data.data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  const filteredExpenses = useMemo(() => {
    if (selectedEntity === "__all__") return expenses;
    const entityCompanies = companies
      .filter(c => String(c.legalEntityId) === String(selectedEntity))
      .map(c => c.companyName);
    if (entityCompanies.length === 0) return [];
    return expenses.filter(e => entityCompanies.includes(e.company));
  }, [expenses, selectedEntity, companies]);

  const allCompanies = useMemo(() => [...new Set(expenses.map(e => e.company).filter(Boolean))].sort(), [expenses]);

  const { totalSpend, totalCredit, netFlow, txCount } = useMemo(() => {
    let spend = 0, credit = 0;
    filteredExpenses.forEach(e => {
      const a = e.inrAmount ?? 0;
      if (a < 0) spend += Math.abs(a);
      else if (a > 0) credit += a;
    });
    return { totalSpend: spend, totalCredit: credit, netFlow: credit - spend, txCount: filteredExpenses.length };
  }, [filteredExpenses]);

  const monthlyData = useMemo(() => {
    if (filteredExpenses.length === 0) return [];
    let minDate = new Date();
    let maxDate = new Date(0);
    filteredExpenses.forEach(e => {
      const dt = new Date(e.date);
      if (!isNaN(dt)) {
        if (dt < minDate) minDate = dt;
        if (dt > maxDate) maxDate = dt;
      }
    });
    
    if (minDate > maxDate) return [];
    const paddingMonths = 3;
    minDate.setMonth(minDate.getMonth() - paddingMonths);
    maxDate.setMonth(maxDate.getMonth() + paddingMonths);
    const months = [];
    const current = new Date(minDate);``
    current.setDate(1);
    while (current <= maxDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const key = monthNames[month] + " " + String(year).slice(-2);
      const sortVal = year * 12 + month;
      months.push({ month: key, sortVal, spend: 0, credit: 0, net: 0, hasTransactions: false, transactionCount: 0, isPaddingMonth: true });
      current.setMonth(current.getMonth() + 1);
    }
    const actualMinDate = new Date(Math.min(...filteredExpenses.map(e => new Date(e.date))));
    const actualMaxDate = new Date(Math.max(...filteredExpenses.map(e => new Date(e.date))));
    months.forEach(m => {
      const [monthName, yearStr] = m.month.split(' ');
      const year = 2000 + parseInt(yearStr);
      const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(monthName);
      const monthDate = new Date(year, monthIndex, 1);
      if (monthDate >= actualMinDate && monthDate <= actualMaxDate) m.isPaddingMonth = false;
    });
    filteredExpenses.forEach(e => {
      const dt = new Date(e.date);
      if (isNaN(dt)) return;
      const year = dt.getFullYear();
      const month = dt.getMonth();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const key = monthNames[month] + " " + String(year).slice(-2);
      const monthData = months.find(m => m.month === key);
      if (monthData) {
        const a = e.inrAmount ?? 0;
        if (a < 0) monthData.spend += Math.abs(a);
        else monthData.credit += a;
        monthData.net = monthData.credit - monthData.spend;
        monthData.hasTransactions = true;
        monthData.transactionCount++;
        monthData.isPaddingMonth = false;
      }
    });
    return months.sort((a, b) => a.sortVal - b.sortVal);
  }, [filteredExpenses]);

  const companyData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const c = e.company || "Unknown";
      if (!map[c]) map[c] = { company: c, spend: 0, credit: 0, net: 0 };
      const a = e.inrAmount ?? 0;
      if (a < 0) map[c].spend += Math.abs(a);
      else map[c].credit += a;
      map[c].net = map[c].credit - map[c].spend;
    });
    return Object.values(map).sort((a, b) => (b.spend + b.credit) - (a.spend + a.credit));
  }, [filteredExpenses]);

  const typeData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const t = e.typeLabel || e.type || "Other";
      if (!map[t]) map[t] = { name: t, value: 0, count: 0 };
      map[t].value += Math.abs(e.inrAmount ?? 0);
      map[t].count++;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const countryData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const c = e.countryLabel || e.country || "Unknown";
      if (!map[c]) map[c] = { name: c, spend: 0, credit: 0 };
      const a = e.inrAmount ?? 0;
      if (a < 0) map[c].spend += Math.abs(a);
      else map[c].credit += a;
    });
    return Object.values(map).sort((a, b) => (b.spend + b.credit) - (a.spend + a.credit)).slice(0, 8);
  }, [filteredExpenses]);

  const deptData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const d = e.department || "General";
      if (!map[d]) map[d] = { name: d, spend: 0, credit: 0 };
      const a = e.inrAmount ?? 0;
      if (a < 0) map[d].spend += Math.abs(a);
      else map[d].credit += a;
    });
    return Object.values(map).sort((a, b) => b.spend - a.spend).slice(0, 8);
  }, [filteredExpenses]);

  const currencyData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      const c = e.currencyLabel || e.currency || "INR";
      if (!map[c]) map[c] = { name: c, value: 0, count: 0 };
      map[c].value += Math.abs(e.inrAmount ?? 0);
      map[c].count++;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const cpData = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(e => {
      if (!e.counterparty) return;
      if (!map[e.counterparty]) map[e.counterparty] = { name: e.counterparty, spend: 0, credit: 0, count: 0 };
      const a = e.inrAmount ?? 0;
      if (a < 0) map[e.counterparty].spend += Math.abs(a);
      else map[e.counterparty].credit += a;
      map[e.counterparty].count++;
    });
    return Object.values(map).sort((a, b) => (b.spend + b.credit) - (a.spend + a.credit)).slice(0, 10);
  }, [filteredExpenses]);

  const ratioData = [
    { name: "Spend", value: totalSpend },
    { name: "Credit", value: totalCredit },
  ];

  const totalCompanyVol = companyData.reduce((s, d) => s + d.spend + d.credit, 0);
  const totalCountryVol = countryData.reduce((s, d) => s + d.spend + d.credit, 0);
  const totalDeptVol = deptData.reduce((s, d) => s + d.spend + d.credit, 0);
  const cpTotal = cpData.reduce((s, c) => s + c.spend + c.credit, 0);

  const tk = (sz = 11, col = "#9ca3af") => ({ fontSize: sz, fill: col, fontFamily: "'Poppins',sans-serif" });
  const lgnd = { iconType: "square", iconSize: 10, wrapperStyle: { fontSize: 11, fontFamily: "'Poppins',sans-serif" } };

  const selectedEntityDetails = useMemo(() =>
    legalEntities.find(e => e._id === selectedEntity),
    [legalEntities, selectedEntity]
  );

  const entityCompaniesCount = useMemo(() => {
    if (selectedEntity === "__all__") return companies.length;
    return companies.filter(c => String(c.legalEntityId) === String(selectedEntity)).length;
  }, [companies, selectedEntity]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center" style={{ fontFamily: "'Poppins',sans-serif" }}>
        <div className="w-10 h-10 border-[3px] border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-[13px]">Loading analytics…</p>
      </div>
    </div>
  );

  const cardClass = "bg-white rounded-2xl border border-gray-100 p-6 shadow-sm";

  return (
    <div className="min-h-screen pb-16 bg-gray-50" style={{ fontFamily: "'Poppins',sans-serif" }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-7 py-[18px] flex items-center justify-between flex-wrap gap-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: ACCENT }}>
            <BarChart2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="m-0 text-xl font-bold text-gray-900">Expense Analytics</h1>
            <p className="m-0 text-[11px] text-gray-400 mt-0.5">
              {filteredExpenses.length} transactions · {entityCompaniesCount} companies
              {selectedEntityDetails && (
                <span className="ml-2 px-2 py-0.5 bg-violet-100 text-indigo-800 rounded-xl text-[10px]">
                  {selectedEntityDetails.companyName}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <LegalEntitySelector
            entities={legalEntities}
            value={selectedEntity}
            onChange={setSelectedEntity}
          />
          <button
            onClick={() => { fetchExpenses(); fetchLegalEntities(); fetchCompanies(); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-full text-[12px] font-semibold text-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 active:scale-95"
          >
            <RefreshCw size={12} className="transition-transform duration-300 active:rotate-180" />
          </button>
        </div>
      </div>

      <div className="px-3 py-7 max-w-350 mx-auto">

        {/* KPIs */}
        <div className="flex gap-4 flex-wrap mb-8">
          <StatCard label="Total Spend" value={totalSpend} color={RED} icon={TrendingDown}
            sub={`${filteredExpenses.filter(e => (e.inrAmount ?? 0) < 0).length} debit transactions`} />
          <StatCard label="Total Credit" value={totalCredit} color={GREEN} icon={TrendingUp}
            sub={`${filteredExpenses.filter(e => (e.inrAmount ?? 0) > 0).length} credit transactions`} />
          <StatCard label="Net Flow" value={Math.abs(netFlow)} color={netFlow >= 0 ? GREEN : RED}
            icon={netFlow >= 0 ? ArrowUpRight : ArrowDownRight}
            sub={netFlow >= 0 ? "Net positive (surplus)" : "Net negative (deficit)"} />
          <StatCard label="Avg per Txn" value={txCount > 0 ? (totalSpend + totalCredit) / txCount : 0}
            color={ACCENT} icon={Activity} sub={`Across ${txCount} transactions`} />
        </div>

        {/* Monthly Cash Flow */}
        {monthlyData.length > 0 && (
          <div className={`${cardClass} mb-6`}>
            <SectionHeader icon={Calendar} title="Monthly Cash Flow" sub="Hover any point for details" />
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={monthlyData} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={tk(11, "#9ca3af")} />
                <YAxis tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} width={64} />
                <Tooltip content={<CashFlowTT />} />
                <Legend {...lgnd} />
                <Area type="monotone" dataKey="credit" name="Credit"
                  fill={GREEN + "22"} stroke={GREEN} strokeWidth={2}
                  dot={{ r: 3, fill: GREEN }} activeDot={{ r: 6, fill: GREEN, stroke: "white", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="spend" name="Spend"
                  fill={RED + "22"} stroke={RED} strokeWidth={2}
                  dot={{ r: 3, fill: RED }} activeDot={{ r: 6, fill: RED, stroke: "white", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="net" name="Net"
                  stroke={ACCENT} strokeWidth={2} strokeDasharray="5 3"
                  dot={{ r: 3, fill: ACCENT }} activeDot={{ r: 6, fill: ACCENT, stroke: "white", strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Company Breakdown */}
        {(selectedEntity === "__all__" || companyData.length > 1) && companyData.length > 0 && (
          <div className={`${cardClass} mb-6`}>
            <SectionHeader icon={Building2} title="Company Breakdown" sub="Hover bars for details" />
            <ResponsiveContainer width="90%" height={Math.max(260, companyData.length * 60)}>
              <BarChart data={companyData} layout="vertical" margin={{ top: 4, right: 15, bottom: 4, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} />
                <YAxis type="category" dataKey="company" tick={tk(11, "#374151")} width={96} />
                <Tooltip content={<BarTT total={totalCompanyVol} />} />
                <Legend {...lgnd} />
                <Bar dataKey="spend" name="Spend" fill={RED} radius={[0, 4, 4, 0]} />
                <Bar dataKey="credit" name="Credit" fill={GREEN} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Single company summary */}
        {selectedEntity !== "__all__" && companyData.length === 1 && (
          <div className={`${cardClass} mb-6 bg-violet-50 border-violet-300`}>
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ACCENT + "22" }}>
                  <Building2 size={24} style={{ color: ACCENT }} />
                </div>
                <div>
                  <h3 className="m-0 text-base font-bold text-gray-900">{companyData[0].company}</h3>
                  <p className="m-0 mt-1 text-xs text-gray-500">Single company under this legal entity</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="text-[11px] text-gray-400 block">Spend</span>
                  <span className="text-base font-bold" style={{ color: RED }}>₹{fmt(companyData[0].spend)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block">Credit</span>
                  <span className="text-base font-bold" style={{ color: GREEN }}>₹{fmt(companyData[0].credit)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block">Net</span>
                  <span className="text-base font-bold" style={{ color: companyData[0].net >= 0 ? GREEN : RED }}>
                    {companyData[0].net >= 0 ? "+" : "-"}₹{fmt(Math.abs(companyData[0].net))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Type Pie + Ratio Pie */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {typeData.length > 0 && (
            <div className={cardClass}>
              <SectionHeader icon={PieChart} title="By Transaction Type" />
              <div className="flex items-center gap-2">
                <RPie width={220} height={220}>
                  <Pie
                    data={typeData} cx={110} cy={110}
                    innerRadius={52} outerRadius={82}
                    dataKey="value" stroke="none"
                    activeIndex={activePieType}
                    activeShape={ActivePieShape}
                    onMouseEnter={(_, i) => setActivePieType(i)}
                  >
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </RPie>
                <div className="flex-1 pl-1">
                  {typeData.map((t, i) => {
                    const tot = typeData.reduce((s, x) => s + x.value, 0);
                    const isActive = i === activePieType;
                    return (
                      <div
                        key={t.name}
                        onMouseEnter={() => setActivePieType(i)}
                        className="flex items-center gap-2 mb-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
                        style={{ background: isActive ? COLORS[i % COLORS.length] + "12" : "transparent" }}
                      >
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[11px] truncate"
                            style={{
                              fontWeight: isActive ? 700 : 600,
                              color: isActive ? COLORS[i % COLORS.length] : "#374151",
                            }}
                          >{t.name}</div>
                          <div className="text-[10px] text-gray-400">{t.count} txn · {pct(t.value, tot)}</div>
                        </div>
                        <div className="text-[11px] font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                          ₹{fmt(t.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {(totalSpend > 0 || totalCredit > 0) && (
            <div className={cardClass}>
              <SectionHeader icon={Activity} title="Spend vs Credit Ratio" />
              <div className="flex items-center justify-center gap-8">
                <RPie width={220} height={220}>
                  <Pie
                    data={ratioData} cx={110} cy={110}
                    innerRadius={58} outerRadius={88}
                    dataKey="value" stroke="none" paddingAngle={3}
                    activeIndex={activePieRatio}
                    activeShape={ActivePieShape}
                    onMouseEnter={(_, i) => setActivePieRatio(i)}
                  >
                    <Cell fill={RED} />
                    <Cell fill={GREEN} />
                  </Pie>
                </RPie>
                <div>
                  {ratioData.map((r, i) => {
                    const tot = totalSpend + totalCredit;
                    const isActive = i === activePieRatio;
                    const col = i === 0 ? RED : GREEN;
                    return (
                      <div
                        key={r.name}
                        onMouseEnter={() => setActivePieRatio(i)}
                        className="mb-4 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                        style={{
                          background: isActive ? col + "10" : "transparent",
                          border: isActive ? `1px solid ${col}30` : "1px solid transparent",
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: col }} />
                          <span className="text-xs font-bold" style={{ color: col }}>{r.name}</span>
                        </div>
                        <div className="text-xl font-bold" style={{ color: col }}>₹{fmt(r.value)}</div>
                        <div className="text-[11px] text-gray-400">{pct(r.value, tot)} of total flow</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{fmtFull(r.value)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Department Spend */}
        {deptData.length > 0 && (
          <div className={`${cardClass} mb-6`}>
            <SectionHeader icon={Layers} title="Department Spend" sub="Hover bars for details" />
            <ResponsiveContainer width="90%" height={Math.max(220, deptData.length * 52)}>
              <BarChart data={deptData} layout="vertical" margin={{ top: 4, right: 15, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} />
                <YAxis type="category" dataKey="name" tick={tk(11, "#374151")} width={86} />
                <Tooltip content={<BarTT total={totalDeptVol} />} />
                <Legend {...lgnd} />
                <Bar dataKey="spend" name="Spend" fill={ACCENT} radius={[0, 4, 4, 0]} />
                <Bar dataKey="credit" name="Credit" fill={"#06b6d4"} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Country + Currency */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {countryData.length > 0 && (
            <div className={cardClass}>
              <SectionHeader icon={Globe} title="By Country" sub="Top 8 countries — hover for details" />
              <ResponsiveContainer width="100%" height={Math.max(220, countryData.length * 52)}>
                <BarChart data={countryData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(10, "#9ca3af")} />
                  <YAxis type="category" dataKey="name" tick={tk(10, "#374151")} width={66} />
                  <Tooltip content={<BarTT total={totalCountryVol} />} />
                  <Legend {...lgnd} />
                  <Bar dataKey="spend" name="Spend" fill={"#FF0000"} radius={[0, 3, 3, 0]} />
                  <Bar dataKey="credit" name="Credit" fill={"#10b981"} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {currencyData.length > 0 && (
            <div className={cardClass}>
              <SectionHeader icon={DollarSign} title="By Currency" sub="INR equivalent — hover for details" />
              <ResponsiveContainer width="100%" height={Math.max(220, currencyData.length * 52)}>
                <BarChart data={currencyData} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => "₹" + fmt(v)} tick={tk(10, "#9ca3af")} />
                  <YAxis type="category" dataKey="name" tick={tk(10, "#374151")} width={46} />
                  <Tooltip content={<CurrTT />} />
                  <Bar dataKey="value" name="INR Volume" radius={[0, 3, 3, 0]}>
                    {currencyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Counterparties */}
        {cpData.length > 0 && (
          <div className={`${cardClass} mb-6`}>
            <SectionHeader icon={Activity} title="Top Counterparties" sub="Hover rows for details" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    {["#", "Counterparty", "Transactions", "Spend", "Credit", "Net", "Share"].map(h => (
                      <th
                        key={h}
                        className="py-2.5 px-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                        style={{ textAlign: h === "#" || h === "Transactions" ? "center" : h === "Counterparty" ? "left" : "right" }}
                      >{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cpData.map((cp, i) => (
                    <CPRow key={cp.name} cp={cp} i={i} total={cpTotal} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Net Flow by Company */}
        {selectedEntity === "__all__" && companyData.length > 1 && (
          <div className={cardClass}>
            <SectionHeader icon={BarChart2} title="Net Flow by Company" sub="Positive = surplus · Negative = deficit — hover for details" />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyData} margin={{ top: 4, right: 20, bottom: 56, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="company" tick={tk(10, "#374151")} angle={-30} textAnchor="end" interval={0} />
                <YAxis tickFormatter={v => "₹" + fmt(v)} tick={tk(11, "#9ca3af")} width={64} />
                <Tooltip content={<NetTT />} />
                <Bar dataKey="net" name="Net Flow" radius={[4, 4, 0, 0]}>
                  {companyData.map((entry, i) => (
                    <Cell key={i} fill={entry.net >= 0 ? GREEN : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legal Entity Details Card */}
        {selectedEntity !== "__all__" && selectedEntityDetails && (
          <div className={`${cardClass} mt-6 bg-violet-50 border-violet-300`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ACCENT + "22" }}>
                <Building2 size={24} style={{ color: ACCENT }} />
              </div>
              <div>
                <h3 className="m-0 text-base font-bold text-gray-900">{selectedEntityDetails.companyName}</h3>
                <div className="flex gap-4 mt-1 flex-wrap">
                  {selectedEntityDetails.countryName && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Globe size={12} /> {selectedEntityDetails.countryName}
                    </span>
                  )}
                  {selectedEntityDetails.localCurrencyCode && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <DollarSign size={12} /> Local: {selectedEntityDetails.localCurrencyCode}
                    </span>
                  )}
                  {selectedEntityDetails.foreignCurrencyCode && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <DollarSign size={12} /> Foreign: {selectedEntityDetails.foreignCurrencyCode}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-auto flex gap-4">
                <div>
                  <span className="text-[11px] text-gray-400 block">Companies</span>
                  <span className="text-base font-bold" style={{ color: ACCENT }}>{entityCompaniesCount}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block">Transactions</span>
                  <span className="text-base font-bold" style={{ color: ACCENT }}>{txCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {filteredExpenses.length === 0 && selectedEntity !== "__all__" && (
          <div className={`${cardClass} text-center py-12`}>
            <Building2 size={48} className="text-gray-400 mb-4 opacity-30 mx-auto" />
            <h3 className="text-base font-semibold text-gray-700 mb-2">No Expenses Found</h3>
            <p className="text-[13px] text-gray-400 max-w-[400px] mx-auto">
              No expenses found for {selectedEntityDetails?.companyName}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseAnalytics;