import { apiUrl } from "./api";

const MIDDENIYA_INVENTORY_URL = "http://178.128.221.122:3002/inventory-api/api/suppliers/organization";

export const normalizeSupplier = (supplier) => {
  if (!supplier) {
    return supplier;
  }

  const contactInfo = supplier.contactInfo || {};

  return {
    id: supplier.id,
    supplierName: supplier.supplierName || supplier.name || "",
    name: supplier.name || supplier.supplierName || "",
    email: supplier.email || contactInfo.email || "",
    mobileNo: supplier.mobileNo || supplier.contactNumber || contactInfo.phone || "",
    address: supplier.address || "",
    supplierType: supplier.supplierType || "",
    itemCategory: supplier.itemCategory || "",
    tax: supplier.tax || "",
  };
};

export const fetchCompanySuppliers = async (companyId, token) => {
  if (!companyId || !token) {
    return [];
  }

  const companySupplierResponse = await fetch(`${apiUrl}/api/ginuma/suppliers/companies/${companyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (companySupplierResponse.ok) {
    const data = await companySupplierResponse.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(normalizeSupplier);
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

  return inventoryData.map(normalizeSupplier);
};