import React, { useEffect, useState } from "react";
import axios from "axios";

const Logs = () => {
  const [logs, setLogs] = useState([]);          // logs array
  const [loading, setLoading] = useState(true);  // loading state
  const [error, setError] = useState(null);      // error state

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/api/logs");

      // Expecting API to return { success: true, logs: [...] }
      const data = Array.isArray(res.data.logs) ? res.data.logs : [];
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setError("Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">System Activity Logs</h1>
        <p>Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">System Activity Logs</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Activity Logs</h1>

      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log._id || Math.random()} // fallback key if _id missing
              className="bg-white shadow-md border rounded-lg p-4"
            >
              <p className="text-gray-800 font-medium">{log.message}</p>
              <div className="text-sm text-gray-500 mt-2 flex justify-between">
                <span>Type: {log.type || "N/A"}</span>
                <span>
                  {log.createdAt
                    ? new Date(log.createdAt).toLocaleString()
                    : "Unknown time"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Logs;