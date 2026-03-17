import React, { useState, useEffect } from "react";
import { MdOutlineCancel, MdAddCircleOutline } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import AddAccountForm from "../account/AddAccountForm";
import NewProjectForm from "../projects/NewProjectForm";
import CreateItem from "../item/CreateItem";
import api from "../../utils/api";
import { AccountContext, filterAccountsByContext } from "../../utils/accountFilters";

const CreatePurchase = () => {
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [rows, setRows] = useState([
    {
      itemId: "",
      description: "",
      account: "",
      noOfUnits: "",
      unitPrice: "",
      discount: "",
      amount: "",
      project: "",
    },
  ]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [modalTransition, setModalTransition] = useState("opacity-0 invisible");
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [suppliersError, setSuppliersError] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  const [items, setItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [freight, setFreight] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (showAccountModal || showProjectModal || showItemModal) {
      // Fade in when modal is opened
      setModalTransition("opacity-100 visible");
    } else {
      // Fade out when modal is closed
      setModalTransition("opacity-0 invisible");
    }
  }, [showAccountModal, showProjectModal, showItemModal]);

  // Calculate totals when relevant values change
  useEffect(() => {
    const newSubtotal = rows.reduce((sum, row) => {
      return sum + (parseFloat(row.amount) || 0);
    }, 0);
    setSubtotal(newSubtotal);

    const newTax = newSubtotal * 0; // 0.1 == 10% tax - adjust as needed
    setTax(newTax);

    const newTotal = newSubtotal + (parseFloat(freight) || 0) + newTax;
    setTotal(newTotal);

    const newBalanceDue = Math.max(newTotal - (parseFloat(amountPaid) || 0), 0);
    setBalanceDue(newBalanceDue);
  }, [rows, freight, amountPaid]);

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

    const fetchSuppliers = async () => {
      try {
        setIsLoadingSuppliers(true);
        setSuppliersError(null);
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return;

        const data = await api.get(`/api/ginuma/suppliers/companies/${companyId}`);
        setSuppliers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setSuppliersError(error.message);
        setSuppliers([]);
      } finally {
        setIsLoadingSuppliers(false);
      }
    };

    const fetchItemsAndProjects = async () => {
      try {
        setIsLoadingItems(true);
        setIsLoadingProjects(true);
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return;

        const [itemsRes, projectsRes] = await Promise.all([
          api.get(`/api/companies/${companyId}/items`).catch(() => []),
          api.get(`/api/companies/${companyId}/projects`).catch(() => [])
        ]);

        setItems(Array.isArray(itemsRes) ? itemsRes : []);
        setProjects(Array.isArray(projectsRes) ? projectsRes : []);
      } catch (error) {
        console.error("Error fetching items or projects:", error);
      } finally {
        setIsLoadingItems(false);
        setIsLoadingProjects(false);
      }
    };

    const fetchPoNumber = async () => {
      try {
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return;

        const response = await api.get(`/api/${companyId}/purchase-orders/next-po-number`);
        if (response && response.poNumber) {
          setPoNumber(response.poNumber);
        }
      } catch (error) {
        console.error("Error fetching next PO number:", error);
      }
    };

    fetchAccounts();
    fetchSuppliers();
    fetchItemsAndProjects();
    fetchPoNumber();
  }, []);


  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    // Auto-fill details when an item is selected
    if (field === "itemId" && value) {
      const selectedItem = items.find((item) => (item.id || item.itemId).toString() === value.toString());
      if (selectedItem) {
        updatedRows[index].description = selectedItem.description || selectedItem.name || "";
        updatedRows[index].unitPrice = selectedItem.purchasePrice || "";
        if (selectedItem.expenseAccount && selectedItem.expenseAccount.id) {
          updatedRows[index].account = selectedItem.expenseAccount.id.toString();
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

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 my-4 sm:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Create Purchase Order
      </h2>

      {/* Supplier and Purchase Order Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium">
            Supplier <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            disabled={isLoadingSuppliers}
          >
            <option value="">Select a supplier</option>
            {isLoadingSuppliers ? (
              <option value="">Loading suppliers...</option>
            ) : suppliersError ? (
              <option value="">Error loading suppliers</option>
            ) : suppliers.length === 0 ? (
              <option value="">No suppliers available</option>
            ) : (
              suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierName}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            Purchase Order Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-gray-100"
            placeholder="00000001"
            value={poNumber}
            readOnly
          />
        </div>
      </div>

      {/* Supplier Invoice Number and ATO Checkbox */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium">
            Supplier Invoice Number
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Supplier Invoice Number"
            value={supplierInvoiceNumber}
            onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            Issue Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            defaultValue={new Date().toISOString().split('T')[0]}
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
                  <th className="p-2">
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
                      disabled={isLoadingItems}
                    >
                      <option value="">Select Item</option>
                      {!isLoadingItems && items
                        .filter(item => item.expenseAccount != null)
                        .map((item) => (
                        <option key={item.id || item.itemId} value={item.id || item.itemId}>
                          {item.name}
                        </option>
                      ))}
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
                      filterAccountsByContext(accounts, AccountContext.PURCHASE_ITEM_ACCOUNT).map((account) => (
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
                    disabled={isLoadingProjects}
                  >
                    <option value="">Select project</option>
                    {!isLoadingProjects && projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
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
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Balance Due:</span>
          <span className="text-gray-900">Rs. {balanceDue.toFixed(2)}</span>
        </div>
        {balanceDue > 0 && (
          <div className="w-full md:w-1/2 flex justify-between items-center">
            <label className="block text-gray-700 font-medium">
              Promised Date : <span className="text-red-500">*</span>
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
        <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base">
          Save
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
  );
};

export default CreatePurchase;
