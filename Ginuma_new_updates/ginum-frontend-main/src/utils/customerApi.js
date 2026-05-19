import { apiUrl } from "./api";

const MIDDENIYA_INVENTORY_URL = "http://178.128.221.122:3002/inventory-api/api/customers/organization";

export const normalizeCustomer = (customer) => {
  if (!customer) {
    return customer;
  }

  const contactInfo = customer.contactInfo || {};

  return {
    id: customer.id,
    name: customer.name || customer.customerName || "",
    customerName: customer.customerName || customer.name || "",
    email: customer.email || contactInfo.email || "",
    phoneNo: customer.phoneNo || customer.phoneNumber || contactInfo.phone || "",
    billingAddress: customer.billingAddress || customer.address || "",
    deliveryAddress: customer.deliveryAddress || "",
    customerType: customer.customerType || "",
    tax: customer.tax || customer.vatNumber || customer.vat || "",
    nicNo: customer.nicNo || "",
    tinNo: customer.tinNo || "",
    vat: customer.vat || customer.vatNumber || "",
    swiftNo: customer.swiftNo || "",
    discountPercentage: customer.discountPercentage ?? null,
    contactInfo,
  };
};

export const fetchCompanyCustomers = async (companyId, token) => {
  if (!companyId || !token) {
    return [];
  }

  const companyCustomerResponse = await fetch(`${apiUrl}/api/customers/companies/${companyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (companyCustomerResponse.ok) {
    const data = await companyCustomerResponse.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(normalizeCustomer);
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