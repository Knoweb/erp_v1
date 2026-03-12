import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import Alert from "../../components/Alert/Alert";

const CompanyRequests = () => {
  const [companies, setCompanies] = useState([]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/superadmin/requests');
      setCompanies(response);
    } catch (error) {
      console.error("Error fetching company requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProfile = (id) => {
    console.log(`View profile of company with id: ${id}`);
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/api/superadmin/companies/${id}/approve`);
      Alert.success("Company Approved Successfully!");
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Error approving company:", error);
      Alert.error("Failed to approve company.");
    }
  };

  const handleReject = (id) => {
    console.log(`Reject company with id: ${id}`);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Company Requests</h1>
      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="py-3 px-6">No</th>
            <th className="py-3 px-6">Company Name</th>
            <th className="py-3 px-6">Email</th>
            <th className="py-3 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company, index) => (
            <tr
              key={company.companyId}
              className="hover:bg-gray-100 transition duration-300"
            >
              <td className="py-4 px-6">{index + 1}</td>
              <td className="py-4 px-6">{company.companyName}</td>
              <td className="py-4 px-6">{company.email}</td>
              <td className="py-4 px-6 space-x-2">
                <button
                  onClick={() => handleProfile(company.companyId)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
                >
                  Profile
                </button>
                <button
                  onClick={() => handleAccept(company.companyId)}
                  className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(company.companyId)}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyRequests;
