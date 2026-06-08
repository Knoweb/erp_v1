import {
  FaTachometerAlt,
  FaUsers,
  FaTruck,
  FaUserTie,
  FaExchangeAlt,
  FaFileAlt,
  FaBook,
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
    sectionTitle: "BUSINESS & OPERATIONS",
  },
  {
    id: "supplier",
    path: "/app/supplier",
    label: "Purchases",
    icon: FaTruck,
    subItems: [
      { id: "all-supplier", path: "/app/supplier/all", label: "All Suppliers" },
      {
        id: "all-purchases",
        path: "/app/supplier/purchase/all",
        label: "Purchases",
      },
      {
        id: "new-purchase",
        path: "/app/supplier-bill/new",
        label: "Enter Supplier Bill",
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
    label: "Sales",
    icon: FaUserTie,
    subItems: [
      { id: "all-customer", path: "/app/customer/all", label: "Customers" },
      { id: "all-sales", path: "/app/customer/sales/all", label: "Sales" },
      { id: "new-sale", path: "/app/customer/sales/new", label: "Enter Sales Bill" },
      {
        id: "aged-receivables",
        path: "/app/customer/aged-receivables",
        label: "Aged Receivables",
      },
    ],
  },
  {
    sectionTitle: "FINANCE & ACCOUNTING",
  },
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
    label: "Banking",
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
    label: "Accountant",
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
