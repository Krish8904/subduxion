import React, { useEffect, useState } from "react";
import axios from "axios";

const JobInquiries = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/career/applications`
      );
      setApplications(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm("Delete this application?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/career/applications/${id}`
      );
      setApplications(applications.filter((app) => app._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/career/applications/${id}/status`,
        { status: newStatus }
      );

      setApplications(
        applications.map(app =>
          app._id === id ? { ...app, status: res.data.status } : app
        )
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Job Applications
            </h1>
            <p className="text-slate-500">
              Manage submitted career applications
            </p>
          </div>

          <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
            <span className="text-slate-600 text-sm font-medium">
              Total Applications:{" "}
            </span>
            <span className="text-blue-600 text-sm font-bold">
              {applications.length}
            </span>
          </div>
        </div>

        {/* Cards */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-5-3-5 3V6a2 2 0 012-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No applications yet
            </h3>
            <p className="text-slate-500">
              Job applications will appear here once submitted.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 group relative"
              >
                <div className="p-6">

                  {/* Top Section */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5.121 17.804A9 9 0 1117.804 5.12M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 capitalize leading-tight">
                          {app.firstName} {app.middleName} {app.lastName}
                        </h3>
                        <p className="text-blue-600 text-sm font-medium mt-0.5">
                          {app.email}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {app.phone}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteApplication(app._id)}
                      className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                      title="Delete application"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Cover Letter */}
                  {app.coverLetter && (
                    <div className="mb-5 pb-5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Cover Letter ↴
                      </p>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* Resume */}
                  {app.resumePath && (
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Resume
                      </p>
                      <p className="text-slate-700 font-medium">
                        {app.resumePath}
                      </p>
                    </div>
                  )}

                  {/* Status + Footer */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">

                    {/* Status Selector */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Application Status
                      </p>

                      <select
                        value={app.status || "Screening"}
                        onChange={(e) => updateStatus(app._id, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-700 bg-white"
                      >
                        <option>Screening</option>
                        <option>1st Round</option>
                        <option>2nd Round</option>
                        <option>Final Round</option>
                        <option>Selected</option>
                        <option>Rejected</option>
                      </select>
                    </div>

                    {/* Submitted Date */}
                    <div className="text-sm text-slate-400">
                      Submitted: {new Date(app.createdAt).toLocaleString()}
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobInquiries;