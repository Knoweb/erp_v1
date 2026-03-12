import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import api from "../../utils/api";
import Alert from "../../components/Alert/Alert";
import { useNavigate } from "react-router-dom";

const DesignationsList = () => {
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentDesignation, setCurrentDesignation] = useState(null);
    const navigate = useNavigate();

    const fetchDesignations = async () => {
        try {
            const companyId = localStorage.getItem("companyId");

            if (!companyId) {
                throw new Error("Missing company ID");
            }

            // Fetch designations
            const response = await api.get(`/api/${companyId}/designations`);
            setDesignations(Array.isArray(response) ? response : []);

            // Also fetch departments for the edit dropdown
            const deptResponse = await api.get(`/api/${companyId}/departments`);
            setDepartments(Array.isArray(deptResponse) ? deptResponse : (deptResponse.data || []));

        } catch (err) {
            console.error(err);
            setError("Failed to fetch designations from the server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations();
    }, []);

    const filteredDesignations = designations.filter((desig) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            desig.name.toLowerCase().includes(searchLower) ||
            (desig.department?.name || "").toLowerCase().includes(searchLower)
        );
    });

    const handleEdit = (designation) => {
        setCurrentDesignation({
            ...designation,
            departmentCode: designation.department?.code || ""
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateDesignation = async () => {
        if (currentDesignation.name && currentDesignation.departmentCode) {
            try {
                const companyId = localStorage.getItem("companyId");
                await api.put(`/api/${companyId}/designations/${currentDesignation.id}`, {
                    name: currentDesignation.name,
                    departmentCode: currentDesignation.departmentCode,
                });

                Alert.success("Designation updated successfully!");
                setIsEditModalOpen(false);
                fetchDesignations();
            } catch (err) {
                Alert.error("Failed to update designation");
                console.error(err);
            }
        } else {
            Alert.error("Please fill in all fields");
        }
    };

    const handleDelete = async (designationId) => {
        const result = await Alert.confirm(
            "Are you sure you want to delete this designation? This action cannot be undone.",
            "Yes, Delete",
            "Cancel"
        );
        if (result.isConfirmed) {
            try {
                const companyId = localStorage.getItem("companyId");
                await api.delete(`/api/${companyId}/designations/${designationId}`);
                Alert.success("Designation deleted successfully!");
                fetchDesignations();
            } catch (err) {
                Alert.error("Failed to delete designation");
                console.error(err);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-6">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Designations</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search designations..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        onClick={() => navigate('/app/department/designation')}
                    >
                        <FiPlus /> Add Designation
                    </button>
                </div>
            </div>

            {filteredDesignations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600 text-lg">
                        {designations.length === 0 ? "No designations found." : "No matching designations found."}
                    </p>
                    <button
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                        onClick={() => navigate('/app/department/designation')}
                    >
                        <FiPlus /> Add New Designation
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Designation Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDesignations.map((desig) => (
                                    <tr key={desig.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {desig.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                {desig.department?.name || "N/A"} ({desig.department?.code || "N/A"})
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(desig)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(desig.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Designation Modal */}
            {isEditModalOpen && currentDesignation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Edit Designation</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={currentDesignation.name}
                                        onChange={(e) => setCurrentDesignation({ ...currentDesignation, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={currentDesignation.departmentCode}
                                        onChange={(e) => setCurrentDesignation({ ...currentDesignation, departmentCode: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.code}>
                                                {dept.name} ({dept.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateDesignation}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Update Designation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignationsList;
