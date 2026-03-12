import React, { useState } from "react";
import { FaUser, FaBuilding, FaUserTie } from "react-icons/fa";
import AddCustomerForm from "../customer/AddCustomer";
import AddSupplierForm from "../supplier/AddSupplierForm";
import AddEmployeeForm from "../Employee/AddEmployeeForm";

const PayerPayee = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("customer");
  const [formData, setFormData] = useState({
    customer: {
      name: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
    },
    supplier: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
    },
    employee: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      department: "",
    },
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      type: activeTab,
      ...formData[activeTab],
    };
    onSave(data);
    onClose();
  };

  const renderCustomerForm = () => (
    <div className="">
      <AddCustomerForm />
    </div>
  );

  const renderSupplierForm = () => (
    <div className="">
      <AddSupplierForm />
    </div>
  );

  const renderEmployeeForm = () => (
    <div className="">
      <AddEmployeeForm />
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl w-full overflow-hidden">
      <div className="flex justify-between items-center border-b p-4">
        <h2 className="text-xl font-semibold">Create New Payer/Payee</h2>
      </div>

      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => handleTabChange("customer")}
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === "customer" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <FaUser className="inline mr-2" />
            Customer
          </button>
          <button
            onClick={() => handleTabChange("supplier")}
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === "supplier" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <FaBuilding className="inline mr-2" />
            Supplier
          </button>
          <button
            onClick={() => handleTabChange("employee")}
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === "employee" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <FaUserTie className="inline mr-2" />
            Employee
          </button>
        </div>
      </div>

      <div className="">
        <form onSubmit={handleSubmit}>
          {activeTab === "customer" && renderCustomerForm()}
          {activeTab === "supplier" && renderSupplierForm()}
          {activeTab === "employee" && renderEmployeeForm()}
        </form>
      </div>
    </div>
  );
};

export default PayerPayee;
