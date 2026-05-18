import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineCancel, MdAddCircleOutline } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import AddAccountForm from "../account/AddAccountForm";
import NewProjectForm from "../projects/NewProjectForm";
import CreateItem from "../item/CreateItem";
import api from "../../utils/api";
import Alert from "../../components/Alert/Alert";
import { AccountContext, filterAccountsByContext } from "../../utils/accountFilters";
import { fetchCompanySuppliers } from "../../utils/supplierApi";

const CreatePurchase = () => {
  const [isServiceMode, setIsServiceMode] = useState(false);
  const createEmptyRow = () => ({
    itemId: "",
    description: "",
    account: "",
    quantity: "",
    unitPrice: "",
    discount: "",
    amount: "",
    project: "",
  });
  const [rows, setRows] = useState([createEmptyRow()]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [referencePoNumber, setReferencePoNumber] = useState("");
  const [selectedReferencePo, setSelectedReferencePo] = useState("");
  const [manualReferencePoNumber, setManualReferencePoNumber] = useState("");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [modalTransition, setModalTransition] = useState("opacity-0 invisible");
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [suppliersError, setSuppliersError] = useState(null);
  const [availablePos, setAvailablePos] = useState([]);
  const [isFetchingPos, setIsFetchingPos] = useState(false);
  const [posError, setPosError] = useState(null);
  const [selectedPoProjectedTotal, setSelectedPoProjectedTotal] = useState(null);
  const [selectedPoItems, setSelectedPoItems] = useState([]);

  const [accounts, setAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  const [items, setItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [freight, setFreight] = useState(0);
  const [taxes, setTaxes] = useState([]);
  const [total, setTotal] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [paymentAccountCode, setPaymentAccountCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (showAccountModal || showProjectModal || showItemModal) {
      // Fade in when modal is opened
      setModalTransition("opacity-100 visible");
    } else {
      // Fade out when modal is closed
      setModalTransition("opacity-0 invisible");
    }
  }, [showAccountModal, showProjectModal, showItemModal]);

  useEffect(() => {
    const fetchApprovedPos = async () => {
      const supplierId = selectedSupplier;

      setAvailablePos([]);
      setSelectedReferencePo("");
      setReferencePoNumber(manualReferencePoNumber);
      setSelectedPoProjectedTotal(null);
      setSelectedPoItems([]);
      setRows([createEmptyRow()]);
      setPosError(null);

      if (!supplierId) {
        return;
      }

      try {
        setIsFetchingPos(true);
        const data = await api.get(`/api/finance/external/inventory-pos/${supplierId}`);
        const posList = Array.isArray(data) ? data : [];
        setAvailablePos(posList);
      } catch (error) {
        console.error("Error fetching approved purchase orders:", error);
        setPosError(error.response?.data?.message || error.message || "Failed to load approved purchase orders");
      } finally {
        setIsFetchingPos(false);
      }
    };

    fetchApprovedPos();
  }, [selectedSupplier]);

  // Calculate totals when relevant values change
  useEffect(() => {
    const manualSubtotal = rows.reduce((sum, row) => {
      return sum + (parseFloat(row.amount) || 0);
    }, 0);

    const newSubtotal = selectedPoProjectedTotal !== null
      ? Number(selectedPoProjectedTotal) || 0
      : manualSubtotal;

    setSubtotal(newSubtotal);

    const subtotalPlusFreight = newSubtotal + (parseFloat(freight) || 0);
    
    let totalTaxAmount = 0;
    const updatedTaxes = taxes.map(t => {
      const pct = parseFloat(t.percentage) || 0;
      const amt = subtotalPlusFreight * (pct / 100);
      totalTaxAmount += amt;
      // We don't put it in state here to avoid infinite loop, just sum it up
      return amt;
    });

    const newTotal = subtotalPlusFreight + totalTaxAmount;
    setTotal(newTotal);

    const newBalanceDue = Math.max(newTotal - (parseFloat(amountPaid) || 0), 0);
    setBalanceDue(newBalanceDue);
  }, [rows, freight, amountPaid, taxes, selectedPoProjectedTotal]);

  const handleAddTax = () => {
    setTaxes([...taxes, { taxType: "VAT", percentage: 0, amount: 0 }]);
  };

  const handleRemoveTax = (index) => {
    const newTaxes = taxes.filter((_, i) => i !== index);
    setTaxes(newTaxes);
  };

  const handleTaxChange = (index, field, value) => {
    const newTaxes = [...taxes];
    newTaxes[index][field] = value;
    // Calculate amount on the fly when percentage changes
    if (field === 'percentage') {
      const subtotalPlusFreight = subtotal + (parseFloat(freight) || 0);
      newTaxes[index].amount = subtotalPlusFreight * (parseFloat(value) || 0) / 100;
    }
    setTaxes(newTaxes);
  };

  const handleReferencePoChange = (value) => {
    setSelectedReferencePo(value);

    if (!value) {
      setSelectedPoProjectedTotal(null);
      setSelectedPoItems([]);
      setReferencePoNumber(manualReferencePoNumber);
      setRows([createEmptyRow()]);
      return;
    }

    const selectedPo = availablePos.find((po) => {
      const displayNumber = getPoDisplayNumber(po);
      return po.poNumber === value || displayNumber === value || po.id?.toString() === value.toString();
    });
    if (selectedPo) {
      const projectedTotal = Number(selectedPo.projectedTotal) || 0;
      setReferencePoNumber(getPoDisplayNumber(selectedPo));
      setSelectedPoProjectedTotal(projectedTotal);
      setManualReferencePoNumber("");

      const poItems = Array.isArray(selectedPo.items) ? selectedPo.items : [];
      if (poItems.length === 0) {
        setSelectedPoItems([]);
        setRows([createEmptyRow()]);
        return;
      }

      const normalizedPoItems = poItems.map((poItem) => {
        const itemKey = poItem.productId || poItem.itemId || "";
        const matchedItem = items.find(
          (item) => (item.id || item.itemId).toString() === itemKey.toString()
        );
        const quantity = Number(poItem.quantity) || 0;
        const unitPrice = Number(poItem.unitPrice || poItem.price) || 0;
        const discount = Number(poItem.discount) || 0;

        return {
          itemId: itemKey,
          description: poItem.description || matchedItem?.description || matchedItem?.name || "",
          account: matchedItem?.expenseAccount?.id?.toString() || "",
          quantity: quantity ? quantity.toString() : "",
          unitPrice: unitPrice ? unitPrice.toString() : "",
          discount: discount ? discount.toString() : "0",
          amount: (quantity * unitPrice * (1 - discount / 100)).toFixed(2),
          project: "",
        };
      });

      setSelectedPoItems(normalizedPoItems);
      setRows([...normalizedPoItems, createEmptyRow()]);
    }
  };

  const handleManualReferencePoChange = (value) => {
    setManualReferencePoNumber(value);
    if (value.trim()) {
      setReferencePoNumber(value);
      return;
    }

    if (selectedReferencePo) {
      setReferencePoNumber(selectedReferencePo);
      return;
    }

    setReferencePoNumber("");
  };

  const getPoDisplayNumber = (po) => {
    if (po?.poNumber) {
      return po.poNumber;
    }

    if (po?.id) {
      return `PO-${String(po.id).padStart(3, "0")}`;
    }

    return "PO-UNKNOWN";
  };

  const resolveItemDetails = (itemId) => {
    const poItem = selectedPoItems.find((item) => item.itemId.toString() === itemId.toString());
    if (poItem) {
      return poItem;
    }

    const masterItem = items.find((item) => (item.id || item.itemId).toString() === itemId.toString());
    if (!masterItem) {
      return null;
    }

    return {
      itemId,
      description: masterItem.description || masterItem.name || "",
      account: masterItem.expenseAccount?.id?.toString() || "",
      quantity: "",
      unitPrice: masterItem.purchasePrice || "",
      discount: "0",
      amount: "",
      project: "",
    };
  };

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

        const token = localStorage.getItem("auth_token");
        const data = await fetchCompanySuppliers(companyId, token);
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

    const fetchPoAndInvoiceNumber = async () => {
      try {
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return;

        const [poRes, invRes] = await Promise.all([
          api.get(`/api/${companyId}/purchase-orders/next-po-number`),
          api.get(`/api/${companyId}/purchase-orders/next-invoice-number`)
        ]);

        if (poRes && poRes.poNumber) {
          setReferencePoNumber(poRes.poNumber);
        }
        if (invRes && invRes.invoiceNumber) {
          setSupplierInvoiceNumber(invRes.invoiceNumber);
        }
      } catch (error) {
        console.error("Error fetching next PO or Invoice number:", error);
      }
    };

    fetchAccounts();
    fetchSuppliers();
    fetchItemsAndProjects();
    fetchPoAndInvoiceNumber();
  }, []);


  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    // Auto-fill details when an item is selected
    if (field === "itemId" && value) {
      const selectedItem = resolveItemDetails(value);
      if (selectedItem) {
        updatedRows[index].description = selectedItem.description || "";
        updatedRows[index].quantity = selectedItem.quantity || updatedRows[index].quantity || "";
        updatedRows[index].unitPrice = selectedItem.unitPrice || updatedRows[index].unitPrice || "";
        updatedRows[index].account = selectedItem.account || "";
      }
    } else if (field === "itemId" && !value) {
      updatedRows[index].description = "";
      updatedRows[index].unitPrice = "";
      updatedRows[index].account = "";
      updatedRows[index].quantity = "";
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

    if (index === rows.length - 1 && value.toString().trim() !== "" && field !== "project") {
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

  const handleSubmit = async () => {
    if (!selectedSupplier) {
      Alert.error("Please select a supplier");
      return;
    }
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    const validRows = rows.filter(
      (row) =>
        (isServiceMode || row.itemId) &&
        row.description &&
        row.account &&
        (!isServiceMode ? row.quantity && row.unitPrice : row.amount)
    );

    if (validRows.length === 0) {
      Alert.error("Please add at least one valid row");
      return;
    }

    const payload = {
      supplierId: parseInt(selectedSupplier),
      poNumber: referencePoNumber,
      supplierInvoiceNumber: supplierInvoiceNumber,
      issueDate: issueDate,
      dueDate: dueDate || null,
      notes: notes,
      purchaseType: isServiceMode ? "SERVICE" : "ITEM",
      amountPaid: parseFloat(amountPaid) || 0,
      paymentAccountCode: paymentAccountCode || null,
      freight: parseFloat(freight) || 0,
        taxBreakdown: taxes.map(t => ({
          taxType: t.taxType,
          percentage: parseFloat(t.percentage) || 0,
          amount: parseFloat(t.amount) || ((subtotal + parseFloat(freight || 0)) * (parseFloat(t.percentage || 0) / 100))
        })),
      items: validRows.map((row) => ({
        itemId: isServiceMode ? null : parseInt(row.itemId),
        description: row.description,
        accountCode: accounts.find(a => a.id.toString() === row.account.toString())?.accountCode || "",
        quantity: isServiceMode ? 1 : parseInt(row.quantity),
        unitPrice: isServiceMode ? parseFloat(row.amount) : parseFloat(row.unitPrice),
        discount: isServiceMode ? 0 : parseFloat(row.discount) || 0,
        projectId: row.project ? parseInt(row.project) : null,
        itemType: isServiceMode ? "SERVICE" : "GOODS"
      }))
    };

    setIsSubmitting(true);
    try {
      const response = await api.post(`/api/${companyId}/purchase-orders`, payload);
      // api.js returns response.data directly, so we check if the request was successful (response defined)
      if (response) {
        Alert.success("Supplier bill posted successfully!");
        navigate("/app/supplier-bill/all");
      }
    } catch (error) {
      console.error("Error posting supplier bill:", error);
      const errorMsg = error.response?.data?.message || "Failed to post supplier bill";
      Alert.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 my-4 sm:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Enter Supplier Bill
      </h2>

      {/* Supplier and Reference PO Number */}
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
            PO
          </label>
          <select
            value={selectedReferencePo}
            onChange={(e) => handleReferencePoChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            disabled={isFetchingPos || !selectedSupplier}
          >
            <option value="">No PO / Manual Entry</option>
            {isFetchingPos ? (
              <option value="">Loading approved POs...</option>
            ) : posError ? (
              <option value="">Error loading purchase orders</option>
            ) : availablePos.length === 0 ? (
              <option value="">No approved POs available</option>
            ) : (
              availablePos.map((po) => {
                const displayPoNumber = getPoDisplayNumber(po);
                const projectedTotal = Number(po.projectedTotal) || 0;
                return (
                  <option key={displayPoNumber} value={displayPoNumber}>
                    {`${displayPoNumber} (Rs. ${projectedTotal.toLocaleString("en-LK")})`}
                  </option>
                );
              })
            )}
          </select>
          <div className="mt-3">
            <label className="block text-gray-700 font-medium text-sm mb-1">
              Manual PO Number (Optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter manual PO number"
              value={manualReferencePoNumber}
              onChange={(e) => handleManualReferencePoChange(e.target.value)}
            />
          </div>
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
            placeholder="INV-00000001"
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
                      {!isLoadingItems && (selectedPoItems.length > 0 ? selectedPoItems : items)
                        .filter((item) => item)
                        .map((item) => {
                          const itemValue = item.itemId || item.id;
                          const itemLabel = item.description || item.name || `Item ${itemValue}`;
                          return (
                            <option key={itemValue} value={itemValue}>
                              {itemLabel}
                            </option>
                          );
                        })}
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      {/* Financial Details */}
      <div className="flex flex-col items-end gap-4 mb-6">
        {selectedPoProjectedTotal !== null && (
          <div className="w-full md:w-1/2 flex justify-between items-center rounded-lg bg-blue-50 px-4 py-3 border border-blue-100">
            <span className="text-blue-800 font-medium">Selected PO Amount:</span>
            <span className="text-blue-900 font-semibold">Rs. {Number(selectedPoProjectedTotal).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
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
          <label className="text-gray-700 font-medium whitespace-nowrap mr-2">Cost of Tax:</label>
          <div className="flex flex-col w-full items-end gap-2">
            {taxes.map((t, index) => (
              <div key={index} className="flex gap-2 w-full justify-end items-center">
                <select
                  value={t.taxType}
                  onChange={(e) => handleTaxChange(index, "taxType", e.target.value)}
                  className="px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm w-24"
                >
                  <option value="VAT">VAT</option>
                  <option value="SSC">SSC</option>
                  <option value="NBT">NBT</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="flex relative">
                  <input
                    type="number"
                    value={t.percentage}
                    onChange={(e) => handleTaxChange(index, "percentage", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-16 px-2 py-1 border rounded-lg pr-6 focus:ring-2 focus:ring-blue-500 text-sm text-right"
                  />
                  <span className="absolute right-2 top-1.5 text-gray-500 text-sm">%</span>
                </div>
                <span className="text-gray-900 w-24 text-right">
                  Rs. {((subtotal + parseFloat(freight || 0)) * (parseFloat(t.percentage || 0) / 100)).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTax(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove Tax"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTax}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center mt-1"
            >
              <MdAddCircleOutline className="mr-1" /> Add Tax
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Total Tax:</span>
          <span className="text-gray-900">
            Rs. {taxes.reduce((sum, t) => sum + ((subtotal + parseFloat(freight || 0)) * (parseFloat(t.percentage || 0) / 100)), 0).toFixed(2)}
          </span>
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
            {filterAccountsByContext(accounts, AccountContext.PURCHASE_PAYMENT_ACCOUNT).map((account) => (
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

      {/* Post and Cancel Buttons */}
      <div className="flex justify-end space-x-2">
        {/* <button className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base">
          Cancel
        </button> */}
        <button 
          className={`px-3 py-2 rounded-lg text-sm sm:text-base text-white ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post Bill"}
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
