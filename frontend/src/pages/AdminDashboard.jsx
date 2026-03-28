import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from "react-router-dom";
import axios from 'axios';
import Sidebar from './Sidebar';
import { LucidePhoneCall } from 'lucide-react';
import {
  Briefcase, Users, TrendingUp, ChevronRight,
  Wrench, Building2, BarChart3, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const BLUE = "#3b82f6";
const PURPLE = "#8b5cf6";
const GREEN = "#10b981";
const ORANGE = "#f97316";
const YELLOW = "#eab308";
const PINK = "#ec4899";
const CYAN = "#06b6d4";
const INDIGO = "#6366f1";
const RED = "#ef4444";

const ChartTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="text-gray-500 font-semibold uppercase tracking-wide mb-1" style={{ fontSize: 10 }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: p.fill || p.stroke }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const STAT_CARDS = [
  { key: 'openRoles', label: 'Open Roles', icon: Briefcase, bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
  { key: 'services', label: 'Total Services', icon: Wrench, bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
  { key: 'useCases', label: 'Total Use Cases', icon: Building2, bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' },
  { key: 'bookingCount', label: 'Call Bookings', icon: LucidePhoneCall, bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
  { key: 'companiesCount', label: 'Registered Companies', icon: Building2, bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  { key: 'jobAppsCount', label: 'Job Applications', icon: Users, bg: 'bg-pink-100', text: 'text-pink-700', bar: 'bg-pink-500' },
];

// Only first 4 shown in the 2×2 grid; remaining 2 go into the summary chart
const GRID_CARDS = STAT_CARDS.slice(0, 6);
const CHART_CARDS = STAT_CARDS.slice(4);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCompanyPage = location.pathname.includes("company-inquiries");

  const [activeSection, setActiveSection] = useState('overview');
  const [pagesExpanded, setPagesExpanded] = useState(false);
  const [inquiriesExpanded, setInquiriesExpanded] = useState(false);
  const [activePage, setActivePage] = useState('');
  const [activeInquiry, setActiveInquiry] = useState('');
  const [mastersExpanded, setMastersExpanded] = useState(false);
  const [companiesExpanded, setCompaniesExpanded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPageMenu, setShowPageMenu] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [allPages, setAllPages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const [stats, setStats] = useState({
    openRoles: 0, services: 0, useCases: 0,
    totalVisitors: 0, activeLeads: 0, companiesCount: 0, jobAppsCount: 0,
  });

  useEffect(() => {
    const p = location.pathname;
    if (p === '/admin' || p === '/admin/') { setActiveSection('overview'); setActivePage(''); setActiveInquiry(''); }
    else if (p.startsWith('/admin/manage-jobs')) { setActiveSection('manage-jobs'); setActivePage(''); setActiveInquiry(''); }
    else if (p.startsWith('/admin/manage-media')) { setActiveSection('manage-media'); setActivePage(''); setActiveInquiry(''); }
    else if (p.startsWith('/admin/inquiries/call')) { setActiveSection('inquiries'); setActiveInquiry('call'); setInquiriesExpanded(true); setActivePage(''); }
    else if (p.startsWith('/admin/inquiries/contact')) { setActiveSection('inquiries'); setActiveInquiry('contact'); setInquiriesExpanded(true); setActivePage(''); }
    else if (p.startsWith('/admin/inquiries/job')) { setActiveSection('inquiries'); setActiveInquiry('job'); setInquiriesExpanded(true); setActivePage(''); }
    else if (p.startsWith('/admin/all-logs')) { setActiveSection('logs'); setActivePage(''); setActiveInquiry(''); }
    else if (p.startsWith('/admin/home')) { setActiveSection('pages'); setActivePage('home'); setPagesExpanded(true); setActiveInquiry(''); }
    else if (p.startsWith('/admin/services')) { setActiveSection('pages'); setActivePage('services'); setPagesExpanded(true); setActiveInquiry(''); }
    else if (p.startsWith('/admin/company')) { setActiveSection('pages'); setActivePage('company'); setPagesExpanded(true); setActiveInquiry(''); }
    else if (p.startsWith('/admin/career')) { setActiveSection('pages'); setActivePage('career'); setPagesExpanded(true); setActiveInquiry(''); }
    else if (p.startsWith('/admin/usecases')) { setActiveSection('pages'); setActivePage('usecases'); setPagesExpanded(true); setActiveInquiry(''); }
    else if (p.startsWith('/admin/analytics')) { setActiveSection('analytics'); setActivePage(''); setActiveInquiry(''); }
    else if (p.startsWith('/admin/mainmasters/channel')) { setActiveSection('masters'); setActivePage('channel'); setMastersExpanded(true); }
    else if (p.startsWith('/admin/mainmasters/natureofbusiness')) { setActiveSection('masters'); setActivePage('natureofbusiness'); setMastersExpanded(true); }
    else if (p.startsWith('/admin/mainmasters/category')) { setActiveSection('masters'); setActivePage('category'); setMastersExpanded(true); }
    else if (p.startsWith('/admin/mainmasters/subcategory')) { setActiveSection('masters'); setActivePage('subcategory'); setMastersExpanded(true); }
    else if (p.startsWith('/admin/mainmasters/types')) { setActiveSection('masters'); setActivePage('types'); setMastersExpanded(true); }
    else if (p.startsWith('/admin/mainmasters/country')) { setActiveSection('masters'); setActivePage('country'); setMastersExpanded(true); }
    else if (p.startsWith('/admin/mainmasters/currency')) { setActiveSection('masters'); setActivePage('currency'); setMastersExpanded(true); }
    else if (p.startsWith('/admin/mainmasters')) { setActiveSection('masters'); setActivePage(''); setMastersExpanded(true); }
    else if (p.startsWith('/admin/newcompany')) { setActiveSection('newcompany'); setCompaniesExpanded(true); setActivePage(''); setActiveInquiry(''); }
    else if (p.startsWith('/admin/expense-inquiries/manageexpense')) { setActiveSection('manageexpense'); setActivePage(''); setActiveInquiry(''); }
    else if (p.startsWith('/admin/expense-inquiries')) { setActiveSection('expense-inquiries'); setCompaniesExpanded(true); setActivePage(''); setActiveInquiry(''); }
    else if (p.startsWith('/admin/settings')) { setActiveSection('settings'); }
    else if (p.startsWith('/admin/legalentities/expenseanalytics')) { setActiveSection('expenseanalytics'); setActivePage(''); setActiveInquiry(''); }
    else if (p.startsWith('/admin/legalentities')) { setActiveSection('legalentities'); }
  }, [location.pathname]);

  useEffect(() => { fetchStats(); fetchAllPages(); fetchLogs(); }, []);

  const fetchAllPages = async () => {
    try { const r = await axios.get('https://subduxion.onrender.com/api/pages'); setAllPages(r.data); }
    catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [pagesRes, companiesRes, jobAppsRes, bookingsRes] = await Promise.all([
        fetch('https://subduxion.onrender.com/api/pages'),
        axios.get('https://subduxion.onrender.com/api/companies'),
        axios.get('https://subduxion.onrender.com/api/career/applications'),
        axios.get('https://subduxion.onrender.com/api/bookings'),
      ]);
      const pages = await pagesRes.json();
      const companiesCount = companiesRes.data.success ? companiesRes.data.data.length : 0;
      const jobAppsCount = jobAppsRes.data.length || 0;
      const bookings = bookingsRes.data || [];

      let servicesCount = 0, useCasesCount = 0, openRolesCount = 0;
      pages.forEach(page => {
        if (page.pageName === 'services' && Array.isArray(page.sections?.services?.items))
          servicesCount = page.sections.services.items.length;
        if (page.pageName === 'usecases' && Array.isArray(page.sections?.usecases?.items))
          useCasesCount = page.sections.usecases.items.length;
        if (page.pageName === 'career') {
          const cats = page.sections?.jobCategoriesSection?.jobCategories || [];
          openRolesCount = cats.reduce((a, c) => a + (c.jobs?.length || 0), 0);
        }
      });

      setBookingCount(bookings.length);
      setStats({ services: servicesCount, useCases: useCasesCount, openRoles: openRolesCount, totalVisitors: 0, activeLeads: 0, companiesCount, jobAppsCount });

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const last6 = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { label: monthNames[d.getMonth()], key: `${d.getFullYear()}-${d.getMonth()}`, bookings: 0, applications: 0 };
      });
      const toKey = d => { const dt = new Date(d); return `${dt.getFullYear()}-${dt.getMonth()}`; };
      bookings.forEach(b => { const m = last6.find(x => x.key === toKey(b.createdAt)); if (m) m.bookings++; });
      jobAppsRes.data.forEach(a => { const m = last6.find(x => x.key === toKey(a.createdAt)); if (m) m.applications++; });
      setTrendData(last6);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    try { const r = await axios.get("https://subduxion.onrender.com/api/logs"); setLogs(r.data.slice(0, 6)); }
    catch (e) { console.error(e); }
  };

  const Breadcrumb = () => {
    const crumbs = [{ label: 'Admin', action: () => navigate('/admin') }];
    if (activeSection === 'overview') { crumbs.push({ label: 'Overview', action: null }); }
    else if (activeSection === 'pages' && activePage) {
      crumbs.push({ label: 'Pages', action: () => { navigate('/admin'); setPagesExpanded(true); } });
      crumbs.push({ label: activePage.charAt(0).toUpperCase() + activePage.slice(1), action: null });
      if (editMode) crumbs.push({ label: 'Edit Section', action: null });
    } else if (activeSection === 'inquiries') {
      crumbs.push({ label: 'Inquiries', action: () => { navigate('/admin'); setInquiriesExpanded(true); } });
      if (activeInquiry === 'call') crumbs.push({ label: 'Call Inquiries', action: null });
      else if (activeInquiry === 'contact') crumbs.push({ label: 'General Inquiries', action: null });
      else if (activeInquiry === 'job') crumbs.push({ label: 'Job Applications', action: null });
    } else if (activeSection === 'manage-jobs') { crumbs.push({ label: 'Career Openings', action: null }); }
    else if (activeSection === 'manage-media') { crumbs.push({ label: 'Manage Media', action: null }); }
    else if (activeSection === 'analytics') { crumbs.push({ label: 'Analytics', action: null }); }
    else if (activeSection === 'settings') { crumbs.push({ label: 'Settings', action: null }); }
    else if (activeSection === 'logs') { crumbs.push({ label: 'All Logs', action: null }); }
    else if (activeSection === 'legalentities') { crumbs.push({ label: 'Legal Entities', action: null }); }
    else if (activeSection === 'newcompany') { crumbs.push({ label: 'Customers', action: () => setCompaniesExpanded(true) }); crumbs.push({ label: 'Company Inquiries', action: null }); }
    else if (activeSection === 'expense-inquiries') { crumbs.push({ label: 'Customers', action: () => setCompaniesExpanded(true) }); crumbs.push({ label: 'Expense Management', action: null }); }
    else if (activeSection === 'manageexpense') {
      crumbs.push({ label: 'Customers', action: () => { navigate('/admin'); setCompaniesExpanded(true); } });
      crumbs.push({ label: 'Expense Management', action: () => navigate('/admin/expense-inquiries') });
      crumbs.push({ label: 'Create Expense', action: null });
    } else if (location.pathname.includes('expenseanalytics')) {
      crumbs.push({ label: 'Legal Entities', action: () => navigate('/admin/legalentities') });
      crumbs.push({ label: 'Expense Analytics', action: null });
    } else if (activeSection === 'masters') {
      crumbs.push({ label: 'Masters', action: activePage ? () => { navigate('/admin/mainmasters'); setActivePage(''); } : null });
      const ml = { natureofbusiness: 'Nature of Business', channel: 'Channel', category: 'Category', subcategory: 'Subcategory', types: 'Types', country: 'Country', currency: 'Currency' };
      if (ml[activePage]) crumbs.push({ label: ml[activePage], action: null });
    }

    return (
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={13} className="text-gray-400 shrink-0" />}
            {crumb.action
              ? <button onClick={crumb.action} className="text-xs text-gray-500 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer p-0 font-medium">{crumb.label}</button>
              : <span className={`text-xs ${i === crumbs.length - 1 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>{crumb.label}</span>
            }
          </React.Fragment>
        ))}
      </div>
    );
  };

  const OverviewContent = () => {
    const tk = { fontSize: 11, fill: "#9ca3af" };

    const statValues = {
      openRoles: stats.openRoles,
      services: stats.services,
      useCases: stats.useCases,
      bookingCount: bookingCount,
      companiesCount: stats.companiesCount ?? 0,
      jobAppsCount: stats.jobAppsCount ?? 0,
    };

    const contentPie = [
      { name: "Services", value: stats.services, fill: PURPLE },
      { name: "Use Cases", value: stats.useCases, fill: ORANGE },
      { name: "Open Roles", value: stats.openRoles, fill: BLUE },
    ];
    const inquiryBar = [
      { name: "Bookings", value: bookingCount, fill: BLUE },
      { name: "Applications", value: stats.jobAppsCount ?? 0, fill: PURPLE },
      { name: "Companies", value: stats.companiesCount ?? 0, fill: GREEN },
    ];

    return (
      <div>
        {/* Page header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            Here's what's happening with SubDuxion
            <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-100 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading dashboard data...</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Top Row: 2×2 KPI Grid  +  Radar chart ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-6">

              {/* 2×2 stat cards */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="grid grid-cols-3">
                  {GRID_CARDS.map((card, i) => {
                    const Icon = card.icon;
                    const val = statValues[card.key];
                    const borderRight = i % 2 === 0 ? 'border-r border-gray-100' : '';
                    const borderBottom = i < 2 ? 'border-b border-gray-100' : '';
                    return (
                      <div
                        key={card.key}
                        className={`relative flex flex-col gap-3 p-5 hover:bg-gray-50 transition-colors ${borderRight} ${borderBottom}`}
                      >
                        {/* top accent bar */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${card.bar} rounded-t-xl`} />

                        <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.text} flex items-center justify-center shrink-0 mt-1`}>
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-3xl font-bold text-gray-900 leading-none tracking-tight">{val}</p>
                          <p className="text-xs text-gray-500 mt-2 font-medium leading-tight">{card.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>


              </div>

              <div className="bg-white border w-full border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <BarChart3 size={14} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Inquiry Totals</span>
                </div>
                <div className="p-4" style={{ height: 230 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inquiryBar} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="name" tick={tk} axisLine={false} tickLine={false} />
                      <YAxis tick={tk} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTT />} cursor={{ fill: '#f9fafb' }} />
                      <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]} maxBarSize={44}>
                        {inquiryBar.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>


              <div className="">
                {/* Area chart */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <TrendingUp size={14} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">6-Month Activity Trend</span>
                  </div>
                  <div className="p-4" style={{ height: 230 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                        <defs>
                          <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={PURPLE} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="label" tick={tk} axisLine={false} tickLine={false} />
                        <YAxis tick={tk} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTT />} />
                        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                        <Area type="monotone" dataKey="bookings" name="Bookings" stroke={BLUE} strokeWidth={2} fill="url(#gB)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: BLUE }} />
                        <Area type="monotone" dataKey="applications" name="Applications" stroke={PURPLE} strokeWidth={2} fill="url(#gP)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: PURPLE }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Pie */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <Wrench size={14} className="text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Content Distribution</span>
                </div>
                <div className="p-4" style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={contentPie} cx="50%" cy="44%" innerRadius={52} outerRadius={74} dataKey="value" paddingAngle={3} stroke="none">
                        {contentPie.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85} />)}
                      </Pie>
                      <Tooltip content={<ChartTT />} />
                      <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Recent logs */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="text-lg font-semibold text-gray-800">Recent Activity</span>
                <button
                  onClick={() => navigate('/admin/all-logs')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors bg-transparent border-none cursor-pointer p-0 font-medium"
                >
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-start justify-between gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {log.message}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock size={10} className="text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                      {log.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" onClick={() => setShowPageMenu(null)}>
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeSection={activeSection}
        activePage={activePage}
        activeInquiry={activeInquiry}
        pagesExpanded={pagesExpanded}
        setPagesExpanded={setPagesExpanded}
        inquiriesExpanded={inquiriesExpanded}
        setInquiriesExpanded={setInquiriesExpanded}
        mastersExpanded={mastersExpanded}
        setMastersExpanded={setMastersExpanded}
        companiesExpanded={companiesExpanded}
        setCompaniesExpanded={setCompaniesExpanded}
        allPages={allPages}
      />

      <div className="flex-1 overflow-auto min-w-0">
        <div className={`max-w-7xl mx-auto ${isCompanyPage ? '' : 'p-3'}`}>
          <Breadcrumb />
          {activeSection === 'overview' ? <OverviewContent /> : <Outlet context={{ sidebarCollapsed }} />}
        </div>
      </div>
    </div>
  );
}