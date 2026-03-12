import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaTimes } from "react-icons/fa";

import api from "../../utils/api";
import Alert from "../Alert/Alert";
import AddCustomerForm from "../customer/AddCustomer";

const NewProjectForm = () => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [modalTransition, setModalTransition] = useState("opacity-0 invisible");

  // Form fields
  const [projectCode, setProjectCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [workingStatus, setWorkingStatus] = useState("ACTIVE");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [totalCost, setTotalCost] = useState("");

  // Data from API
  const [customers, setCustomers] = useState([]);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const companyId = localStorage.getItem("companyId");

  // Fetch auto-generated project code from backend on mount
  const fetchNextCode = async () => {
    try {
      setIsLoadingCode(true);
      const response = await api.get(`/api/companies/${companyId}/projects/next-code`);
      const data = response.data || response;
      setProjectCode(data.code || "");
    } catch (error) {
      console.error("Error fetching project code:", error);
      Alert.error("Could not auto-generate project code.");
    } finally {
      setIsLoadingCode(false);
    }
  };

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/api/customers/companies/${companyId}`);
      const data = response.data || response || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    fetchNextCode();
    fetchCustomers();
  }, []);

  // Modal fade transition
  useEffect(() => {
    if (showCustomerModal) {
      setModalTransition("opacity-100 visible");
    } else {
      setModalTransition("opacity-0 invisible");
    }
  }, [showCustomerModal]);

  // Handle form submission → POST to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectCode.trim()) {
      Alert.error("Project code is required.");
      return;
    }
    if (!projectName.trim()) {
      Alert.error("Project name is required.");
      return;
    }

    try {
      setIsSaving(true);
      await api.post(`/api/companies/${companyId}/projects`, {
        code: projectCode.trim(),
        name: projectName.trim(),
        startDate: startDate,
        description: description.trim(),
        workingStatus: workingStatus,
        priority: priority,
        customerId: selectedCustomer ? parseInt(selectedCustomer) : null,
        totalCost: totalCost ? parseInt(totalCost) : null,
      });

      Alert.success("Project created successfully!");

      // Reset form and get new code
      setProjectName("");
      setSelectedCustomer("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setWorkingStatus("ACTIVE");
      setPriority("MEDIUM");
      setDescription("");
      setTotalCost("");
      await fetchNextCode(); // Get next auto-code
    } catch (error) {
      console.error("Error creating project:", error);
      const msg = error.response?.data?.error || error.response?.data?.message || "Failed to create project.";
      Alert.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // After adding a new customer via modal, refresh the list
  const handleCustomerAdded = () => {
    setShowCustomerModal(false);
    fetchCustomers();
  };

  const workingStatusOptions = [
    { id: "ACTIVE", name: "Active" },
    { id: "WORKING", name: "Working" },
    { id: "COMPLETED", name: "Completed" },
    { id: "CANCELLED", name: "Cancelled" },
  ];

  const priorityOptions = [
    { id: "LOW", name: "Low" },
    { id: "MEDIUM", name: "Medium" },
    { id: "HIGH", name: "High" },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 my-4 sm:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Create Project
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Row 1: Project Code (auto) + Project Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Project Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={isLoadingCode ? "Generating..." : projectCode}
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 font-mono text-sm sm:text-base cursor-not-allowed text-gray-700"
              placeholder="PRJ-00001"
              required
              readOnly
            />
            <p className="text-xs text-gray-400 mt-1">Auto-generated. Cannot be changed.</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter Project Name"
              required
            />
          </div>
        </div>

        {/* Row 2: Customer + Start Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Customer
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">Select a customer (optional)</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-blue-500 flex items-center gap-1 mt-2 text-sm hover:underline"
              onClick={() => setShowCustomerModal(true)}
            >
              <FaPlusCircle /> Add New Customer
            </button>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        {/* Row 3: Working Status + Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Working Status <span className="text-red-500">*</span>
            </label>
            <select
              value={workingStatus}
              onChange={(e) => setWorkingStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            >
              {workingStatusOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            >
              {priorityOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Description + Total Cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Project description (optional)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Total Cost (Rs.)
            </label>
            <input
              type="number"
              min="0"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="0"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => {
              setProjectName("");
              setSelectedCustomer("");
              setDescription("");
              setTotalCost("");
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base transition disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Project"}
          </button>
        </div>
      </form>

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCustomerModal(false);
          }}
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-600 text-xl z-10"
              onClick={() => setShowCustomerModal(false)}
            >
              <FaTimes />
            </button>
            <AddCustomerForm onSuccess={handleCustomerAdded} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewProjectForm;