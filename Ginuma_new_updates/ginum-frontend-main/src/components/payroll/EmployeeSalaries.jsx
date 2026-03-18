import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit, FiSave, FiX, FiClock } from 'react-icons/fi';
import api from '../../utils/api';
import Alert from '../Alert/Alert';

const EmployeeSalaries = () => {
  const companyId = localStorage.getItem("companyId");

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    otherAllowances: 0,
    frequency: 'MONTHLY',
    effectiveFrom: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployeesWithSalaries();
  }, []);

  const fetchEmployeesWithSalaries = async () => {
    try {
      if (!companyId) return;
      setLoading(true);
      const response = await api.get(`/api/employees/${companyId}`);
      if (response && response.data) {
        const employeeList = Array.isArray(response.data) ? response.data : [];
        
        // Fetch salary for each employee
        const employeesWithSalary = await Promise.all(
          employeeList.map(async (emp) => {
            try {
              const salaryRes = await api.get(`/api/companies/${companyId}/payroll/employees/${emp.employeeId}/salary`);
              return { ...emp, currentSalary: salaryRes.data };
            } catch (e) {
              return { ...emp, currentSalary: null };
            }
          })
        );
        
        setEmployees(employeesWithSalary);
      }
    } catch (e) {
      console.error(e);
      Alert.error("Error loading employees");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee.employeeId);
    if (employee.currentSalary) {
      setSalaryForm({
        basicSalary: employee.currentSalary.basicSalary || 0,
        housingAllowance: employee.currentSalary.housingAllowance || 0,
        transportAllowance: employee.currentSalary.transportAllowance || 0,
        otherAllowances: employee.currentSalary.otherAllowances || 0,
        frequency: employee.currentSalary.frequency || 'MONTHLY',
        effectiveFrom: new Date().toISOString().split('T')[0]
      });
    } else {
      setSalaryForm({
        basicSalary: 0,
        housingAllowance: 0,
        transportAllowance: 0,
        otherAllowances: 0,
        frequency: 'MONTHLY',
        effectiveFrom: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setSalaryForm({
      basicSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      frequency: 'MONTHLY',
      effectiveFrom: new Date().toISOString().split('T')[0]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSalaryForm(prev => ({
      ...prev,
      [name]: name === 'frequency' ? value : parseFloat(value) || 0
    }));
  };

  const handleSaveSalary = async (employeeId) => {
    try {
      setSubmitting(true);
      await api.post(`/api/companies/${companyId}/payroll/employees/${employeeId}/salary`, salaryForm);
      Alert.success("Employee salary updated successfully");
      setEditingEmployee(null);
      fetchEmployeesWithSalaries();
    } catch (e) {
      console.error(e);
      Alert.error(e.response?.data?.error || "Error updating salary");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalSalary = (salary) => {
    if (!salary) return 0;
    return (salary.basicSalary || 0) + 
           (salary.housingAllowance || 0) + 
           (salary.transportAllowance || 0) + 
           (salary.otherAllowances || 0);
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Salaries</h1>
          <p className="text-gray-600">Manage employee salary information</p>
        </div>
        <div className="relative mt-4 md:mt-0 w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            {employees.length === 0 ? "No employees found." : "No matching employees found."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEmployees.map((employee) => (
            <div key={employee.employeeId} className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-gray-600 text-sm">{employee.email}</p>
                  {employee.department && (
                    <p className="text-gray-500 text-sm mt-1">
                      {employee.department.name} - {employee.designation?.name}
                    </p>
                  )}
                </div>
                {editingEmployee !== employee.employeeId && (
                  <button
                    onClick={() => handleEditClick(employee)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <FiEdit /> Edit Salary
                  </button>
                )}
              </div>

              {editingEmployee === employee.employeeId ? (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Basic Salary *
                      </label>
                      <input
                        type="number"
                        name="basicSalary"
                        step="0.01"
                        value={salaryForm.basicSalary}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Housing Allowance
                      </label>
                      <input
                        type="number"
                        name="housingAllowance"
                        step="0.01"
                        value={salaryForm.housingAllowance}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transport Allowance
                      </label>
                      <input
                        type="number"
                        name="transportAllowance"
                        step="0.01"
                        value={salaryForm.transportAllowance}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Allowances
                      </label>
                      <input
                        type="number"
                        name="otherAllowances"
                        step="0.01"
                        value={salaryForm.otherAllowances}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency
                      </label>
                      <select
                        name="frequency"
                        value={salaryForm.frequency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="BI_WEEKLY">Bi-Weekly</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="DAILY">Daily</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Effective From *
                      </label>
                      <input
                        type="date"
                        name="effectiveFrom"
                        value={salaryForm.effectiveFrom}
                        onChange={(e) => setSalaryForm(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total Salary:</span>
                      <span className="text-xl font-bold text-blue-600">
                        Rs. {(
                          salaryForm.basicSalary +
                          salaryForm.housingAllowance +
                          salaryForm.transportAllowance +
                          salaryForm.otherAllowances
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <FiX /> Cancel
                    </button>
                    <button
                      onClick={() => handleSaveSalary(employee.employeeId)}
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave /> Save Salary
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4">
                  {employee.currentSalary ? (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Basic Salary</p>
                          <p className="text-lg font-semibold">Rs. {employee.currentSalary.basicSalary?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Housing</p>
                          <p className="text-lg font-semibold">Rs. {employee.currentSalary.housingAllowance?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Transport</p>
                          <p className="text-lg font-semibold">Rs. {employee.currentSalary.transportAllowance?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Other</p>
                          <p className="text-lg font-semibold">Rs. {employee.currentSalary.otherAllowances?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 rounded p-3">
                        <div>
                          <p className="text-sm text-gray-600">Total Salary</p>
                          <p className="text-xl font-bold text-gray-800">
                            Rs. {calculateTotalSalary(employee.currentSalary).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FiClock size={12} /> {employee.currentSalary.frequency} • Effective from {employee.currentSalary.effectiveFrom}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-3">No salary configured for this employee</p>
                      <button
                        onClick={() => handleEditClick(employee)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Configure Salary
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeSalaries;
