import {
  FaTachometerAlt,
  FaUsers,
  FaDollarSign,
  FaBuilding,
  FaTruck,
  FaUserTie,
  FaShoppingCart,
  FaClipboardList,
  FaWarehouse,
  FaExchangeAlt,
  FaFileAlt,
  FaBook,
  FaQuoteRight,
  FaUniversity,
} from "react-icons/fa";
import { RiContractLeftFill } from "react-icons/ri";

export const navItems = [
  {
    sectionTitle: "DASHBOARD",
  },
  {
    id: "dashboard",
    path: "/app/dashboard",
    label: "Dashboard",
    icon: FaTachometerAlt,
    subItems: [],
  },

  {
    sectionTitle: "HUMAN RESOURCES",
  },
  {
    id: "employee",
    path: "/app/employee",
    label: "Employees",
    icon: FaUsers,
    subItems: [
      { id: "all-employees", path: "/app/employee/all", label: "All Employees" },
      { id: "new-employee", path: "/app/employee/new", label: "New Employee" },
    ],
  },
  {
    id: "department",
    path: "/app/department",
    label: "Department",
    icon: FaBuilding,
    subItems: [
      {
        id: "all-department",
        path: "/app/department/all",
        label: "All Departments",
      },
      {
        id: "new-department",
        path: "/app/department/new",
        label: "New Department",
      },
      {
        id: "all-designation",
        path: "/app/department/designations",
        label: "All Designations",
      },
      {
        id: "new-designation",
        path: "/app/department/designation",
        label: "New Designation",
      },
    ],
  },
  {
    id: "payroll",
    path: "/app/payroll",
    label: "Payroll",
    icon: FaDollarSign,
    subItems: [
      { id: "all-payroll", path: "/app/payroll/all", label: "All Payroll" },
      { id: "new-payroll", path: "/app/payroll/new", label: "New Payroll" },
      { id: "employee-salaries", path: "/app/payroll/salaries", label: "Employee Salaries" },
    ],
  },

  {
    sectionTitle: "BUSINESS & OPERATIONS",
  },
  {
    id: "supplier",
    path: "/app/supplier",
    label: "Supplier",
    icon: FaTruck,
    subItems: [
      { id: "all-supplier", path: "/app/supplier/all", label: "All Suppliers" },
      { id: "new-supplier", path: "/app/supplier/new", label: "New Supplier" },
      {
        id: "all-purchases",
        path: "/app/supplier/purchase/all",
        label: "Purchases",
      },
      {
        id: "new-purchase",
        path: "/app/supplier/purchase/new",
        label: "Create Purchase",
      },
      {
        id: "aged-payables",
        path: "/app/supplier/aged-payables",
        label: "Aged Payables",
      },
    ],
  },
  {
    id: "customer",
    path: "/app/customer",
    label: "Customer",
    icon: FaUserTie,
    subItems: [
      { id: "all-customer", path: "/app/customer/all", label: "Customers" },
      { id: "new-customer", path: "/app/customer/new", label: "Create Customer" },
      { id: "all-sales", path: "/app/customer/sales/all", label: "Sales" },
      { id: "new-sale", path: "/app/customer/sales/new", label: "Create Sale" },
      {
        id: "aged-receivables",
        path: "/app/customer/aged-receivables",
        label: "Aged Receivables",
      },
    ],
  },
  {
    id: "projects",
    path: "/app/projects",
    label: "projects",
    icon: FaClipboardList,
    subItems: [
      { id: "all-projects", path: "/app/projects/all", label: "All Projects" },
      { id: "new-project", path: "/app/projects/new", label: "Create Project" },
    ],
  },
  {
    id: "inventory",
    path: "/app/inventory",
    label: "Inventory",
    icon: FaWarehouse,
    subItems: [],
  },

  {
    sectionTitle: "FINANCE & ACCOUNTING",
  },
  // {
  //   id: "sales",
  //   path: "/sales",
  //   label: "Sales",
  //   icon: FaShoppingCart,
  //   subItems: [

  //   ],
  // },
  // {
  //   id: "purchases",
  //   path: "/purchases",
  //   label: "Purchases",
  //   icon: FaClipboardList,
  //   subItems: [
  //     { id: "all-purchases", path: "/purchases/all", label: "All Purchases" },
  //     { id: "new-purchases", path: "/purchases/new", label: "Create Purchase" },
  //   ],
  // },
  {
    id: "transactions",
    path: "/app/transactions",
    label: "Transactions",
    icon: FaExchangeAlt,
    subItems: [
      {
        id: "new-transaction",
        path: "/app/transactions/new",
        label: "Create Transactions",
      },
    ],
  },
  {
    id: "bank",
    path: "/app/bank",
    label: "Bank Statement",
    icon: FaUniversity,
    subItems: [
      {
        id: "bank-reconsilation",
        path: "/app/bank/reconsilation",
        label: "Bank Reconsilation",
      },
      {
        id: "receive-money",
        path: "/app/bank/receive-money",
        label: "Receive Money",
      },
      { id: "spend-money", path: "/app/bank/spend-money", label: "Spend Money" },
    ],
  },
  {
    id: "account",
    path: "/app/account",
    label: "Accounts",
    icon: FaBook,
    subItems: [
      { id: "all-accounts", path: "/app/account/all", label: "All Accounts" },
      { id: "new-account", path: "/app/account/new", label: "New Account" },
    ],
  },
  // {
  //   id: "depreciation",
  //   path: "/app/depreciation",
  //   label: "Depreciation",
  //   icon: FaFileAlt,
  //   subItems: [],
  // },

  {
    sectionTitle: "REPORTS & DOCUMENTATION",
  },
  {
    id: "reports",
    path: "/app/reports",
    label: "Reports",
    icon: FaFileAlt,
    subItems: [
      {
        id: "balance-sheet",
        path: "/app/reports/balance-sheet",
        label: "Balance Sheet",
      },
      {
        id: "income-statement",
        path: "/app/reports/income-statement",
        label: "Income Statement",
      },
      {
        id: "trial-balance",
        path: "/app/reports/trial-balance",
        label: "Trial Balance",
      },
      // {
      //   id: "daily-sales",
      //   path: "/app/reports/daily-sales",
      //   label: "Daily Sales Report",
      // },
      // {
      //   id: "revenue-report",
      //   path: "/app/reports/revenue-report",
      //   label: "Revenue Report",
      // },
      { id: "cashflow", path: "/app/reports/cashflow", label: "Cashflow" },
      {
        id: "general-ledger",
        path: "/app/reports/general-ledger",
        label: "General Ledger",
      },
    ],
  },
  {
    id: "quotations",
    path: "/app/quotations",
    label: "Quotations",
    icon: FaQuoteRight,
    subItems: [
      {
        id: "new-quotation",
        path: "/app/quotations/new",
        label: "Create Quotation",
      },
      { id: "all-quotation", path: "/app/quotations/all", label: "All Quotations" },
    ],
  },

  {
    sectionTitle: "USER MANAGEMENT",
  },
  {
    id: "users",
    path: "/app/users",
    label: "Users",
    icon: FaUsers,
    subItems: [
      { id: "all-users", path: "/app/users/all", label: "All Users" },
      { id: "new-user", path: "/app/users/new", label: "New User" },
    ],
  },
  {
    id: "requests",
    path: "/app/edit-requests",
    label: "Requests",
    icon: RiContractLeftFill,
    subItems: [],
  },
];
