import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { FiX, FiUser, FiShield, FiToggleRight, FiRefreshCw } from "react-icons/fi";
import Alert from "../Alert/Alert";

const STATUS_OPTIONS = ["Active", "Pending", "Reject", "Not Paid"];
const PRIVILEGE_OPTIONS = ["All", "Inventory", "Payroll", "Manufacturing"];

const STATUS_BADGE = {
  Active: "bg-green-500 text-white",
  Pending: "bg-blue-400 text-white",
  "Not Paid": "bg-yellow-500 text-black",
  Reject: "bg-red-500 text-white",
};

const AllCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local overrides (optimistic UI) — keyed by companyId
  const [localStatus, setLocalStatus] = useState({});
  const [localPrivilege, setLocalPrivilege] = useState({});

  // Modal states
  const [profileCompany, setProfileCompany] = useState(null);
  const [privilegeCompany, setPrivilegeCompany] = useState(null);
  const [statusCompany, setStatusCompany] = useState(null);

  const [selectedPrivilege, setSelectedPrivilege] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ===== Fetch Companies =====
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/superadmin/companies");
      setCompanies(response.data || response || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      Alert.error("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  // ===== Open modals =====
  const openPrivilege = (company) => {
    setPrivilegeCompany(company);
    setSelectedPrivilege(localPrivilege[company.companyId] || company.privilegeLevel || "All");
  };

  const openStatus = (company) => {
    setStatusCompany(company);
    setSelectedStatus(localStatus[company.companyId] || company.companyStatus || "Active");
  };

  // ===== Save Privilege =====
  const handleSavePrivilege = async () => {
    if (!selectedPrivilege || selectedPrivilege === "-- Select --") {
      Alert.error("Please select a privilege level.");
      return;
    }
    try {
      setIsSaving(true);
      await api.put(`/api/superadmin/companies/${privilegeCompany.companyId}/change-privilege`, {
        privilege: selectedPrivilege,
      });
      setLocalPrivilege(prev => ({ ...prev, [privilegeCompany.companyId]: selectedPrivilege }));
      Alert.success(`Privilege changed to "${selectedPrivilege}" for ${privilegeCompany.companyName}`);
      setPrivilegeCompany(null);
    } catch (err) {
      console.error(err);
      Alert.error("Failed to change privilege.");
    } finally {
      setIsSaving(false);
    }
  };

  // ===== Save Status =====
  const handleSaveStatus = async () => {
    if (!selectedStatus || selectedStatus === "-- Select --") {
      Alert.error("Please select a status.");
      return;
    }
    try {
      setIsSaving(true);
      await api.put(`/api/superadmin/companies/${statusCompany.companyId}/change-status`, {
        status: selectedStatus,
      });
      setLocalStatus(prev => ({ ...prev, [statusCompany.companyId]: selectedStatus }));
      Alert.success(`Status changed to "${selectedStatus}" for ${statusCompany.companyName}`);
      setStatusCompany(null);
    } catch (err) {
      console.error(err);
      Alert.error("Failed to change status.");
    } finally {
      setIsSaving(false);
    }
  };

  // ===== Helpers =====
  const getDisplayStatus = (company) =>
    localStatus[company.companyId] || company.companyStatus ||
    (company.status ? "Active" : "Pending");

  const getDisplayPrivilege = (company) =>
    localPrivilege[company.companyId] || company.privilegeLevel || "All";

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">All Companies</h1>
        <button
          onClick={fetchCompanies}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition text-sm"
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-left text-sm">
              <th className="py-4 px-6">No</th>
              <th className="py-4 px-6">Company Name</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Privilege Level</th>
              <th className="py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">No companies found.</td>
              </tr>
            )}
            {companies.map((company, index) => {
              const displayStatus = getDisplayStatus(company);
              const displayPrivilege = getDisplayPrivilege(company);
              return (
                <tr key={company.companyId} className="hover:bg-gray-50 transition border-t">
                  <td className="py-4 px-6 text-gray-600">{index + 1}</td>
                  <td className="py-4 px-6 font-medium">{company.companyName}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[displayStatus] || "bg-gray-400 text-white"}`}>
                      {displayStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {displayPrivilege}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* PROFILE */}
                      <button
                        onClick={() => setProfileCompany(company)}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-xs transition"
                      >
                        <FiUser size={12} /> Profile
                      </button>
                      {/* CHANGE PRIVILEGE */}
                      <button
                        onClick={() => openPrivilege(company)}
                        className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-xs transition"
                      >
                        <FiShield size={12} /> Change Privilege
                      </button>
                      {/* CHANGE STATUS */}
                      <button
                        onClick={() => openStatus(company)}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-xs transition"
                      >
                        <FiToggleRight size={12} /> Change Status
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===== PROFILE MODAL ===== */}
      {profileCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setProfileCompany(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-4 mb-5 border-b pb-4">
              {profileCompany.companyLogoBase64 ? (
                <img src={`data:image/jpeg;base64,${profileCompany.companyLogoBase64}`} alt="Logo" className="w-16 h-16 rounded-full object-cover border" />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {profileCompany.companyName?.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-800">{profileCompany.companyName}</h3>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[getDisplayStatus(profileCompany)] || "bg-gray-300"}`}>
                  {getDisplayStatus(profileCompany)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-400 text-xs mb-1">Registration No</p><p className="font-medium">{profileCompany.companyRegNo || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Category</p><p className="font-medium">{profileCompany.companyCategory || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Email</p><p>{profileCompany.email || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Phone</p><p>{profileCompany.phoneNo || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Mobile</p><p>{profileCompany.mobileNo || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Website</p><p>{profileCompany.websiteUrl || "—"}</p></div>
              <div className="col-span-2"><p className="text-gray-400 text-xs mb-1">Registered Address</p><p>{profileCompany.companyRegisteredAddress || "—"}</p></div>
              <div className="col-span-2"><p className="text-gray-400 text-xs mb-1">Factory Address</p><p>{profileCompany.companyFactoryAddress || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Country</p><p>{profileCompany.countryName || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Currency</p><p>{profileCompany.currencyCode || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">TIN No</p><p>{profileCompany.tinNo || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">VAT No</p><p>{profileCompany.vatNo || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">VAT Registered</p><p>{profileCompany.isVatRegistered ? "Yes" : "No"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Date Joined</p><p>{profileCompany.dateJoined || "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Subscription Expiry</p><p>{profileCompany.subscriptionExpiryDate ? new Date(profileCompany.subscriptionExpiryDate).toLocaleDateString() : "—"}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Privilege Level</p>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{getDisplayPrivilege(profileCompany)}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setProfileCompany(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHANGE PRIVILEGE MODAL ===== */}
      {privilegeCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-96 p-6 relative">
            <button onClick={() => setPrivilegeCompany(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full"><FiShield className="text-yellow-600" size={20} /></div>
              <h2 className="text-xl font-bold text-gray-800">Change Privilege Level</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Company: <span className="font-semibold text-gray-800">{privilegeCompany.companyName}</span></p>
            <label className="block mb-5">
              <span className="text-gray-700 font-medium text-sm">Select Privilege Level</span>
              <select
                value={selectedPrivilege}
                onChange={(e) => setSelectedPrivilege(e.target.value)}
                className="w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="-- Select --">-- Select --</option>
                {PRIVILEGE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPrivilegeCompany(null)} disabled={isSaving} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSavePrivilege} disabled={isSaving} className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm disabled:opacity-50 transition">
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHANGE STATUS MODAL ===== */}
      {statusCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-96 p-6 relative">
            <button onClick={() => setStatusCompany(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-100 rounded-full"><FiToggleRight className="text-red-600" size={20} /></div>
              <h2 className="text-xl font-bold text-gray-800">Change Company Status</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Company: <span className="font-semibold text-gray-800">{statusCompany.companyName}</span></p>
            <p className="text-sm text-gray-500 mb-4">
              Current Status:{" "}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[getDisplayStatus(statusCompany)] || "bg-gray-300"}`}>
                {getDisplayStatus(statusCompany)}
              </span>
            </p>
            <label className="block mb-5">
              <span className="text-gray-700 font-medium text-sm">Select New Status</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="-- Select --">-- Select --</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setStatusCompany(null)} disabled={isSaving} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSaveStatus} disabled={isSaving} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm disabled:opacity-50 transition">
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCompanies;
