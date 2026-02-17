import React, { useEffect, useState } from "react";
import { Briefcase, Wrench, Building2, TrendingUp, Clock, ChevronRight, BarChart3 } from "lucide-react";
import axios from "axios";

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [stats, setStats] = useState({
    openRoles: 0,
    services: 0,
    useCases: 0,
  });

  useEffect(() => {
    fetchStats();
    fetchLogs();
    fetchBookingsCount();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/pages");
      const pages = await response.json();

      let servicesCount = 0;
      let useCasesCount = 0;
      let openRolesCount = 0;

      pages.forEach((page) => {
        if (page.pageName === "services" && Array.isArray(page.sections?.services?.items)) {
          servicesCount = page.sections.services.items.length;
        }

        if (page.pageName === "usecases" && Array.isArray(page.sections?.usecases?.items)) {
          useCasesCount = page.sections.usecases.items.length;
        }

        if (page.pageName === "career") {
          const jobCategories = page.sections?.jobCategoriesSection?.jobCategories || [];
          openRolesCount = jobCategories.reduce(
            (acc, cat) => acc + (cat.jobs?.length || 0),
            0
          );
        }
      });

      setStats({
        services: servicesCount,
        useCases: useCasesCount,
        openRoles: openRolesCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/logs");
      setLogs(res.data.slice(0, 6));
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const fetchBookingsCount = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setBookingCount(res.data.length);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const StatCard = ({ icon, value, label, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
          <div className="text-white">{icon}</div>
        </div>
        <TrendingUp size={18} className="text-green-500" />
      </div>
      <h3 className="text-4xl font-bold text-slate-900">{value}</h3>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-slate-900">
          Dashboard Overview
        </h2>
        <p className="text-slate-600">
          Welcome back! Here's what's happening with your website.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Briefcase size={24} />}
          value={stats.openRoles}
          label="Open Roles"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={<Wrench size={24} />}
          value={stats.services}
          label="Total Services"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={<Building2 size={24} />}
          value={stats.useCases}
          label="Total Use Cases"
          color="from-orange-500 to-orange-600"
        />
        <StatCard
          icon={<BarChart3 size={24} />}
          value={bookingCount}
          label="Call Bookings"
          color="from-green-500 to-green-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Recent Activity
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log._id} className="p-6 hover:bg-slate-50 transition">
              <p className="text-sm font-medium text-slate-900 mb-1">
                {log.message}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(log.createdAt).toLocaleString()}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  {log.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}