import React, { useState } from "react";
import api from "../../utils/api";
import Alert from "../../components/Alert/Alert";

const AddDepartmentForm = ({ onSuccess }) => {
  // Get company ID and token from session storage
  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");

  const [formData, setFormData] = useState({
    name: "",
    code: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (networkError) {
      setNetworkError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Department Name is required";
    if (!formData.code.trim()) newErrors.code = "Department Code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setNetworkError(null);
    
    try {
      const response = await api.post(
        `/api/${companyId}/departments`,
        {
          name: formData.name.trim(),
          code: formData.code.trim()
        }
      );

      // Use department name from response in success message
      Alert.success(`Department "${response.name}" added successfully!`);
      
      // Reset form
      setFormData({
        name: "",
        code: ""
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response);
      }
      
    } catch (err) {
      // Handle different types of errors
      if (err.message === "Network Error") {
        setNetworkError("Unable to connect to server. Please check your internet connection.");
      } else if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || 
                           err.response.data?.error ||
                           "Failed to add department. Please try again.";
        Alert.error(errorMessage);
        
        // Handle field-specific errors from API if available
        if (err.response.data?.errors) {
          setErrors(err.response.data.errors);
        }
      } else {
        // Other errors (timeout, etc.)
        setNetworkError("An unexpected error occurred. Please try again later.");
      }
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-7 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Add Department
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">
              Department Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.code}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.code && (
              <p className="text-red-500 text-sm">{errors.code}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
    </div>
  );
};

export default AddDepartmentForm;
