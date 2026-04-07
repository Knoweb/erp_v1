import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// Pages will be created next
import Home from './pages/Home';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import PirisaHR from './pages/PirisaHR';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminLogin from './pages/SuperAdminLogin';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import ScrollToTop from './components/ScrollToTop';
import Payment from './pages/Payment';
import LandingPage from './pages/LandingPage';
import AllInOne from './pages/AllInOne';
import PirisaLandingPage from './pages/Pirisa_LandingPage';
import InventoryLandingPage from './pages/Inventory_Landingpage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/pirisahr-landing" element={<PirisaLandingPage />} />
          <Route path="/inventory-landing" element={<InventoryLandingPage />} />
          
          {/* Main Layout Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="pirisahr" element={<PirisaHR />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="all-in-one" element={<AllInOne />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }

export default App;

