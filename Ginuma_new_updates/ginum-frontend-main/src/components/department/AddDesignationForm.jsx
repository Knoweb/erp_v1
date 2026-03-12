import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaTimes } from "react-icons/fa";
import AddDepartmentForm from "./AddDepartmentForm";
import api from "../../utils/api";
import Alert from "../../components/Alert/Alert";

const AddDesignationForm = () => {
  // State for form fields
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [designationName, setDesignationName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDepartments, setIsFetchingDepartments] = useState(false);
  const [modalTransition, setModalTransition] = useState("opacity-100");

  // Get company ID and token from session storage
  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  // Handle modal click outside
  const handleModalClick = (e, closeFunction) => {
    if (e.target === e.currentTarget) {
      setModalTransition("opacity-0");
      setTimeout(() => closeFunction(false), 300);
    }
  };

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!companyId || !token) {
        Alert.error("Authentication required. Please log in again.");
        return;
      }

      setIsFetchingDepartments(true);
      try {
        const response = await api.get(`/api/${companyId}/departments`, {  // Fixed typo: 'departments' not 'departments'
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Departments API response:", response);
        
        // Handle API response structure
        const departmentsData = response.data?.data || response.data || response;
        
        if (Array.isArray(departmentsData)) {
          setDepartments(departmentsData);
        } else {
          console.error("Unexpected API response format", response);
          Alert.error("Unexpected data format received from server");
        }
      } catch (err) {
        Alert.error("Failed to load departments");
        console.error("API Error:", err);
      } finally {
        setIsFetchingDepartments(false);
      }
    };

    fetchDepartments();
  }, [companyId, token]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check authentication
    if (!companyId || !token) {
      Alert.error("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);

    // Validation
    const validationErrors = {};
    if (!selectedDepartment) {
      validationErrors.department = "Department is required";
    }
    if (!designationName.trim()) {
      validationErrors.designationName = "Designation Name is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Find the selected department to get its code
      const department = departments.find(
        (dept) => dept.id == selectedDepartment  // Use == for loose comparison in case types differ
      );

      if (!department) {
        throw new Error("Selected department not found");
      }

      // Prepare request payload
      const payload = {
        name: designationName.trim(),
        departmentCode: department.code
      };

      // Submit to API
      const response = await api.post(
        `/api/${companyId}/designations`,
        payload,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle success
      Alert.success(`Designation "${payload.name}" added successfully!`);
      
      // Reset form
      setSelectedDepartment("");
      setDesignationName("");
      setErrors({});
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to add designation. Please try again.";
      Alert.error(errorMessage);
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new department addition from modal
  const handleNewDepartment = (newDepartment) => {
    setDepartments((prev) => [...prev, newDepartment]);
    setSelectedDepartment(newDepartment.id);
    setShowDepartmentModal(false);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-7 flex flex-col ">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Add Designation
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Department Dropdown */}

           <div className="w-full px-2">
            <label className="block text-gray-700">
              Department <span className="text-red-500">*</span>
            </label>

            {isFetchingDepartments ? (
              <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 animate-pulse">
                Loading departments...
              </div>
            ) : (
              <>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select Department</option>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No departments available
                    </option>
                  )}
                </select>
                {errors.department && (
                  <p className="text-red-500 text-sm">{errors.department}</p>
                )}
                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="text-blue-500 flex items-center justify-center"
                    onClick={() => setShowDepartmentModal(true)}
                  >
                    <span className="mr-2">
                      <FaPlusCircle />
                    </span>{" "}
                    Add New Department
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Designation Name Field */}

          <div className="w-full px-2">
            <label className="block text-gray-700">
              Designation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.designationName ? "border-red-500" : "border-gray-300"
              }`}
              value={designationName}
              onChange={(e) => setDesignationName(e.target.value)}
              disabled={isLoading}
              placeholder="Enter designation name"
            />
            {errors.designationName && (
              <p className="text-red-500 text-sm">{errors.designationName}</p>
            )}
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </form>
      </div>

      {/* Department Modal */}
      {showDepartmentModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowDepartmentModal)} // Close modal when clicking outside
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3  p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-black-600 text-xl"
              onClick={() => setShowDepartmentModal(false)}
            >
              <FaTimes />
            </button>
            <AddDepartmentForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDesignationForm;
