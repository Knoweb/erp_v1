import { apiUrl } from "./api";

const MIDDENIYA_INVENTORY_URL = "http://178.128.221.122:3002/inventory-api/api/customers/organization";

export const normalizeCustomer = (customer) => {
  if (!customer) {
    return customer;
  }

  const contactInfo = customer.contactInfo || {};
  
  // Extract actual VAT number, filtering out tax type enums
  let vat = customer.vat || customer.vatNumber || customer.vatNo || contactInfo.vat || contactInfo.vatNumber || contactInfo.vatNo || "";
  
  // Remove if it's actually a tax type enum, not a VAT number
  if (['EXCLUSIVE', 'INCLUSIVE', 'VAT', 'SST', 'GST'].includes(String(vat).toUpperCase())) {
    vat = "";
  }

  return {
    id: customer.id,
    name: customer.name || customer.customerName || "",
    customerName: customer.customerName || customer.name || "",
    email: customer.email || contactInfo.email || "",
    phoneNo:
      customer.phoneNo ||
      customer.phoneNumber ||
      customer.phone ||
      customer.mobileNo ||
      customer.mobileNumber ||
      contactInfo.phoneNumber ||
      contactInfo.phone ||
      contactInfo.phoneNo ||
      contactInfo.mobileNo ||
      "",
    billingAddress: customer.billingAddress || customer.address || contactInfo.address || contactInfo.billingAddress || "",
    deliveryAddress: customer.deliveryAddress || customer.delivery || contactInfo.deliveryAddress || "",
    customerType: customer.customerType || "",
    tax:
      customer.tax ||
      customer.taxNo ||
      customer.taxNumber ||
      customer.vatNumber ||
      customer.vatNo ||
      customer.vat ||
      "",
    nicNo: customer.nicNo || "",
    tinNo: customer.tinNo || "",
    vat: vat,
    swiftNo: customer.swiftNo || "",
    discountPercentage: customer.discountPercentage ?? null,
    contactInfo,
  };
};

export const fetchCompanyCustomers = async (companyId, token) => {
  if (!companyId || !token) {
    return [];
  }

  const companyCustomerResponse = await fetch(`${apiUrl}/api/ginuma/customers/companies/${companyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (companyCustomerResponse.ok) {
    const data = await companyCustomerResponse.json();
    console.log("🔍 Raw Customer Data from API:", data);
    if (Array.isArray(data) && data.length > 0) {
      const normalized = data.map(normalizeCustomer);
      console.log("✅ Normalized Customer Data:", normalized);
      return normalized;
    }
  }

  if (String(companyId) !== "16") {
    return [];
  }

  const inventoryResponse = await fetch(`${MIDDENIYA_INVENTORY_URL}/${companyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-org-id": String(companyId),
      "x-tenant-id": localStorage.getItem("ginuma_tenantId") || localStorage.getItem("tenantId") || "",
      "x-industry-type": localStorage.getItem("industryType") || "MANUFACTURING",
      Accept: "application/json",
    },
  });

  if (!inventoryResponse.ok) {
    return [];
  }

  const inventoryData = await inventoryResponse.json();
  if (!Array.isArray(inventoryData)) {
    return [];
  }

  return inventoryData.map(normalizeCustomer);
};