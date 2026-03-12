import React, { useState, useEffect } from "react";
import { FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiFileText } from "react-icons/fi";
import api from "../../utils/api";
import Alert from "../Alert/Alert";

const STATUS_STYLES = {
    PENDING: { cls: "bg-yellow-100 text-yellow-700", label: "Pending" },
    APPROVED: { cls: "bg-green-100 text-green-700", label: "Approved" },
    REJECTED: { cls: "bg-red-100 text-red-600", label: "Rejected" },
};

const EditRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const companyId = localStorage.getItem("companyId");
    const token = localStorage.getItem("auth_token");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Using the purchase order edit requests as an example — adjust endpoint as needed
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || ""}/api/companies/${companyId}/edit-requests`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.ok) {
                const data = await res.json();
                setRequests(Array.isArray(data) ? data : []);
            } else {
                setRequests([]);
            }
        } catch (e) {
            console.error(e);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-3 text-gray-500 text-sm">Loading requests...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Edit Requests</h1>
                    <p className="text-gray-500 text-sm mt-1">Track all edit and modification requests</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-sm transition"
                >
                    <FiRefreshCw size={14} /> Refresh
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow border border-gray-100 p-12 text-center">
                    <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
                        <FiFileText className="text-blue-400" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Edit Requests</h3>
                    <p className="text-gray-500 text-sm">There are no pending edit requests at this time.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map((req, idx) => {
                                    const s = STATUS_STYLES[req.status] || STATUS_STYLES.PENDING;
                                    return (
                                        <tr key={req.id || idx} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{req.requestType || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-blue-600">{req.referenceNo || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{req.requestedBy || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
                                                    {req.status === "APPROVED" ? <FiCheckCircle size={11} /> :
                                                        req.status === "REJECTED" ? <FiXCircle size={11} /> :
                                                            <FiClock size={11} />}
                                                    {s.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditRequests;
