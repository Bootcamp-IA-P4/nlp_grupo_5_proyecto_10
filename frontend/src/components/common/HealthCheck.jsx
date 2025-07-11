import React, { useEffect, useState } from "react";
import axios from "axios";

const HealthCheck = () => {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await axios.get("http://localhost:8000/health", {
        timeout: 5000,
      });

      if (response.data.status === "ok") {
        setStatus("connected");
      } else {
        setStatus("error");
        setError("Backend returned unexpected response");
      }
    } catch (err) {
      setStatus("error");
      if (
        err.code === "ECONNREFUSED" ||
        err.message.includes("Network Error")
      ) {
        setError(
          "Backend server is not available. Please start the backend server."
        );
      } else {
        setError(err.message || "Failed to connect to backend");
      }
    }
  };

  if (status === "checking") {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
        <span>Checking backend connection...</span>
      </div>
    );
  }

  if (status === "connected") {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
        <span>Backend connected</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-2 text-red-600 mb-2">
        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
        <span className="font-semibold">Backend Connection Failed</span>
      </div>
      <p className="text-red-700 text-sm">{error}</p>
      <button
        onClick={checkBackendHealth}
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        Retry Connection
      </button>
    </div>
  );
};

export default HealthCheck;
