import { useState, useEffect } from "react";
import { MdOutlineCancel, MdAddCircleOutline } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import AddAccountForm from "../account/AddAccountForm";
import CreateItem from "../item/CreateItem";
import api from "../../utils/api";
import Alert from "../../components/Alert/Alert";
import { useNavigate } from "react-router-dom";
import { AccountContext, filterAccountsByContext } from "../../utils/accountFilters";
import { fetchCompanyCustomers } from "../../utils/customerApi";

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const buildCustomerItemOptions = (customerRecord, products = []) => {
  const mappedItems = customerRecord?.contactInfo?.mappings || [];
  const mapProduct = (product) => ({
    id: product.id || product.itemId || product.productId,
    label: product.name || product.productName || product.sku || product.description || `Item #${product.id || product.itemId || product.productId}`,
    description: product.description || product.name || product.productName || product.sku || "",
    accountId: product.incomeAccount?.id ? product.incomeAccount.id.toString() : "",
    quantity: 1,
    unitPrice: product.price ?? product.salesPrice ?? product.unitPrice ?? "",
  });

  if (!mappedItems.length) {
    return products.map(mapProduct);
  }

  return mappedItems
    .map((mapping) => {
      const matchedProduct = products.find(
        (item) => String(item.id || item.itemId || item.productId) === String(mapping.productId)
      );

      const itemId = matchedProduct?.id || matchedProduct?.itemId || matchedProduct?.productId || mapping.productId;
      if (!itemId) {
        return null;
      }

      return {
        id: itemId,
        label:
          matchedProduct?.name ||
          matchedProduct?.productName ||
          matchedProduct?.sku ||
          mapping.productName ||
          mapping.description ||
          `Item #${itemId}`,
        description:
          matchedProduct?.description ||
          matchedProduct?.name ||
          mapping.description ||
          mapping.productName ||
          "",
        accountId: matchedProduct?.incomeAccount?.id ? matchedProduct.incomeAccount.id.toString() : "",
        quantity: mapping.defaultQuantity ?? mapping.quantity ?? 1,
        unitPrice:
          mapping.defaultPrice ??
          mapping.unitPrice ??
          matchedProduct?.price ??
          matchedProduct?.salesPrice ??
          matchedProduct?.unitPrice ??
          "",
      };
    })
    .filter(Boolean);
};

const buildCompletedCustomerItemOptions = (salesOrders = [], products = []) => {
  const options = [];
  const resolveProductName = (item) => {
    const productId = item.externalItemId || item.productId || item.itemId;
    const matchedProduct = products.find((product) => String(product.id) === String(productId));

    return (
      item.productName ||
      matchedProduct?.name ||
      matchedProduct?.productName ||
      item.description ||
      matchedProduct?.sku ||
      null
    );
  };

  salesOrders.forEach((order) => {
    (order?.items || []).forEach((item, index) => {
      if (!item || item.itemType === "SERVICE") return;

      const itemId = item.externalItemId || item.productId || item.itemId;
      if (!itemId) return;

      const resolvedName = resolveProductName(item);
      const displayOrderRef = order.refNo || order.soNumber || order.salesOrderNumber || order.id;
      const uniqueId = `${order.id}-${itemId}-${index}`;

      options.push({
        id: uniqueId,
        itemId,
        salesOrderId: order.id,
        salesOrderNumber: order.refNo || order.soNumber || order.salesOrderNumber || `SO-${String(order.id).padStart(3, "0")}`,
        label: `${resolvedName || `Item #${itemId}`} (${displayOrderRef ? `${String(displayOrderRef).startsWith('SO') ? displayOrderRef : `SO-${displayOrderRef}`}` : `SO-${String(order.id).padStart(3, "0")}`}) | Qty: ${item.quantity ?? 0}`,
        description: resolvedName || "",
        accountId: item.accountCode || "",
        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice ?? "",
      });
    });
  });

  return options;
};

const CreateSaleOrder = () => {
  const createEmptyRow = () => ({
    itemId: "",
    description: "",
    account: "",
    quantity: "",
    unitPrice: "",
    discount: "",
    amount: "",
  });

  const [isServiceMode, setIsServiceMode] = useState(false);
  const [rows, setRows] = useState([createEmptyRow()]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [productCatalog, setProductCatalog] = useState([]);
  const [customerItems, setCustomerItems] = useState([]);
  const [billedSoNumbers, setBilledSoNumbers] = useState(new Set());
  const [soNumber, setSoNumber] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingItemsProjects, setIsLoadingItemsProjects] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalTransition, setModalTransition] = useState("opacity-0 invisible");
  const [accounts, setAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Calculate totals when relevant values change
  useEffect(() => {
    const newSubtotal = rows.reduce((sum, row) => {
      return sum + (parseFloat(row.amount) || 0);
    }, 0);
    setSubtotal(newSubtotal);

    const subtotalPlusFreight = newSubtotal + (parseFloat(freight) || 0);

    let totalTaxAmount = 0;
    taxes.forEach((t) => {
      const pct = parseFloat(t.percentage) || 0;
      const amt = subtotalPlusFreight * (pct / 100);
      totalTaxAmount += amt;
    });

    const newTotal = subtotalPlusFreight + totalTaxAmount;
    setTotal(newTotal);

    const newBalanceDue = Math.max(newTotal - (parseFloat(amountPaid) || 0), 0);
    setBalanceDue(newBalanceDue);
  }, [rows, freight, amountPaid, taxes]);

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
    if (field === 'percentage') {
      const subtotalPlusFreight = subtotal + (parseFloat(freight) || 0);
      newTaxes[index].amount = subtotalPlusFreight * (parseFloat(value) || 0) / 100;
    }
    setTaxes(newTaxes);
  };

  useEffect(() => {
    if (showAccountModal || showItemModal) {
      setModalTransition("opacity-100 visible");
    } else {
      setModalTransition("opacity-0 invisible");
    }
  }, [showAccountModal, showItemModal]);

  const handleModalClick = (e, setModal) => {
    if (e.target === e.currentTarget) {
      setModal(false);
    }
  };

  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerItems([]);
      return;
    }

    const customerRecord = customers.find((customer) => String(customer.id) === String(selectedCustomer));
    const customerName = customerRecord?.customerName || customerRecord?.name || "";

    // Helper: extract only the numeric part from an SO number for flexible comparison
    const extractSoNum = (soNum) => {
      if (!soNum) return null;
      const m = soNum.toString().match(/\d+/);
      return m ? String(parseInt(m[0], 10)) : null;
    };

    const safe = (s) => String(s || "").trim().toLowerCase();
    const custSafe = safe(customerName);
    const customerOrders = salesOrders.filter((order) => {
      const orderCustId = order.customerId;
      const orderCustName = safe(order.customerName);
      const matchesById = orderCustId && String(orderCustId) === String(selectedCustomer);
      const matchesByNameExact = orderCustName === custSafe && custSafe !== "";
      const matchesByNameFuzzy = custSafe !== "" && (orderCustName.includes(custSafe) || custSafe.includes(orderCustName));
      const matchesCustomer = matchesById || matchesByNameExact || matchesByNameFuzzy;
      const isCompleted = String(order.status || "").toUpperCase() === "COMPLETED";
      // Exclude SOs that already have a sales bill created
      const soNumNormalized = extractSoNum(order.refNo || order.soNumber || order.salesOrderNumber || order.id);
      const isAlreadyBilled = soNumNormalized && billedSoNumbers.has(soNumNormalized);
      return matchesCustomer && isCompleted && !isAlreadyBilled;
    });

    const options = buildCompletedCustomerItemOptions(customerOrders, productCatalog);
    console.info("[CreateSale] selectedCustomer:", selectedCustomer, "completedOrders:", customerOrders.length);
    console.info("[CreateSale] computed customerItems:", options.length, options);
    setCustomerItems(options);
  }, [selectedCustomer, salesOrders, customers, productCatalog, billedSoNumbers]);

  

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

        
  // Fetch customers, completed sales orders, soNumber
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const companyId = localStorage.getItem("companyId");
        const token = localStorage.getItem("auth_token");
        if (!companyId || !token) return;

        setIsLoadingCustomers(true);
        const data = await fetchCompanyCustomers(companyId, token);
        setCustomers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    const fetchSalesOrders = async () => {
      try {
        const companyId = localStorage.getItem("companyId");
        if (!companyId) return;

        setIsLoadingItemsProjects(true);

        const extractSoNum = (soNum) => {
          if (!soNum) return null;
          const m = soNum.toString().match(/\d+/);
          return m ? String(parseInt(m[0], 10)) : null;
        };

        const [salesOrdersRes, existingBillsRes, productsRes] = await Promise.all([
          api.get(`/api/finance/external/completed-sales-orders/${companyId}`),
          api.get(`/api/sales-orders/company/${companyId}`).catch(() => []),
          api.get(`/api/finance/external/inventory-products/${companyId}`),
        ]);

        const normalized = normalizeList(salesOrdersRes);
        
        // Deduplicate by order id to avoid duplicate rows from backend anomalies
        const uniqueOrdersMap = new Map();
        normalized.forEach(order => {
          if (order && order.id) {
            uniqueOrdersMap.set(order.id, order);
          }
        });
        const deduplicated = Array.from(uniqueOrdersMap.values());
        
        console.info('[CreateSale] fetchSalesOrders normalized count:', deduplicated.length);
        setSalesOrders(deduplicated);

        // Build a set of already-billed SO numbers (numeric-only for flexible matching)
        const existingBillsList = Array.isArray(existingBillsRes) ? existingBillsRes : (existingBillsRes?.data || []);
        const billedSet = new Set(
          existingBillsList
            .map(b => extractSoNum(b.soNumber || b.salesOrderNumber))
            .filter(Boolean)
        );
        console.info('[CreateSale] billedSoNumbers:', [...billedSet]);
        setBilledSoNumbers(billedSet);

        const productsNormalized = normalizeList(productsRes);
        console.info('[CreateSale] fetchProductCatalog normalized count:', productsNormalized.length);
        setProductCatalog(productsNormalized);
      } catch (error) {
        console.error("Error fetching sales orders:", error);
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
    fetchSalesOrders();
    fetchSoNumber();
  }, []);

  

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    // Auto-fill details when an item is selected
    if (field === "itemId" && value) {
      const selectedItem = customerItems.find((item) => String(item.id) === String(value));

      if (selectedItem) {
          updatedRows[index].description = selectedItem.description || selectedItem.label || "";
        updatedRows[index].quantity = selectedItem.quantity ?? 1;
        updatedRows[index].unitPrice = selectedItem.unitPrice ?? "";
        updatedRows[index].account = selectedItem.accountId || "";
        
        if (selectedItem.salesOrderNumber) {
          setSoNumber(selectedItem.salesOrderNumber);
        }
      }
    } else if (field === "itemId" && !value) {
      updatedRows[index].description = "";
      updatedRows[index].quantity = "";
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
      updatedRows.push(createEmptyRow());
    }

    if (errors.rows && errors.rows[index]) {
      const updatedRowErrors = [...errors.rows];
      if (updatedRowErrors[index]) {
        delete updatedRowErrors[index][field];
        if (field === "itemId") {
          delete updatedRowErrors[index]["itemId"];
        }
        if (Object.keys(updatedRowErrors[index]).length === 0) {
          delete updatedRowErrors[index];
        }
      }
      setErrors(prev => ({ ...prev, rows: updatedRowErrors }));
    }

    setRows(updatedRows);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    setRows([createEmptyRow()]);

    if (!customerId) {
      setCustomerItems([]);
      return;
    }

    const customerRecord = customers.find((customer) => String(customer.id) === String(customerId));
    const customerName = customerRecord?.customerName || customerRecord?.name || "";
    const safe = (s) => String(s || "").trim().toLowerCase();
    const custSafe = safe(customerName);
    const customerOrders = salesOrders.filter((order) => {
      const orderCustId = order.customerId;
      const orderCustName = safe(order.customerName);
      const matchesById = orderCustId && String(orderCustId) === String(customerId);
      const matchesByNameExact = orderCustName === custSafe && custSafe !== "";
      const matchesByNameFuzzy = custSafe !== "" && (orderCustName.includes(custSafe) || custSafe.includes(orderCustName));
      const matchesCustomer = matchesById || matchesByNameExact || matchesByNameFuzzy;
      return matchesCustomer && String(order.status || "").toUpperCase() === "COMPLETED";
    });

    setCustomerItems(buildCompletedCustomerItemOptions(customerOrders, productCatalog));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedCustomer) {
      newErrors.customer = "Customer is required";
    }
    if (!soNumber) {
      newErrors.soNumber = "Sale Order Number is required";
    }
    if (!issueDate) {
      newErrors.issueDate = "Order Date is required";
    }

    const rowErrors = [];
    let hasRowErrors = false;

    // Filter out completely empty rows (unless it is the only row, in which case we validate it)
    const activeRows = rows.filter((row, idx) => {
      const isEmpty = isServiceMode
        ? !row.description && !row.account && !row.amount
        : !row.itemId && !row.description && !row.account && !row.quantity && !row.unitPrice;
      return !isEmpty || (rows.length === 1 && idx === 0);
    });

    if (activeRows.length === 0) {
      newErrors.general = "Please add at least one line item";
    } else {
      rows.forEach((row, index) => {
        const isEmpty = isServiceMode
          ? !row.description && !row.account && !row.amount
          : !row.itemId && !row.description && !row.account && !row.quantity && !row.unitPrice;

        if (isEmpty) return; // skip trailing empty row validation

        const errorsInRow = {};
        if (!isServiceMode && !row.itemId) {
          errorsInRow.itemId = "Item selection is required";
        }
        if (!row.description) {
          errorsInRow.description = "Description is required";
        }
        if (!row.account) {
          errorsInRow.account = "Account is required";
        } else if (!accounts.find(a => a.id.toString() === row.account.toString())?.accountCode) {
          errorsInRow.account = "Selected account is invalid";
        }
        
        if (!isServiceMode) {
          const qty = parseFloat(row.quantity);
          const price = parseFloat(row.unitPrice);
          if (!row.quantity || isNaN(qty) || qty <= 0) {
            errorsInRow.quantity = "Quantity must be > 0";
          }
          if (!row.unitPrice || isNaN(price) || price <= 0) {
            errorsInRow.unitPrice = "Unit Price must be > 0";
          }
        } else {
          const amt = parseFloat(row.amount);
          if (!row.amount || isNaN(amt) || amt <= 0) {
            errorsInRow.amount = "Amount must be > 0";
          }
        }

        if (Object.keys(errorsInRow).length > 0) {
          rowErrors[index] = errorsInRow;
          hasRowErrors = true;
        }
      });
    }

    if (hasRowErrors) {
      newErrors.rows = rowErrors;
    }

    const paidAmount = parseFloat(amountPaid) || 0;
    const roundedTotal = Number(total.toFixed(2));
    const roundedPaid = Number(paidAmount.toFixed(2));

    if (roundedPaid > roundedTotal) {
      newErrors.amountPaid = "Amount paid cannot exceed total amount";
    }

    if (roundedTotal - roundedPaid > 0.01 && !dueDate) {
      newErrors.dueDate = "Due Date is required for balance due";
    }

    if (roundedPaid > 0 && !paymentAccountCode) {
      newErrors.paymentAccountCode = "Payment Account is required for payments";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.error("Please fill all required fields correctly.");
      setTimeout(() => {
        const firstErrorEl = document.querySelector(".border-red-500");
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
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

    const payload = {
      companyId: parseInt(companyId),
      customerId: parseInt(selectedCustomer),
      customerName: customers.find((customer) => String(customer.id) === String(selectedCustomer))?.customerName || customers.find((customer) => String(customer.id) === String(selectedCustomer))?.name || "",
      soNumber: soNumber,
      issueDate: issueDate,
      dueDate: dueDate || null,
      notes: notes,
      salesType: isServiceMode ? "SERVICE" : "ITEMS",
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
        discountPercent: isServiceMode ? 0 : parseFloat(row.discount) || 0,
        projectId: row.project ? parseInt(row.project) : null,
        itemType: isServiceMode ? "SERVICE" : "GOODS"
      }))
    };

    setIsSubmitting(true);
    try {
      const response = await api.post(`/api/sales-orders/company/${companyId}`, payload);
      if (response) {
        Alert.success("Sales bill created successfully!");
        navigate("/app/customer/sales/all"); 
      }
    } catch (error) {
      console.error("Error creating sales order:", error);
      let errorMsg = "Failed to create sales bill.";
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
        Enter Sales Bill
      </h2>

      {/* Customer and Sale Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => {
              handleCustomerChange(e.target.value);
              if (errors.customer) {
                setErrors(prev => ({ ...prev, customer: null }));
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
              errors.customer ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
            }`}
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
                  {customer.name || customer.customerName || `Customer #${customer.id}`}
                </option>
              ))
            )}
          </select>
          {errors.customer && (
            <p className="text-red-500 text-xs mt-1">{errors.customer}</p>
          )}
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            Sale Order Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
              errors.soNumber ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="SO-00000001"
            value={soNumber}
            onChange={(e) => {
              setSoNumber(e.target.value);
              if (errors.soNumber) {
                setErrors(prev => ({ ...prev, soNumber: null }));
              }
            }}
          />
          {errors.soNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.soNumber}</p>
          )}
        </div>
      </div>

      {/* Debug banner: shows completed sales orders count and computed customer items */}
      <div className="mb-4">
        <div className="inline-block px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-lg text-sm font-bold text-yellow-800">
          Completed orders fetched: {salesOrders?.length ?? 0} — Computed customer items: {customerItems?.length ?? 0} — Loading items: {isLoadingItemsProjects ? 'yes' : 'no'}
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
              errors.issueDate ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
            }`}
            value={issueDate}
            onChange={(e) => {
              setIssueDate(e.target.value);
              if (errors.issueDate) {
                setErrors(prev => ({ ...prev, issueDate: null }));
              }
            }}
          />
          {errors.issueDate && (
            <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>
          )}
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
                <th className="p-2 w-1/4 min-w-[200px]">
                  Item ID <span className="text-red-500">*</span>
                </th>
              )}
              <th className="p-2 min-w-[150px]">
                Description <span className="text-red-500">*</span>
              </th>
              <th className="p-2 w-1/5 min-w-[180px]">
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
                  <th className="p-2 w-24 min-w-[95px]">
                    No of Units <span className="text-red-500">*</span>
                  </th>
                  <th className="p-2 w-28 min-w-[110px]">
                    Unit Price <span className="text-red-500">*</span>
                  </th>
                  <th className="p-2 w-24 min-w-[95px]">Discount (%)</th>
                </>
              )}
              <th className="p-2 w-32 min-w-[130px]">
                Amount (Rs.) <span className="text-red-500">*</span>
              </th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowErr = errors.rows?.[index] || {};
              return (
                <tr key={index}>
                  {!isServiceMode && (
                    <td className="p-2">
                      <select
                        value={row.itemId}
                        onChange={(e) =>
                          handleRowChange(index, "itemId", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                          rowErr.itemId ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
                        }`}
                        disabled={isLoadingItemsProjects || !selectedCustomer}
                      >
                        <option value="">{selectedCustomer ? "Select Item" : "Select customer first"}</option>
                        {isLoadingItemsProjects ? (
                          <option value="">Loading items...</option>
                        ) : (
                          customerItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))
                        )}
                      </select>
                      {rowErr.itemId && (
                        <p className="text-red-500 text-xs mt-0.5">{rowErr.itemId}</p>
                      )}
                    </td>
                  )}
                  <td className="p-2">
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                        rowErr.description ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Description"
                      value={row.description}
                      onChange={(e) =>
                        handleRowChange(index, "description", e.target.value)
                      }
                    />
                    {rowErr.description && (
                      <p className="text-red-500 text-xs mt-0.5">{rowErr.description}</p>
                    )}
                  </td>
                  <td className="p-2">
                    <select
                      value={row.account}
                      onChange={(e) =>
                        handleRowChange(index, "account", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                        rowErr.account ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
                      }`}
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
                    {rowErr.account && (
                      <p className="text-red-500 text-xs mt-0.5">{rowErr.account}</p>
                    )}
                  </td>
                  {!isServiceMode && (
                    <>
                      <td className="p-2">
                        <input
                          type="number"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                            rowErr.quantity ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
                          }`}
                          value={row.quantity}
                          onChange={(e) =>
                            handleRowChange(index, "quantity", e.target.value)
                          }
                          min="0"
                          step="1"
                        />
                        {rowErr.quantity && (
                          <p className="text-red-500 text-xs mt-0.5">{rowErr.quantity}</p>
                        )}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                            rowErr.unitPrice ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
                          }`}
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleRowChange(index, "unitPrice", e.target.value)
                          }
                          min="0"
                          step="0.01"
                        />
                        {rowErr.unitPrice && (
                          <p className="text-red-500 text-xs mt-0.5">{rowErr.unitPrice}</p>
                        )}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                        rowErr.amount ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Amount (Rs.)"
                      value={row.amount}
                      onChange={(e) =>
                        handleRowChange(index, "amount", e.target.value)
                      }
                      readOnly={!isServiceMode}
                      min="0"
                      step="0.01"
                    />
                    {rowErr.amount && (
                      <p className="text-red-500 text-xs mt-0.5">{rowErr.amount}</p>
                    )}
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
              );
            })}
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
        <div className="w-full md:w-1/2 flex flex-col items-end">
          <div className="w-full flex justify-between items-center">
            <label className="text-gray-700 font-medium">Amount Paid (Rs.):</label>
            <input
              type="number"
              className={`w-1/2 px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                errors.amountPaid ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="0.00"
              value={amountPaid}
              onChange={(e) => {
                setAmountPaid(e.target.value);
                if (errors.amountPaid) {
                  setErrors(prev => ({ ...prev, amountPaid: null }));
                }
              }}
              min="0"
              step="0.01"
            />
          </div>
          {errors.amountPaid && (
            <p className="text-red-500 text-xs mt-1 self-end w-1/2 text-left pr-2">{errors.amountPaid}</p>
          )}
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-end mb-2">
          <div className="w-full flex justify-between items-center">
            <label className="text-gray-700 font-medium">Payment Account:</label>
            <select
              className={`w-1/2 px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                errors.paymentAccountCode ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
              }`}
              value={paymentAccountCode}
              onChange={(e) => {
                setPaymentAccountCode(e.target.value);
                if (errors.paymentAccountCode) {
                  setErrors(prev => ({ ...prev, paymentAccountCode: null }));
                }
              }}
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
          {errors.paymentAccountCode && (
            <p className="text-red-500 text-xs mt-1 self-end w-1/2 text-left pr-2">{errors.paymentAccountCode}</p>
          )}
        </div>
        <div className="w-full md:w-1/2 flex justify-between items-center">
          <span className="text-gray-700 font-medium">Balance Due:</span>
          <span className="text-gray-900">Rs. {balanceDue.toFixed(2)}</span>
        </div>

        {balanceDue > 0 && (
          <div className="w-full md:w-1/2 flex flex-col items-end">
            <div className="w-full flex justify-between items-center">
              <label className="block text-gray-700 font-medium">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`w-1/2 px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                  errors.dueDate ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
                }`}
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) {
                    setErrors(prev => ({ ...prev, dueDate: null }));
                  }
                }}
                required
              />
            </div>
            {errors.dueDate && (
              <p className="text-red-500 text-xs mt-1 self-end w-1/2 text-left pr-2">{errors.dueDate}</p>
            )}
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
