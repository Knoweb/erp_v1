const routeTitles = [
  // Dashboard & Login
  { pattern: /^\/app\/dashboard$/, title: "Dashboard | Ginum" },
  { pattern: /^\/sso-login$/, title: "Login | Ginum" },

  // Employee Routes
  { pattern: /^\/app\/employee\/new$/, title: "New Employee | Ginum" },
  { pattern: /^\/app\/employee\/edit\/\d+$/, title: "Edit Employee | Ginum" },
  { pattern: /^\/app\/employee\/all$/, title: "Employee Details | Ginum" },

  // Department Routes
  { pattern: /^\/app\/department\/all$/, title: "All Departments | Ginum" },
  { pattern: /^\/app\/department\/new$/, title: "New Department | Ginum" },
  { pattern: /^\/app\/department\/designation$/, title: "New Designation | Ginum" },

  // Payroll
  { pattern: /^\/app\/payroll$/, title: "Payroll | Ginum" },

  // Supplier Routes
  { pattern: /^\/app\/supplier\/all$/, title: "All Suppliers | Ginum" },
  { pattern: /^\/app\/supplier\/new$/, title: "New Supplier | Ginum" },

  // Customer Routes
  { pattern: /^\/app\/customer\/all$/, title: "All Customers | Ginum" },
  { pattern: /^\/app\/customer\/new$/, title: "New Customer | Ginum" },

  // Order & Inventory
  { pattern: /^\/app\/orders$/, title: "Orders | Ginum" },
  { pattern: /^\/app\/inventory$/, title: "Inventory | Ginum" },

  // Sales & Purchases
  { pattern: /^\/app\/sales$/, title: "Sales | Ginum" },
  { pattern: /^\/app\/purchases$/, title: "Purchases | Ginum" },

  // Transactions & Bank
  { pattern: /^\/app\/transactions$/, title: "Transactions | Ginum" },
  { pattern: /^\/app\/bank$/, title: "Bank | Ginum" },

  // Account Routes
  { pattern: /^\/app\/account\/all$/, title: "All Accounts | Ginum" },
  { pattern: /^\/app\/account\/new$/, title: "New Account | Ginum" },

  // Depreciation
  { pattern: /^\/app\/depreciation$/, title: "Depreciation | Ginum" },

  // Reports
  { pattern: /^\/app\/reports\/balance-sheet$/, title: "Balance Sheet Report | Ginum" },
  { pattern: /^\/app\/reports\/income-statement$/, title: "Income Statement Report | Ginum" },
  { pattern: /^\/app\/reports\/trial-balance$/, title: "Trial Balance Report | Ginum" },
  { pattern: /^\/app\/reports\/daily-sales$/, title: "Daily Sales Report | Ginum" },
  { pattern: /^\/app\/reports\/revenue-report$/, title: "Revenue Report | Ginum" },
  { pattern: /^\/app\/reports\/cashflow$/, title: "Cash Flow Report | Ginum" },
  { pattern: /^\/app\/reports\/general-ledger$/, title: "General Ledger Report | Ginum" },

  // Quotations
  { pattern: /^\/app\/quotations\/new$/, title: "New Quotation | Ginum" },
  { pattern: /^\/app\/quotations\/all$/, title: "All Quotations | Ginum" },

  // User Management
  { pattern: /^\/app\/users\/all$/, title: "All Users | Ginum" },
  { pattern: /^\/app\/users\/new$/, title: "New User | Ginum" },

  // Miscellaneous
  { pattern: /^\/app\/edit-requests$/, title: "Edit Requests | Ginum" },
  { pattern: /^\/app\/profile$/, title: "Profile | Ginum" },
  { pattern: /^\/app\/settings$/, title: "Settings | Ginum" },

  // Default for 404
  // { pattern: /.*/, title: "404 - Page Not Found | Ginum" },
];

export default routeTitles;