import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaTimes, FaUsers, FaSpinner } from "react-icons/fa";
import AddDepartmentForm from "../department/AddDepartmentForm";
import AddDesignationForm from "../department/AddDesignationForm";
import { apiUrl } from "../../utils/api";
import Alert from "../../components/Alert/Alert";

const AddEmployeeForm = ({ employeeToEdit = null, onSuccess, onCancel }) => {
  const isEditMode = !!employeeToEdit;

  const [formData, setFormData] = useState({
    firstName: employeeToEdit?.firstName || "",
    lastName: employeeToEdit?.lastName || "",
    gender: employeeToEdit?.gender || "",
    dob: employeeToEdit?.dob || "",
    epfNo: employeeToEdit?.epfNo || "",
    nic: employeeToEdit?.nic || "",
    mobileNo: employeeToEdit?.mobileNo || "",
    email: employeeToEdit?.email || "",
    address: employeeToEdit?.address || "",
    dateAdded: employeeToEdit?.dateAdded || new Date().toISOString().split("T")[0],
    designationId: employeeToEdit?.designation?.id || "",
    departmentId: employeeToEdit?.department?.id || "",
  });

  // Get company ID and token from session storage
  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("auth_token");
  console.log("Company ID:", token, companyId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(false);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [isAddingDesignation, setIsAddingDesignation] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [modalTransition, setModalTransition] = useState("opacity-0 invisible");

  useEffect(() => {
    if (showDesignationModal || showDepartmentModal) {
      setModalTransition("opacity-100 visible");
    } else {
      setModalTransition("opacity-0 invisible");
    }
  }, [showDesignationModal, showDepartmentModal]);

  // Updated fetchDepartments function using fetch with apiUrl
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!companyId || !token) {
        Alert.error("Authentication required. Please log in again.");
        return;
      }

      setIsLoadingDepartments(true);
      try {
        const response = await fetch(`${apiUrl}/api/${companyId}/departments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Departments API response:", data);

        // Handle different API response structures
        const departmentsData = data?.data || data || [];

        if (Array.isArray(departmentsData)) {
          setDepartments(departmentsData);

          if (formData.departmentId) {
            const selectedDept = departmentsData.find(d => d.id == formData.departmentId);
            if (selectedDept) {
              // Fetch designations for this department
              try {
                const desigRes = await fetch(
                  `${apiUrl}/api/${companyId}/designations/by-department/${selectedDept.code}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                if (desigRes.ok) {
                  const desigData = await desigRes.json();

                  let parsedDesigData;
                  if (Array.isArray(desigData)) {
                    parsedDesigData = desigData;
                  } else if (Array.isArray(desigData?.data)) {
                    parsedDesigData = desigData.data;
                  } else {
                    parsedDesigData = [];
                  }

                  setDesignations(parsedDesigData);
                }
              } catch (e) {
                console.error("Error pre-fetching designations:", e);
              }
            }
          }

        } else {
          console.error("Unexpected API response format", data);
          Alert.error("Unexpected data format received from server");
          setDepartments([]);
        }
      } catch (err) {
        Alert.error("Failed to load departments");
        console.error("API Error:", err);
        setDepartments([]);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [companyId, token]);

  // Updated fetchDesignationsByDepartment function using fetch with apiUrl
  const fetchDesignationsByDepartment = async (departmentId) => {
    if (!departmentId) {
      setDesignations([]);
      return;
    }

    setIsLoadingDesignations(true);
    try {
      const selectedDept = departments.find((dept) => dept.id == departmentId);
      if (!selectedDept) {
        throw new Error("Selected department not found");
      }
      if (!selectedDept.code) {
        throw new Error("Department code is missing");
      }

      console.log("Fetching designations for department:", {
        departmentId,
        departmentCode: selectedDept.code,
      });

      const response = await fetch(
        `${apiUrl}/api/${companyId}/designations/by-department/${selectedDept.code}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // First check for empty response (204 No Content)
      if (response.status === 204) {
        setDesignations([]);
        return;
      }

      // Check if response has content before parsing JSON
      const contentLength = response.headers.get("Content-Length");
      if (contentLength === "0") {
        setDesignations([]);
        return;
      }

      const data = await response.json();
      console.log("Designations API response:", data);

      let designationsData;

      if (Array.isArray(data)) {
        designationsData = data;
      } else if (Array.isArray(data?.data)) {
        designationsData = data.data;
      } else {
        console.error("Unexpected response structure:", data);
        throw new Error(
          `Invalid response structure. Received: ${JSON.stringify(data)}`
        );
      }

      if (!designationsData.every((item) => item.id && item.name)) {
        console.warn(
          "Some designations are missing required fields:",
          designationsData
        );
      }

      setDesignations(designationsData);
    } catch (error) {
      console.error("Error fetching designations:", error);

      // Only show alert for actual errors, not empty responses
      if (!error.message.includes("Unexpected end of JSON input")) {
        Alert.error("Failed to load designations");
      }
      setDesignations([]);
    } finally {
      setIsLoadingDesignations(false);
    }
  };

  const handleModalClick = (e, setModal) => {
    if (e.target === e.currentTarget) {
      setModal(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "departmentId") {
      await fetchDesignationsByDepartment(value);
      setFormData((prev) => ({ ...prev, designationId: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob || isNaN(new Date(formData.dob).getTime())) {
      newErrors.dob = "Invalid date of birth";
    }
    if (!formData.dateAdded || isNaN(new Date(formData.dateAdded).getTime())) {
      newErrors.dateAdded = "Invalid date added";
    }
    if (!formData.mobileNo.trim())
      newErrors.mobileNo = "Mobile number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.departmentId)
      newErrors.departmentId = "Department is required";
    if (!formData.designationId)
      newErrors.designationId =
        designations.length === 0
          ? "The selected department has no available designations"
          : "Designation is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const formatDate = (dateString) => {
        if (!dateString) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        designationId: formData.designationId
          ? Number(formData.designationId)
          : null,
        departmentId: formData.departmentId
          ? Number(formData.departmentId)
          : null,
        address: formData.address.trim(),
        mobileNo: formData.mobileNo.trim(),
        dob: formatDate(formData.dob),
        nic: formData.nic.trim(),
        epfNo: formData.epfNo.trim(),
        email: formData.email.trim().toLowerCase(),
        dateAdded: formatDate(formData.dateAdded) || formatDate(new Date()),
      };

      console.log("Submitting payload:", payload);

      const url = isEditMode
        ? `${apiUrl}/api/employees/${companyId}/${employeeToEdit.employeeId}`
        : `${apiUrl}/api/employees/${companyId}`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("API Response:", data);

      const employee = data?.employeeId ? data : data?.data;

      if (employee && employee.employeeId) {
        Alert.success(
          `Employee ${employee.firstName} ${employee.lastName} ${isEditMode ? "updated" : "created"} successfully!`,
          { autoClose: 5000 }
        );

        if (onSuccess) {
          onSuccess(employee);
        } else {
          // Clear form
          setFormData({
            firstName: "",
            lastName: "",
            gender: "",
            dob: "",
            epfNo: "",
            nic: "",
            mobileNo: "",
            email: "",
            address: "",
            dateAdded: new Date().toISOString().split("T")[0],
            designationId: "",
            departmentId: "",
          });
        }
      } else {
        console.error("Unexpected response format:", data);
        Alert.error(`Failed to ${isEditMode ? "update" : "create"} employee. Invalid response format.`);
      }
    } catch (error) {
      let errorMessage = `Failed to ${isEditMode ? "update" : "create"} employee.`;
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepartmentAdded = (newDepartment) => {
    // Add the new department to the list and select it
    setDepartments([...departments, newDepartment]);
    setFormData((prev) => ({ ...prev, departmentId: newDepartment.id }));
    setShowDepartmentModal(false);
  };

  const handleDesignationAdded = (newDesignation) => {
    // Add the new designation to the list and select it
    setDesignations([...designations, newDesignation]);
    setFormData((prev) => ({ ...prev, designationId: newDesignation.id }));
    setShowDesignationModal(false);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-7 flex flex-col ">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex justify-between">
          <span className="flex items-center">
            <FaUsers className="mr-2" />
            {isEditMode ? "Edit Employee" : "New Employee"}
          </span>
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          )}
        </h2>
        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-wrap -mx-2">
            {/* First Name */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName}</p>
              )}
            </div>

            {/* Gender */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm">{errors.gender}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.dob}
                onChange={(e) => {
                  // Ensure date is in YYYY-MM-DD format
                  const dateValue = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    dob: dateValue,
                  }));
                }}
                required
                max={new Date().toISOString().split("T")[0]} // Prevent future dates for DOB
              />
              {errors.dob && (
                <p className="text-red-500 text-sm">{errors.dob}</p>
              )}
            </div>

            {/* EPF No. */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">EPF No.</label>
              <input
                type="text"
                name="epfNo"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.epfNo}
                onChange={handleChange}
              />
            </div>

            {/* NIC No. */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">NIC No.</label>
              <input
                type="text"
                name="nic"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.nic}
                onChange={handleChange}
              />
            </div>

            {/* Mobile No. */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Mobile No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobileNo"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.mobileNo}
                onChange={handleChange}
              />
              {errors.mobileNo && (
                <p className="text-red-500 text-sm">{errors.mobileNo}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Address */}
            <div className="w-full px-2">
              <label className="block text-gray-700">Address</label>
              <textarea
                name="address"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Date Added */}
            <div className="w-full md:w-1/3 px-2">
              <label className="block text-gray-700">
                Date Added <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateAdded"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.dateAdded}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    dateAdded: dateValue,
                  }));
                }}
                max={new Date().toISOString().split("T")[0]} // Prevent future dates
              />
              {errors.dateAdded && (
                <p className="text-red-500 text-sm">{errors.dateAdded}</p>
              )}
            </div>
            {/* Department */}
            <div className="w-full md:w-1/3 px-2">
              <label className="block text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="departmentId"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={isLoadingDepartments}
                >
                  <option value="">--Choose a Department--</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {isLoadingDepartments && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaSpinner className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {errors.departmentId && (
                <p className="text-red-500 text-sm">{errors.departmentId}</p>
              )}
              <div className="text-center mt-2">
                <button
                  type="button"
                  className="text-blue-500 flex items-center justify-center"
                  onClick={() => setShowDepartmentModal(true)}
                >
                  <span className="mr-2">
                    <FaPlusCircle />
                  </span>
                  Add New Department
                </button>
              </div>
            </div>

            {/* Designation */}
            <div className="w-full md:w-1/3 px-2">
              <label className="block text-gray-700">
                Designation <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="designationId"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.designationId}
                  onChange={handleChange}
                  disabled={!formData.departmentId || isLoadingDesignations}
                >
                  <option value="">--Choose a Designation--</option>
                  {designations.map((desig) => (
                    <option key={desig.id} value={desig.id}>
                      {desig.name}
                    </option>
                  ))}
                </select>
                {isLoadingDesignations && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaSpinner className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {errors.designationId && (
                <p className="text-red-500 text-sm">{errors.designationId}</p>
              )}
              <div className="text-center mt-2">
                <button
                  type="button"
                  className={`text-blue-500 flex items-center justify-center ${!formData.departmentId
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                    }`}
                  onClick={() => setShowDesignationModal(true)}
                  disabled={!formData.departmentId}
                >
                  <span className="mr-2">
                    <FaPlusCircle />
                  </span>
                  Add New Designation
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                isEditMode ? "Update" : "Save"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Department Modal */}
      {showDepartmentModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowDepartmentModal)}
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-600 text-xl"
              onClick={() => setShowDepartmentModal(false)}
              disabled={isAddingDepartment}
            >
              <FaTimes />
            </button>
            <div className="p-4">
              <AddDepartmentForm
                companyId={companyId}
                onSuccess={handleDepartmentAdded}
                onClose={() => setShowDepartmentModal(false)}
              />
              {isAddingDepartment && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin mr-2 text-blue-500" />
                    <span>Saving department...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesignationModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowDesignationModal)}
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-600 text-xl"
              onClick={() => setShowDesignationModal(false)}
              disabled={isAddingDesignation}
            >
              <FaTimes />
            </button>
            <div className="p-4">
              <AddDesignationForm
                companyId={companyId}
                departmentId={formData.departmentId}
                onSuccess={handleDesignationAdded}
                onClose={() => setShowDesignationModal(false)}
              />
              {isAddingDesignation && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin mr-2 text-blue-500" />
                    <span>Saving designation...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployeeForm;
