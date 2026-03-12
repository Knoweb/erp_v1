import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCompanies: 0,
    approvedCompanies: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/superadmin/dashboard-stats');
        setDashboardData(response); // returns {totalCompanies, approvedCompanies, pendingRequests}
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { id: 1, value: dashboardData.totalCompanies, label: "Total Registered", bgColor: "bg-purple-100", icon: "🌐" },
    { id: 2, value: dashboardData.approvedCompanies, label: "Active Companies", bgColor: "bg-green-100", icon: "✅" },
    { id: 3, value: dashboardData.pendingRequests, label: "Pending Requests", bgColor: "bg-yellow-100", icon: "⏳" },
    { id: 4, value: 0, label: "Warnings", bgColor: "bg-orange-100", icon: "⚠️" },
  ];

  return (
    <div className="p-6 bg-gray-100 flex-1">
      <h1 className="text-3xl font-semibold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="p-6 rounded-xl shadow-sm bg-white flex items-center space-x-4"
          >
            <span className={`text-3xl p-2 rounded-lg ${stat.bgColor}`}>{stat.icon}</span>
            <div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
