import React, { useState, useEffect } from "react";
import { MdOutlineCancel, MdAddCircleOutline } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import AddAccountForm from "../account/AddAccountForm";
import NewProjectForm from "../projects/NewProjectForm";
import CreateItem from "../item/CreateItem";
import api from "../../utils/api";
import Alert from "../../components/Alert/Alert";
import { useNavigate } from "react-router-dom";
import { AccountContext, filterAccountsByContext } from "../../utils/accountFilters";

const CreateSaleOrder = () => {
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [rows, setRows] = useState([
    {
      itemId: "",
      description: "",
      account: "",
      quantity: "",
      unitPrice: "",
      discount: "",
      amount: "",
    },
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [soNumber, setSoNumber] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingItemsProjects, setIsLoadingItemsProjects] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalTransition, setModalTransition] = useState("opacity-0 invisible");
  const [accounts, setAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [freight, setFreight] = useState(0);
  const [tax, setTax] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [total, setTotal] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [paymentAccountCode, setPaymentAccountCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Calculate totals when relevant values change
  useEffect(() => {
    const newSubtotal = rows.reduce((sum, row) => {
      return sum + (parseFloat(row.amount) || 0);
    }, 0);
    setSubtotal(newSubtotal);

    const subtotalPlusFreight = newSubtotal + (parseFloat(freight) || 0);
    const newTax = subtotalPlusFreight * (parseFloat(taxPercent) / 100);
    setTax(newTax);

    const newTotal = subtotalPlusFreight + newTax;
    setTotal(newTotal);

    const newBalanceDue = Math.max(newTotal - (parseFloat(amountPaid) || 0), 0);
    setBalanceDue(newBalanceDue);
  }, [rows, freight, amountPaid, taxPercent]);

  useEffect(() => {
    if (showAccountModal || showProjectModal || showItemModal) {
      setModalTransition("opacity-100 visible");
    } else {
      setModalTransition("opacity-0 invisible");
    }
  }, [showAccountModal, showProjectModal, showItemModal]);

  const handleModalClick = (e, setModal) => {
    if (e.target === e.currentTarget) {
      setModal(false);
    }
  };

  // Fetch accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoadingAccounts(true);
        setAccountsError(null);

        const companyId = localStorage.getItem("companyId");
        if (!companyId) {
          throw new Error("Company ID not found in session storage");
        }

        const response = await api.get(`/api/companies/${companyId}/accounts`);
        let accountsData = response.data;

        if (Array.isArray(response)) {
          accountsData = response;
        } else if (Array.isArray(response.data)) {
          accountsData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          accountsData = response.data.data;
        }

        if (!Array.isArray(accountsData)) {
          throw new Error("Invalid accounts data format");
        }

        const formattedAccounts = accountsData.map((account) => ({
          id: account.id,
          name: `${account.accountCode} - ${account.accountName}`,
          accountType: account.accountType,
          currentBalance: account.currentBalance,
          accountCode: account.accountCode,
        }));

        setAccounts(formattedAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setAccountsError(error.message);
        setAccounts([]);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  // Fetch customers, items, projects, soNumber
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const companyId = localStorage.getItem("companyId");
        const token = localStorage.getItem("auth_token");
        if (!companyId || !token) return;

        setIsLoadingCustomers(true);
        const response = await fetch(`${api.defaults.baseURL}/api/customers/companies/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCustomers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    const fetchItemsAndProjects = async () => {
      try {
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return;

        setIsLoadingItemsProjects(true);
        const [itemsRes, projectsRes] = await Promise.all([
          api.get(`/api/companies/${companyId}/items`),
          api.get(`/api/companies/${companyId}/projects`)
        ]);

        let itemsData = itemsRes.data;
        if (Array.isArray(itemsRes)) itemsData = itemsRes;
        else if (Array.isArray(itemsRes.data)) itemsData = itemsRes.data;
        else if (itemsRes?.data?.data && Array.isArray(itemsRes.data.data)) itemsData = itemsRes.data.data;

        setItems(Array.isArray(itemsData) ? itemsData : []);

        let projectsData = projectsRes.data;
        if (Array.isArray(projectsRes)) projectsData = projectsRes;
        else if (Array.isArray(projectsRes.data)) projectsData = projectsRes.data;
        else if (projectsRes?.data?.data && Array.isArray(projectsRes.data.data)) projectsData = projectsRes.data.data;

        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (error) {
        console.error("Error fetching items and projects:", error);
      } finally {
        setIsLoadingItemsProjects(false);
      }
    };

    const fetchSoNumber = async () => {
      try {
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return;

        const response = await api.get(`/api/sales-orders/company/${companyId}/next-so-number`);
        if (response && response.data && response.data.soNumber) {
          setSoNumber(response.data.soNumber);
        } else if (response && response.soNumber) {
          setSoNumber(response.soNumber);
        }
      } catch (error) {
        console.error("Error fetching next SO number:", error);
      }
    };

    fetchCustomers();
    fetchItemsAndProjects();
    fetchSoNumber();
  }, []);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    // Auto-fill details when an item is selected
    if (field === "itemId" && value) {
      const selectedItem = items.find((item) => (item.id || item.itemId).toString() === value.toString());
      if (selectedItem) {
        updatedRows[index].description = selectedItem.description || selectedItem.name || "";
        // For sale, unitPrice is salesPrice
        updatedRows[index].unitPrice = selectedItem.salesPrice || "";
        // For sale, account is incomeAccount.id
        if (selectedItem.incomeAccount && selectedItem.incomeAccount.id) {
          updatedRows[index].account = selectedItem.incomeAccount.id.toString();
        } else {
          updatedRows[index].account = "";
        }
      }
    } else if (field === "itemId" && !value) {
      updatedRows[index].description = "";
      updatedRows[index].unitPrice = "";
      updatedRows[index].account = "";
    }

    if (
      !isServiceMode &&
      (field === "quantity" || field === "unitPrice" || field === "discount" || field === "itemId")
    ) {
      const quantity = parseFloat(updatedRows[index].quantity) || 0;
      const unitPrice = parseFloat(updatedRows[index].unitPrice) || 0;
      const discount = parseFloat(updatedRows[index].discount) || 0;

      const discountedAmount = unitPrice * (1 - discount / 100);
      updatedRows[index].amount = (quantity * discountedAmount).toFixed(2);
    }

    if (index === rows.length - 1 && value.trim() !== "" && field !== "project") {
      updatedRows.push({
        itemId: "",
        description: "",
        account: "",
        quantity: "",
        unitPrice: "",
        discount: "",
        amount: "",
      });
    }

    setRows(updatedRows);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!selectedCustomer) {
      Alert.error("Please select a customer.");
      return;
    }

    const companyId = localStorage.getItem("companyId");
    if (!companyId) {
      Alert.error("Company ID not found. Please log in again.");
      return;
    }

    // Filter out completely empty rows
    const validRows = rows.filter(
      (row) =>
        (isServiceMode || row.itemId) &&
        row.description &&
        row.account &&
        (!isServiceMode ? row.quantity && row.unitPrice : row.amount)
    );

    if (validRows.length === 0) {
      Alert.error("Please add at least one valid item/service row.");
      return;
    }

    const payload = {
      companyId: parseInt(companyId),
      customerId: parseInt(selectedCustomer),
      soNumber: soNumber,
      issueDate: issueDate,
      dueDate: dueDate || null,
      notes: notes,
      salesType: isServiceMode ? "SERVICE" : "ITEMS",
      amountPaid: parseFloat(amountPaid) || 0,
      paymentAccountCode: paymentAccountCode || null,
      freight: parseFloat(freight) || 0,
      taxPercent: parseFloat(taxPercent) || 0,
      taxAmount: parseFloat(tax) || 0, // In the UI, 'tax' is the calculated amount
      items: validRows.map((row) => ({
        itemId: isServiceMode ? null : parseInt(row.itemId),
        description: row.description,
        accountCode: accounts.find(a => a.id.toString() === row.account.toString())?.accountCode || "",
        quantity: isServiceMode ? 1 : parseInt(row.quantity),
        unitPrice: isServiceMode ? parseFloat(row.amount) : parseFloat(row.unitPrice),
        discountPercent: isServiceMode ? 0 : parseFloat(row.discount) || 0,
        projectId: row.project ? parseInt(row.project) : null,
        itemType: isServiceMode ? "SERVICE" : "GOODS"
      }))
    };

    setIsSubmitting(true);
    try {
      const response = await api.post(`/api/sales-orders/company/${companyId}`, payload);
      if (response.status === 201 || response.status === 200) {
        Alert.success("Sales order created successfully!");
        navigate("/account/app/sales"); // Replace with correct route
      }
    } catch (error) {
      console.error("Error creating sales order:", error);
      let errorMsg = "Failed to create sales order.";
      if (error.response?.data) {
        errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || errorMsg);
      }
      Alert.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 my-4 sm:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Create Sale Order
      </h2>

      {/* Customer and Sale Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            disabled={isLoadingCustomers}
          >
            <option value="">Select a customer</option>
            {isLoadingCustomers ? (
              <option value="">Loading customers...</option>
            ) : customers.length === 0 ? (
              <option value="">No customers available</option>
            ) : (
              customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            Sale Order Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-gray-100"
            placeholder="SO-00000001"
            value={soNumber}
            readOnly
          />
        </div>
      </div>

      {/* Sale Order Date and Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium">
            Order Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Items/Services Mode */}
      <div className="flex space-x-4 mb-6">
        <label className="flex items-center">
          <input
            type="radio"
            name="mode"
            value="item"
            checked={!isServiceMode}
            onChange={() => setIsServiceMode(false)}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Items</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="mode"
            value="service"
            checked={isServiceMode}
            onChange={() => setIsServiceMode(true)}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Services</span>
        </label>
      </div>

      {/* Items/Services Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              {!isServiceMode && (
                <th className="p-2">
                  Item ID <span className="text-red-500">*</span>
                  <button 
                    onClick={() => setShowItemModal(true)}
                    className="ml-1 text-blue-600 hover:text-blue-700"
                    title="Add New Item"
                  >
                    <MdAddCircleOutline className="h-5 w-5" />
                  </button>
                </th>
              )}
              <th className="p-2">
                Description <span className="text-red-500">*</span>
              </th>
              <th className="p-2">
                Account <span className="text-red-500">*</span>
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="ml-1 text-blue-600 hover:text-blue-700"
                >
                  <MdAddCircleOutline className="h-5 w-5" />
                </button>
              </th>
              {!isServiceMode && (
                <>
                  <th className="">
                    No of Units <span className="text-red-500">*</span>
                  </th>
                  <th className="p-2">
                    Unit Price <span className="text-red-500">*</span>
                  </th>
                  <th className="p-2">Discount (%)</th>
                </>
              )}
              <th className="p-2">
                Amount (Rs.) <span className="text-red-500">*</span>
              </th>
              <th className="p-2">
                Project
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="ml-1 text-blue-600 hover:text-blue-700"
                >
                  <MdAddCircleOutline className="h-5 w-5" />
                </button>
              </th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {!isServiceMode && (
                  <td className="p-2">
                    <select
                      value={row.itemId}
                      onChange={(e) =>
                        handleRowChange(index, "itemId", e.target.value)
                      }
                      className=" px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      disabled={isLoadingItemsProjects}
                    >
                      <option value="">Select Item</option>
                      {isLoadingItemsProjects ? (
                        <option value="">Loading items...</option>
                      ) : (
                        items
                          .filter((item) => item.incomeAccount != null)
                          .map((item) => (
                          <option key={item.id || item.itemId} value={item.id || item.itemId}>
                            {item.name}
                          </option>
                        ))
                      )}
                    </select>
                  </td>
                )}
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Description"
                    value={row.description}
                    onChange={(e) =>
                      handleRowChange(index, "description", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <select
                    value={row.account}
                    onChange={(e) =>
                      handleRowChange(index, "account", e.target.value)
                    }
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    disabled={isLoadingAccounts}
                  >
                    <option value="">Select Account</option>
                    {isLoadingAccounts ? (
                      <option value="">Loading accounts...</option>
                    ) : accountsError ? (
                      <option value="">Error loading accounts</option>
                    ) : accounts.length === 0 ? (
                      <option value="">No accounts available</option>
                    ) : (
                      filterAccountsByContext(accounts, AccountContext.SALES_ITEM_ACCOUNT).map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))
                    )}
                  </select>
                </td>
                {!isServiceMode && (
                  <>
                    <td className="p-2">
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        // placeholder="No of units"
                        value={row.quantity}
                        onChange={(e) =>
                          handleRowChange(index, "quantity", e.target.value)
                        }
                        min="0"
                        step="1"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        // placeholder="Unit price"
                        value={row.unitPrice}
                        onChange={(e) =>
                          handleRowChange(index, "unitPrice", e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        placeholder="(%)"
                        value={row.discount}
                        onChange={(e) =>
                          handleRowChange(index, "discount", e.target.value)
                        }
                        min="0"
                        max="100"
                        step="1"
                      />
                    </td>
                  </>
                )}
                <td className="p-2">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Amount (Rs.)"
                    value={row.amount}
                    onChange={(e) =>
                      handleRowChange(index, "amount", e.target.value)
                    }
                    readOnly={!isServiceMode}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={row.project}
                    onChange={(e) =>
                      handleRowChange(index, "project", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    disabled={isLoadingItemsProjects}
                  >
                    <option value="">Select project</option>
                    {isLoadingItemsProjects ? (
                      <option value="">Loading projects...</option>
                    ) : (
                      projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))
                    )}
                  </select>
                </td>
                <td className="p-2">
                  {index !== rows.length - 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdOutlineCancel className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes Section */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium">Notes</label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          rows={3}
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      {/* Financial Details */}
      <div className="flex flex-col items-end gap-4 mb-6">
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Subtotal:</span>
          <span className="text-gray-900">Rs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <label className="text-gray-700 font-medium">Freight (Rs.):</label>
          <input
            type="number"
            className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="0.00"
            value={freight}
            onChange={(e) => setFreight(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <label className="text-gray-700 font-medium">Cost of Tax (%):</label>
          <input
            type="number"
            className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="0"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
            min="0"
            max="100"
            step="0.01"
          />
        </div>
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Tax:</span>
          <span className="text-gray-900">Rs. {tax.toFixed(2)}</span>
        </div>
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Total:</span>
          <span className="text-gray-900">Rs. {total.toFixed(2)}</span>
        </div>
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <label className="text-gray-700 font-medium">Amount Paid (Rs.):</label>
          <input
            type="number"
            className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="0.00"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="w-full md:w-1/2 flex justify-between items-center mb-2">
          <label className="text-gray-700 font-medium">Payment Account:</label>
          <select
            className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={paymentAccountCode}
            onChange={(e) => setPaymentAccountCode(e.target.value)}
            disabled={isLoadingAccounts || parseFloat(amountPaid) <= 0}
          >
            <option value="">Select Account</option>
            {filterAccountsByContext(accounts, AccountContext.SALES_PAYMENT_ACCOUNT).map((account) => (
              <option key={account.id} value={account.accountCode}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Balance Due:</span>
          <span className="text-gray-900">Rs. {balanceDue.toFixed(2)}</span>
        </div>

        {balanceDue > 0 && (
          <div className="w-full md:w-1/2 flex justify-between items-center">
            <label className="block text-gray-700 font-medium">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        )}
      </div>

      {/* Save and Cancel Buttons */}
      <div className="flex justify-end space-x-2">
        {/* <button className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base">
          Cancel
        </button> */}
        <button
          className={`px-3 py-2 rounded-lg text-sm sm:text-base text-white ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>

      {showAccountModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowAccountModal)} // Close modal when clicking outside
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3  p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-black-600 text-xl"
              onClick={() => setShowAccountModal(false)}
            >
              <FaTimes />
            </button>
            <AddAccountForm />
          </div>
        </div>
      )}

      {showProjectModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowProjectModal)} // Close modal when clicking outside
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3  p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-black-600 text-xl"
              onClick={() => setShowProjectModal(false)}
            >
              <FaTimes />
            </button>
            <NewProjectForm />
          </div>
        </div>
      )}

      {showItemModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowItemModal)} // Close modal when clicking outside
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3  p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-1 hover:bg-gray-100 rounded-full transition-all"
               onClick={() => setShowItemModal(false)}
            >
               <FaTimes size={18} />
            </button>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
               <div className="p-1">
                  <CreateItem
                     isModal={true}
                     onSuccess={(newItem) => {
                        setItems(prev => [...prev, newItem]);
                        setShowItemModal(false);
                     }}
                  />
               </div>
            </div>
          </div>
        </div>
      )}
    </div>

    // Account Modal
  );
};
export default CreateSaleOrder;
