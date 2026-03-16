import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SsoReceiver from "../components/Auth/SsoReceiver";
import GlobalLogout from "../pages/GlobalLogout";
import AddAccountForm from "../components/account/AddAccountForm";
import AllAccounts from "../components/account/AllAccounts";
import LandingPage from "../pages/LandingPage";
import NotFound from "../pages/NotFound/NotFound";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "../layout/MainLayout";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import AllEmployeesPage from "../components/Employee/AllEmployeePage";
import AddEmployeeForm from "../components/Employee/AddEmployeeForm";
import AddUserForm from "../components/users/AddUserForm";
import DepartmentsList from "../components/department/DepartmentsList";
import AddDepartmentForm from "../components/department/AddDepartmentForm";
import AddDesignationForm from "../components/department/AddDesignationForm";
import DesignationsList from "../components/department/DesignationsList";
import CompanyRequests from "../components/super-admin/CompanyRequests";
import ResetPasswordForm from "../components/super-admin/ResetPasswordForm";
import AllCompanies from "../components/super-admin/AllCompanies";
import AddSupplierForm from "../components/supplier/AddSupplierForm";
import SuppliersList from "../components/supplier/SuppliersList";
import AddCustomerForm from "../components/customer/AddCustomer";
import CustomersList from "../components/customer/CustomersList";
import AllUsers from "../components/users/AllUsers";
import CompanyProfile from "../pages/CompanyProfile/CompanyProfile";
import SettingsPage from "../pages/SettingsPage/SettingsPage";
import Dashboard from "../components/super-admin/Dashboard";
import SuperAdminDashboard from "../layout/SuperAdminDashboard";
import GeneralLedger from "../components/reports/GeneralLedger";
import Cashflow from "../components/reports/Cashflow";
import IncomeStatement from "../components/reports/IncomeStatement";
import TrialBalance from "../components/reports/TrialBalance";
import DailySales from "../components/reports/DailySales";
import BalanceSheet from "../components/reports/BalacenSheet";
import Revenue from "../components/reports/Revenue";
import CreateQuotation from "../components/quotations/CreateQuotation";
import AllQuotations from "../components/quotations/AllQuotations";
import MoneyTransaction from "../components/bank/MoneyTransaction";
import CreatePurchase from "../components/supplier/CreatePurchase";
import CreateSaleOrder from "../components/customer/CreateSale";
import AllPurchases from "../components/supplier/AllPurchases";
import AllSales from "../components/customer/AllSales";
import NewProjectForm from "../components/projects/NewProjectForm";
import GeneralJournalTransaction from "../components/transactions/GeneralJournalTransaction";
import AllTransactions from "../components/transactions/AllTransactions";
import AllProjects from "../components/projects/AllProject";
import BankAccount from "../components/bank/BankAccount";
import BankReconsilation from "../components/bank/BankReconsilation";
import AgedPayables from "../components/supplier/AgedPayables";
import AgedReceivables from "../components/customer/AgedReceivables";
import InventoryDashboard from "../components/Inventory/InventoryDashboard";
import AllPayrolls from "../components/payroll/AllPayrolls";
import CreatePayroll from "../components/payroll/CreatePayroll";
import EmployeeSalaries from "../components/payroll/EmployeeSalaries";
import EditRequests from "../components/requests/EditRequests";
import CreateItem from "../components/item/CreateItem";

function AppRouter() {
  // 🚨 DEBUGGING: Log the BASE_URL being used
  console.log('🔧 [Ginuma Router] BASE_URL:', import.meta.env.BASE_URL);
  console.log('🔧 [Ginuma Router] Current pathname:', window.location.pathname);
  console.log('🔧 [Ginuma Router] Current search:', window.location.search);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public Routes - NO LAYOUT */}
        <Route path="/" element={<Navigate to="/sso-login" replace />} />
        <Route path="/sso-login" element={<SsoReceiver />} />
        <Route path="/auth/logout" element={<GlobalLogout />} />

        {/* 🚨 DEBUGGING: Log when routes are rendered */}
        {console.log('🔧 [Ginuma Router] Public routes registered: /, /sso-login, /auth/logout')}

        {/* Protected Routes - WITH LAYOUT */}
        <Route
          path="/super-admin"
          element={
            <PrivateRoute>
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="companies" element={<AllCompanies />} />
          <Route path="requests" element={<CompanyRequests />} />
          <Route path="reset-password" element={<ResetPasswordForm />} />
        </Route>

        {/* Admin Routings */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employee">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<AllEmployeesPage />} />
            <Route path="new" element={<AddEmployeeForm />} />
          </Route>
          <Route path="supplier">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<SuppliersList />} />
            <Route path="new" element={<AddSupplierForm />} />
            <Route path="purchase/new" element={<CreatePurchase />} />
            <Route path="purchase/all" element={<AllPurchases />} />
            <Route path="aged-payables" element={<AgedPayables />} />
          </Route>
          <Route path="customer">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<CustomersList />} />
            <Route path="new" element={<AddCustomerForm />} />
            <Route path="sales/new" element={<CreateSaleOrder />} />
            <Route path="sales/all" element={<AllSales />} />
            <Route path="aged-receivables" element={<AgedReceivables />} />
          </Route>
          <Route path="account">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<AllAccounts />} />
            <Route path="new" element={<AddAccountForm />} />
          </Route>
          <Route path="bank">
            <Route index element={<Navigate to="spend-money" replace />} />
            <Route path="reconsilation" element={<BankReconsilation />} />
            <Route
              path="spend-money"
              element={<MoneyTransaction type="spend" />}
            />
            <Route
              path="receive-money"
              element={<MoneyTransaction type="receive" />}
            />
          </Route>
          <Route path="department">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<DepartmentsList />} />
            <Route path="new" element={<AddDepartmentForm />} />
            <Route path="designations" element={<DesignationsList />} />
            <Route path="designation" element={<AddDesignationForm />} />
          </Route>
          <Route path="payroll">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<AllPayrolls />} />
            <Route path="new" element={<CreatePayroll />} />
            <Route path="salaries" element={<EmployeeSalaries />} />
          </Route>
          <Route path="reports">
            <Route index element={<Navigate to="balance-sheet" replace />} />
            <Route path="revenue-report" element={<Revenue />} />
            <Route path="balance-sheet" element={<BalanceSheet />} />
            <Route path="daily-sales" element={<DailySales />} />
            <Route path="trial-balance" element={<TrialBalance />} />
            <Route path="income-statement" element={<IncomeStatement />} />
            <Route path="cashflow" element={<Cashflow />} />
            <Route path="general-ledger" element={<GeneralLedger />} />
          </Route>
          <Route path="quotations">
            <Route index element={<Navigate to="new" replace />} />
            <Route path="new" element={<CreateQuotation />} />
            <Route path="all" element={<AllQuotations />} />
          </Route>
          <Route path="users">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<AllUsers />} />
            <Route path="new" element={<AddUserForm />} />
          </Route>
          <Route path="projects">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<AllProjects />} />
            <Route path="new" element={<NewProjectForm />} />
          </Route>
          <Route path="transactions">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<AllTransactions />} />
            <Route path="new" element={<GeneralJournalTransaction />} />
          </Route>
          <Route path="inventory">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<InventoryDashboard />} />
            <Route path="items">
               <Route path="new" element={<CreateItem />} />
            </Route>
          </Route>
          <Route path="edit-requests" element={<EditRequests />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
