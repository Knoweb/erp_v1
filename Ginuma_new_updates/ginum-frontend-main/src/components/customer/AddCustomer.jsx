import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../utils/api";
import Alert from "../../components/Alert/Alert";

export default function AddCustomerForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    email: "",
    nic_no: "",
    customer_type: "",
    address: "",
    tin_no: "",
    vat: "",
    br_document: null,
    swift_no: "",
    billing_address: "",
    delivery_address: "",
    currency: "LKR",
    discount: "",
    tax: "inclusive", // Options: inclusive, exclusive, no_tax
  });

  const [errors, setErrors] = useState({});

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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Phone No validation
    if (!formData.phone_no.trim()) {
      newErrors.phone_no = "Phone No is required";
    } else if (!/^\d{10}$/.test(formData.phone_no)) {
      newErrors.phone_no = "Phone No must be 10 digits";
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    // NIC No validation
    if (formData.nic_no && !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(formData.nic_no)) {
      newErrors.nic_no = "Invalid NIC No";
    }

    // Customer Type validation
    if (!formData.customer_type) {
      newErrors.customer_type = "Customer Type is required";
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

    // Billing Address validation
    if (!formData.billing_address.trim()) {
      newErrors.billing_address = "Billing Address is required";
    }

    // Delivery Address validation
    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = "Delivery Address is required";
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

        const customerDto = {
          name: formData.name,
          phoneNo: formData.phone_no,
          email: formData.email,
          nicNo: formData.nic_no,
          customerType: formData.customer_type.toUpperCase(), // Assuming Enum is uppercase e.g. INDIVIDUAL, CORPORATE
          vat: formData.vat,
          tinNo: formData.tin_no,
          deliveryAddress: formData.delivery_address,
          tax: formData.tax.toUpperCase(), // Ensure tax matches Enum e.g. INCLUSIVE
          billingAddress: formData.billing_address,
          swiftNo: formData.swift_no || "",
          currencyId: formData.currency === "USD" ? 1 : formData.currency === "EUR" ? 2 : 3,
          discountPercentage: formData.discount ? parseFloat(formData.discount) : 0.0,
          companyId: parseInt(companyId),
        };

        const formDataToSend = new FormData();
        formDataToSend.append(
          "customer",
          new Blob([JSON.stringify(customerDto)], { type: "application/json" })
        );

        if (formData.br_document) {
          formDataToSend.append("businessRegistration", formData.br_document);
        }

        const response = await fetch(`${apiUrl}/api/customers`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });

        if (response.ok) {
          Alert.success("Customer added successfully!");
          navigate("/account/app/customers"); // Adjust navigation route based on your layout
        } else {
          const errorMessage = await response.text();
          Alert.error("Failed to add customer: " + errorMessage);
        }
      } catch (error) {
        console.error("Error adding customer:", error);
        Alert.error("An error occurred while adding the customer.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-7 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="flex flex-wrap -mx-2">
            {/* Name */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Phone No */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Phone No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone_no"
                value={formData.phone_no}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.phone_no && (
                <p className="text-red-500 text-sm">{errors.phone_no}</p>
              )}
            </div>

            {/* Email */}
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

            {/* NIC No */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">NIC No</label>
              <input
                type="text"
                name="nic_no"
                value={formData.nic_no}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.nic_no && (
                <p className="text-red-500 text-sm">{errors.nic_no}</p>
              )}
            </div>

            {/* Customer Type */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Customer Type <span className="text-red-500">*</span>
              </label>
              <select
                name="customer_type"
                value={formData.customer_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  Select Type <span className="text-red-500">*</span>
                </option>
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
              </select>
              {errors.customer_type && (
                <p className="text-red-500 text-sm">{errors.customer_type}</p>
              )}
            </div>

            {/* TIN No */}
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

            {/* VAT */}
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
            {/* Tax */}
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

            {/* Delivery Address */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                type="text"
                name="delivery_address"
                value={formData.delivery_address}
                rows="4"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.delivery_address && (
                <p className="text-red-500 text-sm">
                  {errors.delivery_address}
                </p>
              )}
            </div>

            {/* Billing Address */}
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-gray-700">
                Billing Address <span className="text-red-500">*</span>
              </label>
              <textarea
                type="text"
                name="billing_address"
                value={formData.billing_address}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.billing_address && (
                <p className="text-red-500 text-sm">{errors.billing_address}</p>
              )}
            </div>

            {/* SWIFT No */}
            <div className="w-full md:w-1/3 px-2">
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

            {/* Currency */}
            <div className="w-full md:w-1/3 px-2">
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

            {/* Discount */}
            <div className="w-full md:w-1/3 px-2">
              <label className="block text-gray-700">Discount (%)</label>
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

            {/* BR Document */}
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
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg text-white ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
              }`}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
