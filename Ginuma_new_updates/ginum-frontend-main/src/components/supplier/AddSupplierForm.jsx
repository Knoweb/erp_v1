import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../utils/api";
import Alert from "../../components/Alert/Alert";

export default function AddSupplierForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    supplier_name: "",
    email: "",
    mobile: "",
    address: "",
    supplier_type: "",
    item_category: "",
    tin_no: "",
    vat: "",
    tax: "inclusive",
    swift_no: "",
    currency: "LKR",
    discount: "",
    br_document: null,
  });

  const [errors, setErrors] = useState({});

  const itemCategories = ["Electronics", "Furniture", "Clothing", "Food", "Automobile"];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
    // Clear the error for the field when it changes
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Supplier Name validation
    if (!formData.supplier_name.trim()) {
      newErrors.supplier_name = "Supplier Name is required";
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    // Mobile validation
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    // Supplier Type validation
    if (!formData.supplier_type) {
      newErrors.supplier_type = "Supplier Type is required";
    }

    // Item Category validation
    if (!formData.item_category.trim()) {
      newErrors.item_category = "Item Category is required";
    }

    // TIN No validation
    if (formData.tin_no && !/^\d+$/.test(formData.tin_no)) {
      newErrors.tin_no = "TIN No must be numeric";
    }

    // VAT validation
    if (formData.vat && !/^\d+$/.test(formData.vat)) {
      newErrors.vat = "VAT must be numeric";
    }

    // SWIFT No validation
    if (formData.swift_no && !/^[A-Za-z0-9]+$/.test(formData.swift_no)) {
      newErrors.swift_no = "SWIFT No must be alphanumeric";
    }

    // Discount validation
    if (formData.discount && isNaN(formData.discount)) {
      newErrors.discount = "Discount must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setIsSubmitting(true);
      try {
        const companyId = localStorage.getItem("companyId");
        const token = localStorage.getItem("auth_token");

        if (!companyId || !token) {
          Alert.error("Please login first");
          setIsSubmitting(false);
          return;
        }

        // Fix up supplierType to match Backend Enums format
        let bSupplierType = formData.supplier_type.toUpperCase();
        if (bSupplierType === "WHOLESALER") {
          bSupplierType = "SUPPLIER"; // Map wholesaler to SUPPLIER or other valid type if needed, but the backend accepts MANUFACTURER, SUPPLIER, RETAILER.
        }

        const supplierDto = {
          supplierName: formData.supplier_name,
          email: formData.email,
          mobileNo: formData.mobile,
          address: formData.address,
          supplierType: bSupplierType,
          itemCategory: formData.item_category.toUpperCase(),
          tinNo: formData.tin_no,
          vat: formData.vat,
          tax: formData.tax.toUpperCase(),
          currencyId: formData.currency === "USD" ? 1 : formData.currency === "EUR" ? 2 : 3, // Assuming 1=USD, 2=EUR, 3=LKR or similar map
          discountPercentage: formData.discount ? parseFloat(formData.discount) : 0,
          companyId: parseInt(companyId),
          swiftNo: formData.swift_no || ""
        };

        const formDataToSend = new FormData();
        formDataToSend.append(
          "supplier",
          new Blob([JSON.stringify(supplierDto)], { type: "application/json" })
        );

        if (formData.br_document) {
          formDataToSend.append("file", formData.br_document);
        }

        const response = await fetch(`${apiUrl}/api/ginuma/suppliers`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });

        if (response.ok) {
          Alert.success("Supplier saved successfully!");
          setTimeout(() => navigate("/app/supplier/all"), 1500);
        } else {
          const errorData = await response.json().catch(() => null);
          console.log(errorData);
          Alert.error("Failed to save supplier");
        }
      } catch (error) {
        console.error("Error saving supplier:", error);
        Alert.error("Error saving supplier");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-7 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Supplier</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.supplier_name && (
                <p className="text-red-500 text-sm">{errors.supplier_name}</p>
              )}
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">Mobile No</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm">{errors.mobile}</p>
              )}
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4" // Set the number of visible lines
                required
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address}</p>
              )}
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Supplier Type <span className="text-red-500">*</span>
              </label>
              <select
                name="supplier_type"
                value={formData.supplier_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  Select Type <span className="text-red-500">*</span>
                </option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Retailer">Retailer</option>
              </select>
              {errors.supplier_type && (
                <p className="text-red-500 text-sm">{errors.supplier_type}</p>
              )}
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Item Category <span className="text-red-500">*</span>
              </label>
              <select
                name="item_category"
                value={formData.item_category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {itemCategories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
              {errors.item_category && (
                <p className="text-red-500 text-sm">{errors.item_category}</p>
              )}
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">TIN No</label>
              <input
                type="text"
                name="tin_no"
                value={formData.tin_no}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.tin_no && (
                <p className="text-red-500 text-sm">{errors.tin_no}</p>
              )}
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">VAT</label>
              <input
                type="text"
                name="vat"
                value={formData.vat}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.vat && (
                <p className="text-red-500 text-sm">{errors.vat}</p>
              )}
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Tax <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    name="tax"
                    value="inclusive"
                    checked={formData.tax === "inclusive"}
                    onChange={handleChange}
                  />
                  Inclusive
                </label>
                <label>
                  <input
                    type="radio"
                    name="tax"
                    value="exclusive"
                    checked={formData.tax === "exclusive"}
                    onChange={handleChange}
                  />
                  Exclusive
                </label>
              </div>
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">SWIFT No</label>
              <input
                type="text"
                name="swift_no"
                value={formData.swift_no}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.swift_no && (
                <p className="text-red-500 text-sm">{errors.swift_no}</p>
              )}
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">Discount (%) </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
              {errors.discount && (
                <p className="text-red-500 text-sm">{errors.discount}</p>
              )}
            </div>

            <div className="w-full px-2">
              <label className="block text-gray-700">
                Business Registration (BR)
              </label>
              <input
                type="file"
                name="br_document"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Supplier"}
          </button>
        </form>
      </div>
    </div>
  );
}
