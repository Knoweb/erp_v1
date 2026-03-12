import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import AddEmployeeForm from "../Employee/AddEmployeeForm";

import { apiUrl } from "../../utils/api";
import Alert from "../../components/Alert/Alert";

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    designation: "",
    department: "",
    mobileNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    employee: "",
    role: "USER"
  });

  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTransition, setModalTransition] = useState("opacity-0 invisible");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (showModal) {
      setModalTransition("opacity-100 visible");
      document.body.style.overflow = "hidden";
    } else {
      setModalTransition("opacity-0 invisible");
      document.body.style.overflow = "auto";
    }
  }, [showModal]);

  const loadEmployees = async () => {
    if (!companyId || !token) return;
    try {
      const response = await fetch(`${apiUrl}/api/employees/${companyId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [companyId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "employee") {
      const selectedEmp = employees.find(emp => emp.employeeId.toString() === value);
      if (selectedEmp) {
        setFormData({
          ...formData,
          employee: value,
          email: selectedEmp.email || "",
          mobileNo: selectedEmp.mobileNo || "",
          designation: selectedEmp.designation?.name || "",
          department: selectedEmp.department?.name || ""
        });
      } else {
        setFormData({
          ...formData,
          employee: "",
          email: "",
          mobileNo: "",
          designation: "",
          department: ""
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.role) {
      Alert.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 7) {
      Alert.error("Password must be at least 7 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/users/${companyId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      if (response.ok) {
        Alert.success("User created successfully!");
        setFormData({
          designation: "",
          department: "",
          mobileNo: "",
          email: "",
          password: "",
          confirmPassword: "",
          employee: "",
          role: "USER"
        });
      } else {
        const errorData = await response.json();
        Alert.error(errorData.error || "Failed to create user");
      }
    } catch (err) {
      Alert.error("Error creating user");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md sm:max-w-2xl bg-white rounded-lg shadow-md p-7">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign User</h2>
        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
          {/* Employee Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employee"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.employee}
                onChange={handleChange}
              >
                <option value="">Select an Employee</option>
                {employees.map(emp => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              {errors.employee && (
                <p className="text-red-500 text-sm">{errors.employee}</p>
              )}
              <div className="text-center mt-2">
                <button
                  type="button"
                  className="text-blue-500 flex items-center justify-center hover:underline"
                  onClick={() => setShowModal(true)}
                >
                  <span className="mr-2">
                    <FaPlusCircle />
                  </span>
                  Add Employee
                </button>
              </div>
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-gray-700">
                Assign Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="USER">USER</option>
                <option value="COMPANY">COMPANY (Admin)</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Fields in Two Columns on Large Screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Field */}
            <div>
              <label className="block text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label className="block text-gray-700">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobileNo"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mobile number"
                value={formData.mobileNo}
                onChange={handleChange}
                readOnly
              />
              {errors.mobileNo && (
                <p className="text-red-500 text-sm">{errors.mobileNo}</p>
              )}
            </div>

            {/* Designation Field */}
            <div>
              <label className="block text-gray-700">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter designation"
                value={formData.designation}
                onChange={handleChange}
                readOnly
              />
              {errors.designation && (
                <p className="text-red-500 text-sm">{errors.designation}</p>
              )}
            </div>

            {/* Department Field */}
            <div>
              <label className="block text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="department"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department"
                value={formData.department}
                onChange={handleChange}
                readOnly
              />
              {errors.department && (
                <p className="text-red-500 text-sm">{errors.department}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="w-full">
              <label className="block text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center w-full border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="flex-1 px-4 py-2 rounded-lg outline-none"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="p-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="w-full">
              <label className="block text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center w-full border rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="flex-1 px-4 py-2 rounded-lg outline-none"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="p-2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 px-6 py-2 rounded-lg text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save User"}
          </button>
        </form>
      </div>

      {/* Modal for Adding Employee */}
      {showModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={handleModalClick} // Close modal when clicking outside
        >
          <div className="modal-content relative overflow-auto max-h-screen rounded-lg ">
            <button
              className="absolute top-2 right-2 text-black-600 text-xl"
              onClick={() => setShowModal(false)}
            >
              <FaTimes />
            </button>
            <AddEmployeeForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUserForm;
