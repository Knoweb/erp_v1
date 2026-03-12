import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import Alert from '../Alert/Alert';
import { useNavigate } from 'react-router-dom';

const CreatePayroll = () => {
  const navigate = useNavigate();
  const companyId = localStorage.getItem("companyId");

  const [formData, setFormData] = useState({
    payPeriodStart: '',
    payPeriodEnd: '',
    paymentDate: '',
    notes: '',
    payrollItems: []
  });

  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      if (!companyId) {
        console.warn("No companyId in session");
        setLoading(false);
        return;
      }
      setLoading(true);

      // api interceptor already returns response.data directly
      const data = await api.get(`/api/employees/${companyId}`);
      console.log("Employees response:", data); // debug

      const employeeList = Array.isArray(data) ? data
        : Array.isArray(data?.content) ? data.content
          : [];

      setEmployees(employeeList);

      // Initialize payroll items with employee data
      const initialItems = employeeList.map(emp => ({
        employeeId: emp.employeeId || emp.id,
        employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        basicSalary: emp.salary || 0,
        allowances: 0,
        overtimePay: 0,
        bonus: 0,
        workedDays: 30,
        overtimeHours: 0,
        notes: '',
        deductions: []
      }));
      setFormData(prev => ({ ...prev, payrollItems: initialItems }));
    } catch (e) {
      console.error("Error fetching employees:", e);
      Alert.error("Error loading employees. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handlePayrollItemChange = (employeeId, field, value) => {
    setFormData(prev => ({
      ...prev,
      payrollItems: prev.payrollItems.map(item =>
        item.employeeId === employeeId
          ? { ...item, [field]: parseFloat(value) || 0 }
          : item
      )
    }));
  };

  const addDeduction = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      payrollItems: prev.payrollItems.map(item =>
        item.employeeId === employeeId
          ? {
            ...item,
            deductions: [
              ...item.deductions,
              { deductionType: 'TAX', description: '', amount: 0, mandatory: true }
            ]
          }
          : item
      )
    }));
  };

  const removeDeduction = (employeeId, deductionIndex) => {
    setFormData(prev => ({
      ...prev,
      payrollItems: prev.payrollItems.map(item =>
        item.employeeId === employeeId
          ? {
            ...item,
            deductions: item.deductions.filter((_, index) => index !== deductionIndex)
          }
          : item
      )
    }));
  };

  const handleDeductionChange = (employeeId, deductionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      payrollItems: prev.payrollItems.map(item =>
        item.employeeId === employeeId
          ? {
            ...item,
            deductions: item.deductions.map((deduction, index) =>
              index === deductionIndex
                ? { ...deduction, [field]: field === 'amount' ? parseFloat(value) || 0 : value }
                : deduction
            )
          }
          : item
      )
    }));
  };

  const calculateGrossPay = (item) => {
    return item.basicSalary + item.allowances + item.overtimePay + item.bonus;
  };

  const calculateTotalDeductions = (item) => {
    return item.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  };

  const calculateNetPay = (item) => {
    return calculateGrossPay(item) - calculateTotalDeductions(item);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.payPeriodStart || !formData.payPeriodEnd || !formData.paymentDate) {
      Alert.error("Please fill all required fields");
      return;
    }

    if (selectedEmployees.length === 0) {
      Alert.error("Please select at least one employee");
      return;
    }

    // Filter to only include selected employees
    const selectedItems = formData.payrollItems.filter(item =>
      selectedEmployees.includes(item.employeeId)
    );

    if (selectedItems.some(item => item.basicSalary === 0)) {
      Alert.error("Please enter basic salary for all selected employees");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        payrollItems: selectedItems
      };

      await api.post(`/api/companies/${companyId}/payroll`, payload);
      Alert.success("Payroll created successfully");
      navigate('/app/payroll/all');
    } catch (e) {
      console.error(e);
      Alert.error(e.response?.data?.error || "Error creating payroll");
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Create Payroll</h1>
        <p className="text-gray-600 mt-2">Create a new payroll run for selected employees</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Payroll Period Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payroll Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Period Start <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="payPeriodStart"
                value={formData.payPeriodStart}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Period End <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="payPeriodEnd"
                value={formData.payPeriodEnd}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes for this payroll run..."
            />
          </div>
        </div>

        {/* Employee Selection and Payroll Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Employee Payroll Details</h2>

          {formData.payrollItems.map((item, index) => (
            <div key={item.employeeId} className="border rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(item.employeeId)}
                  onChange={() => handleEmployeeSelect(item.employeeId)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-3">{item.employeeName}</h3>

                  {selectedEmployees.includes(item.employeeId) && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Basic Salary *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.basicSalary}
                            onChange={(e) => handlePayrollItemChange(item.employeeId, 'basicSalary', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Allowances
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.allowances}
                            onChange={(e) => handlePayrollItemChange(item.employeeId, 'allowances', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Overtime Pay
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.overtimePay}
                            onChange={(e) => handlePayrollItemChange(item.employeeId, 'overtimePay', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Bonus
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.bonus}
                            onChange={(e) => handlePayrollItemChange(item.employeeId, 'bonus', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-medium text-gray-700">Deductions</label>
                          <button
                            type="button"
                            onClick={() => addDeduction(item.employeeId)}
                            className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                          >
                            <FiPlus /> Add Deduction
                          </button>
                        </div>
                        {item.deductions.map((deduction, dedIndex) => (
                          <div key={dedIndex} className="flex gap-2 mb-2">
                            <select
                              value={deduction.deductionType}
                              onChange={(e) => handleDeductionChange(item.employeeId, dedIndex, 'deductionType', e.target.value)}
                              className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="TAX">Tax</option>
                              <option value="EPF">EPF</option>
                              <option value="INSURANCE">Insurance</option>
                              <option value="LOAN">Loan</option>
                              <option value="ADVANCE">Advance</option>
                              <option value="PENSION">Pension</option>
                              <option value="OTHER">Other</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Description"
                              value={deduction.description}
                              onChange={(e) => handleDeductionChange(item.employeeId, dedIndex, 'description', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Amount"
                              value={deduction.amount}
                              onChange={(e) => handleDeductionChange(item.employeeId, dedIndex, 'amount', e.target.value)}
                              className="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeDeduction(item.employeeId, dedIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Gross Pay:</span>
                          <span className="font-semibold">${calculateGrossPay(item).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Total Deductions:</span>
                          <span className="font-semibold text-red-600">-${calculateTotalDeductions(item).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-gray-300">
                          <span className="font-semibold text-gray-800">Net Pay:</span>
                          <span className="font-bold text-green-600">${calculateNetPay(item).toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {formData.payrollItems.length === 0 && (
            <p className="text-gray-500 text-center py-4">No employees found</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/app/payroll/all')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FiX /> Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || selectedEmployees.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <FiSave /> Create Payroll
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePayroll;
