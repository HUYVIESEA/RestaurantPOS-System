import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SignalRProvider } from './contexts/SignalRContext';
import { ShiftProvider } from './contexts/ShiftContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Common/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ProductList from './components/Products/ProductList';
import ProductForm from './components/Products/ProductForm';
import OrderList from './components/Orders/OrderList';
import OrderForm from './components/Orders/OrderForm';
import OrderDetail from './components/Orders/OrderDetail';
import CategoryList from './components/Categories/CategoryList';
import CategoryForm from './components/Categories/CategoryForm';
import TableList from './components/Tables/TableList';
import TableForm from './components/Tables/TableForm';
import InventoryList from './components/Inventory/InventoryList';
import KitchenView from './components/Kitchen/KitchenView';
import Dashboard from './components/Dashboard/Dashboard';
import Statistics from './components/Reports/Statistics';
import UserList from './components/Users/UserList';
import UserForm from './components/Users/UserForm';
import UserProfile from './components/Users/UserProfile';
import ChangePassword from './components/Users/ChangePassword';
import PaymentResult from './components/Payment/PaymentResult';
import PaymentSettingsPage from './components/Payment/PaymentSettingsPage';
import SupplierList from './components/Suppliers/SupplierList';
import { ROLES, ROUTE_PERMISSIONS } from './constants/roles';



function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      {isAuthenticated ? (
        <>
          <Navbar />
          <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
            <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 relative">
              <div className="w-full pt-16 md:pt-0">
                <Routes>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

              {/* Products */}
              <Route path="/products" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/products']}><ProductList /></PrivateRoute>} />
              <Route path="/products/new" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/products']}><ProductForm /></PrivateRoute>} />
              <Route path="/products/edit/:id" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/products']}><ProductForm /></PrivateRoute>} />

              {/* Categories */}
              <Route path="/categories" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/categories']}><CategoryList /></PrivateRoute>} />
              <Route path="/categories/new" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/categories']}><CategoryForm /></PrivateRoute>} />
              <Route path="/categories/edit/:id" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/categories']}><CategoryForm /></PrivateRoute>} />

              {/* Orders */}
              <Route path="/orders" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/orders']}><OrderList /></PrivateRoute>} />
              <Route path="/orders/new" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/orders']}><OrderForm /></PrivateRoute>} />
              <Route path="/orders/:id" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/orders']}><OrderDetail /></PrivateRoute>} />

              {/* Inventory */}
              <Route path="/inventory" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/inventory']}><InventoryList /></PrivateRoute>} />
              
              {/* Tables */}
              <Route path="/tables" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/tables']}><TableList /></PrivateRoute>} />
              <Route path="/tables/new" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/tables']}><TableForm /></PrivateRoute>} />
              <Route path="/tables/edit/:id" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/tables']}><TableForm /></PrivateRoute>} />

              {/* Kitchen */}
              <Route path="/kitchen" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/kitchen']}><KitchenView /></PrivateRoute>} />

              {/* Users */}
              <Route path="/users" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/users']}><UserList /></PrivateRoute>} />
              <Route path="/users/new" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/users']}><UserForm /></PrivateRoute>} />
              <Route path="/users/edit/:id" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/users']}><UserForm /></PrivateRoute>} />
              
              {/* Profile & Password */}
              <Route path="/profile" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/profile']}><UserProfile /></PrivateRoute>} />
              <Route path="/change-password" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/change-password']}><ChangePassword /></PrivateRoute>} />

              {/* Statistics (Merged Analytics & Reports) */}
              <Route path="/statistics" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/statistics']}><Statistics /></PrivateRoute>} />
              
              {/* Redirect old routes to new one */}
              <Route path="/analytics" element={<Navigate to="/statistics" replace />} />
              <Route path="/reports" element={<Navigate to="/statistics" replace />} />
              
              {/* Payment */}
              <Route path="/payment-result" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/orders']}><PaymentResult /></PrivateRoute>} />
              <Route path="/payment-settings" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}><PaymentSettingsPage /></PrivateRoute>} />

              {/* Suppliers */}
              <Route path="/suppliers" element={<PrivateRoute allowedRoles={ROUTE_PERMISSIONS['/suppliers']}><SupplierList /></PrivateRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </>
      ) : (
        <div className="w-full flex items-center justify-center min-h-screen">
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SignalRProvider>
              <ToastProvider>
                <ShiftProvider>
                  <AppContent />
                </ShiftProvider>
              </ToastProvider>
            </SignalRProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;