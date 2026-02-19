import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PhoneCall, Users, Building2, Mail, Briefcase,
  Wrench, BarChart3, TrendingUp, RefreshCw,
  CheckCircle, Clock, XCircle, AlertCircle,
} from "lucide-react";

const API = "http://localhost:5000";

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    callBookings: 0,
    applications: 0,
    contactInquiries: 0,
    companyRegistrations: 0,
    openRoles: 0,
    services: 0,
    useCases: 0,
    // breakdowns
    bookingStatuses: {},
    applicationStatuses: {},
    recentBookings: [],
    recentApplications: [],
    recentContacts: [],
    recentCompanies: [],
  });

  const fetchAll = async () => {
    try {
      const [bookingsRes, applicationsRes, contactsRes, companiesRes, pagesRes] =
        await Promise.allSettled([
          axios.get(`${API}/api/bookings`),
          axios.get(`${API}/api/career/applications`),
          axios.get(`${API}/api/contact`),
          axios.get(`${API}/api/companies`),
          axios.get(`${API}/api/pages`),
        ]);

      const bookings = bookingsRes.status === "fulfilled" ? bookingsRes.value.data : [];
      const applications = applicationsRes.status === "fulfilled" ? applicationsRes.value.data : [];
      const contacts = contactsRes.status === "fulfilled" ? contactsRes.value.data : [];
      const companies = companiesRes.status === "fulfilled" ? companiesRes.value.data.data ?? [] : [];
      const pages = pagesRes.status === "fulfilled" ? pagesRes.value.data : [];

      // Parse pages
      let services = 0, useCases = 0, openRoles = 0;
      pages.forEach((page) => {
        if (page.pageName === "services" && Array.isArray(page.sections?.services?.items))
          services = page.sections.services.items.length;
        if (page.pageName === "usecases" && Array.isArray(page.sections?.usecases?.items))
          useCases = page.sections.usecases.items.length;
        if (page.pageName === "career") {
          const cats = page.sections?.jobCategoriesSection?.jobCategories || [];
          openRoles = cats.reduce((a, c) => a + (c.jobs?.length || 0), 0);
        }
      });

      // Booking status breakdown
      const bookingStatuses = bookings.reduce((acc, b) => {
        const s = b.status || "pending";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});

      // Application status breakdown
      const applicationStatuses = applications.reduce((acc, a) => {
        const s = a.status || "Screening";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});

      setData({
        callBookings: bookings.length,
        applications: applications.length,
        contactInquiries: contacts.length,
        companyRegistrations: companies.length,
        openRoles,
        services,
        useCases,
        bookingStatuses,
        applicationStatuses,
        recentBookings: bookings.slice(0, 5),
        recentApplications: applications.slice(0, 5),
        recentContacts: contacts.slice(0, 5),
        recentCompanies: companies.slice(0, 5),
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchAll(); };

  // ── helpers ──────────────────────────────────────────────────────────
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    Screening: "bg-blue-100 text-blue-700 border-blue-200",
    "1st Round": "bg-purple-100 text-purple-700 border-purple-200",
    "2nd Round": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Final Round": "bg-orange-100 text-orange-700 border-orange-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
    Hired: "bg-green-100 text-green-700 border-green-200",
  };

  // ── sub-components ────────────────────────────────────────────────────
  const BigStat = ({ icon: Icon, value, label, linear, sub }) => (
    <div className={`group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in-up`}>
      <div className={`absolute inset-0 bg-linear-to-br ${linear} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-12 h-12 bg-linear-to-br ${linear} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={22} className="text-white" />
          </div>
          <TrendingUp size={16} className="text-slate-300 group-hover:text-green-400 transition-colors duration-300" />
        </div>
        <div className={`text-3xl font-bold bg-linear-to-br ${linear} bg-clip-text text-transparent mb-1`}>
          {value}
        </div>
        <div className="text-sm font-semibold text-slate-600">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );

  const MiniStat = ({ icon: Icon, value, label, color, linear }) => (
    <div className="group relative overflow-hidden flex items-center gap-3 transition-all duration-300 bg-white rounded-xl px-4 py-3 border shadow-sm hover:shadow-xl border-slate-100">

      <div className={`absolute inset-0 bg-linear-to-br ${linear} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className={`relative w-11 h-11 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>

      <div className="relative">
        <div className="text-xl font-bold text-slate-800">{value}</div>
        <div className="text-md text-slate-500">{label}</div>
      </div>
    </div>
  );

  const StatusBar = ({ label, count, total, color }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium capitalize">{label}</span>
          <span className="text-slate-500">{count} <span className="text-slate-400">({pct}%)</span></span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  const SectionCard = ({ title, icon: Icon, iconColor, children }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
        <div className={`w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center`}>
          <Icon size={17} className="text-white" />
        </div>
        <h3 className="font-bold text-slate-800 text-md">{title}</h3>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );

  const Row = ({ primary, secondary, badge, badgeCls, date }) => (
    <div className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800 truncate">{primary}</div>
        {secondary && <div className="text-xs text-slate-400 mt-0.5 truncate">{secondary}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {date && <span className="text-xs text-slate-400">{fmt(date)}</span>}
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${badgeCls || "bg-slate-100 text-slate-600 border-slate-200"}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );

  const Empty = ({ text }) => (
    <div className="px-6 py-8 text-center text-sm text-slate-400">{text}</div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="w-14 h-14 border-4 border-transparent border-t-purple-500 rounded-full animate-spin absolute inset-0" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
        <p className="mt-5 text-slate-500 font-medium">Loading analytics…</p>
      </div>
    );
  }

  const totalBookings = data.callBookings;
  const totalApps = data.applications;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">Analytics</h2>
          <p className="text-slate-500 text-sm">
            A snapshot of all activity across your platform
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </p>
        </div>

      </div>

      {/* ── Content Stats (Services / Use Cases / Open Roles) ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Content</p>
        <div className="grid grid-cols-3 gap-4">
          <MiniStat
            icon={Wrench}
            value={data.services}
            label="Services"
            color="bg-purple-500"
            linear="from-purple-500 to-purple-600"
          />          
          <MiniStat icon={BarChart3} value={data.useCases} label="Use Cases" color="bg-orange-500" linear="from-orange-500 to-orange-600"/>
          <MiniStat icon={Briefcase} value={data.openRoles} label="Open Roles" color="bg-blue-500" linear="from-blue-500 to-blue-600" />
        </div>
      </div>

      {/* ── Big Inquiry Stats ──────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Inquiries & Submissions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <BigStat icon={PhoneCall} value={data.callBookings} label="Call Bookings"
            linear="from-blue-500 to-blue-600" sub="via Book a Call form" />
          <BigStat icon={Users} value={data.applications} label="Job Applications" linear="from-purple-500 to-purple-600" sub="via Careers page" />
          <BigStat icon={Mail} value={data.contactInquiries} label="Contact Inquiries" linear="from-slate-500 to-slate-700" sub="via Contact Us form" />
          <BigStat icon={Building2} value={data.companyRegistrations} label="Company Registrations" linear="from-green-500 to-green-600" sub="via Company Registration" />
        </div>
      </div>

      {/* ── Status Breakdowns ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Booking statuses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <PhoneCall size={17} className="text-white" />
            </div>
            <h3 className="font-bold text-slate-800 text-md">Call Booking Statuses</h3>
          </div>
          {totalBookings === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.bookingStatuses).map(([status, count]) => (
                <StatusBar
                  key={status} label={status} count={count} total={totalBookings}
                  color={status === "confirmed" ? "bg-green-400" : status === "cancelled" ? "bg-red-400" : "bg-yellow-400"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Application statuses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <Users size={17} className="text-white" />
            </div>
            <h3 className="font-bold text-slate-800 text-md">Application Records</h3>
          </div>
          {totalApps === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.applicationStatuses).map(([status, count]) => (
                <StatusBar
                  key={status} label={status} count={count} total={totalApps}
                  color={
                    status === "Hired" ? "bg-green-400"
                      : status === "Rejected" ? "bg-red-400"
                        : status === "Final Round" ? "bg-orange-400"
                          : status === "2nd Round" ? "bg-indigo-400"
                            : status === "1st Round" ? "bg-purple-400"
                              : "bg-blue-400"
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity Tables ─────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Recent Activity</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Recent Call Bookings */}
          <SectionCard title="Recent Call Bookings" icon={PhoneCall} iconColor="bg-blue-500">
            {data.recentBookings.length === 0
              ? <Empty text="No call bookings yet" />
              : data.recentBookings.map((b) => (
                <Row key={b._id}
                  primary={b.name}
                  secondary={`${b.date} at ${b.time} · ${b.phone}`}
                  badge={b.status}
                  badgeCls={statusColor[b.status]}
                  date={b.createdAt}
                />
              ))
            }
          </SectionCard>

          {/* Recent Applications */}
          <SectionCard title="Recent Job Applications" icon={Users} iconColor="bg-purple-500">
            {data.recentApplications.length === 0
              ? <Empty text="No applications yet" />
              : data.recentApplications.map((a) => (
                <Row key={a._id}
                  primary={`${a.firstName} ${a.lastName}`}
                  secondary={a.email}
                  badge={a.status}
                  badgeCls={statusColor[a.status]}
                  date={a.createdAt}
                />
              ))
            }
          </SectionCard>

          {/* Recent Contact Inquiries */}
          <SectionCard title="Recent Contact Inquiries" icon={Mail} iconColor="bg-slate-500">
            {data.recentContacts.length === 0
              ? <Empty text="No contact inquiries yet" />
              : data.recentContacts.map((c) => (
                <Row key={c._id}
                  primary={`${c.firstName} ${c.lastName}`}
                  secondary={c.email}
                  date={c.createdAt}
                />
              ))
            }
          </SectionCard>

          {/* Recent Company Registrations */}
          <SectionCard title="Recent Company Registrations" icon={Building2} iconColor="bg-green-500">
            {data.recentCompanies.length === 0
              ? <Empty text="No registrations yet" />
              : data.recentCompanies.map((c) => (
                <Row key={c._id}
                  primary={c.companyName}
                  secondary={`${c.companyEmail} · ${c.companyId || ""}`}
                  date={c.createdAt}
                />
              ))
            }
          </SectionCard>

        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out both; }
      `}</style>
    </div>
  );
}

export default Analytics;