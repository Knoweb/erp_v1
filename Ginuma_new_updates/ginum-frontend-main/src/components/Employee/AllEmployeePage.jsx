import React, { useEffect, useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiUser,
  FiCalendar,
  FiPhone,
  FiMail,
  FiHome,
  FiCreditCard,
  FiHash
} from "react-icons/fi";
import { apiUrl } from "../../utils/api";
import AddEmployeeForm from "./AddEmployeeForm";
import Alert from "../../components/Alert/Alert";
import { useNavigate } from "react-router-dom";

const AllEmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      const token = localStorage.getItem("auth_token");

      if (!companyId || !token) {
        setError("Missing company ID or auth token.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${apiUrl}/api/employees/${companyId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch employees. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(searchLower) ||
      emp.lastName.toLowerCase().includes(searchLower) ||
      (emp.designation?.name || "").toLowerCase().includes(searchLower) ||
      (emp.department?.name || "").toLowerCase().includes(searchLower) ||
      (emp.nic || "").toLowerCase().includes(searchLower) ||
      (emp.epfNo || "").toLowerCase().includes(searchLower) ||
      (emp.email || "").toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (employeeId) => {
    const result = await Alert.confirm(
      "Are you sure you want to delete this employee? This action cannot be undone.",
      "Yes, Delete",
      "Cancel"
    );
    if (result.isConfirmed) {
      try {
        const companyId = localStorage.getItem("companyId");
        const token = localStorage.getItem("auth_token");

        const response = await fetch(`${apiUrl}/api/employees/${companyId}/${employeeId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          Alert.success("Employee deleted successfully");
          fetchEmployees();
        } else {
          Alert.error("Failed to delete employee");
        }
      } catch (err) {
        Alert.error("Error deleting employee");
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-6">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Employees</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            onClick={() => navigate('/app/employee/new')}
          >
            <FiPlus /> Add Employee
          </button>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            {employees.length === 0 ? "No employees found." : "No matching employees found."}
          </p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            onClick={() => navigate('/app/employee/new')}
          >
            <FiPlus /> Add New Employee
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position/Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Contact Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Identification
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {emp.imgPath ? (
                            <img
                              src={emp.imgPath}
                              alt={`${emp.firstName} ${emp.lastName}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold uppercase">
                              {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiUser className="mr-1" size={14} />
                            {emp.gender || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiCalendar className="mr-1" size={14} />
                            {formatDate(emp.dob)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {emp.designation?.name || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {emp.department?.name || "-"} ({emp.department?.code || "-"})
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined: {formatDate(emp.dateAdded)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiPhone className="mr-2" size={14} />
                        {emp.mobileNo || "-"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiMail className="mr-2" size={14} />
                        <span className="truncate max-w-xs" title={emp.email}>
                          {emp.email || "-"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiHome className="mr-2" size={14} />
                        <span className="truncate max-w-xs" title={emp.address}>
                          {emp.address || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiCreditCard className="mr-2" size={14} />
                        NIC: {emp.nic || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        EPF No: {emp.epfNo || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Employee ID: {emp.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.employeeId)}
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

      {/* Edit Employee Modal */}
      {isEditModalOpen && currentEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl my-8">
            <AddEmployeeForm
              employeeToEdit={currentEmployee}
              onSuccess={() => {
                setIsEditModalOpen(false);
                fetchEmployees();
              }}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEmployeePage;