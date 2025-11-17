import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext'; // ✅ ADD
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
import Dashboard from './components/Dashboard/Dashboard';
import Analytics from './components/Analytics/Analytics'; // ✅ ADD
import Reports from './components/Reports/Reports'; // ✅ NEW
import UserList from './components/Users/UserList';
import UserForm from './components/Users/UserForm';
import UserProfile from './components/Users/UserProfile';
import ChangePassword from './components/Users/ChangePassword';

function AppContent() {
  const { isAuthenticated } = useAuth(); // ✅ Remove unused variables

  return (
    <div className="App">
      {isAuthenticated ? (
        <>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

              {/* Products */}
              <Route path="/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
              <Route path="/products/new" element={<PrivateRoute><ProductForm /></PrivateRoute>} />
              <Route path="/products/edit/:id" element={<PrivateRoute><ProductForm /></PrivateRoute>} />

              {/* Categories */}
              <Route path="/categories" element={<PrivateRoute><CategoryList /></PrivateRoute>} />
              <Route path="/categories/new" element={<PrivateRoute><CategoryForm /></PrivateRoute>} /> {/* ✅ ADD */}
              <Route path="/categories/edit/:id" element={<PrivateRoute><CategoryForm /></PrivateRoute>} /> {/* ✅ ADD */}

              {/* Orders */}
              <Route path="/orders" element={<PrivateRoute><OrderList /></PrivateRoute>} />
              <Route path="/orders/new" element={<PrivateRoute><OrderForm /></PrivateRoute>} /> {/* ✅ ADD */}
              <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} /> {/* ✅ ADD */}

              {/* Tables */}
              <Route path="/tables" element={<PrivateRoute><TableList /></PrivateRoute>} />
              <Route path="/tables/new" element={<PrivateRoute><TableForm /></PrivateRoute>} />
              <Route path="/tables/edit/:id" element={<PrivateRoute><TableForm /></PrivateRoute>} />

              {/* Users */} {/* ✅ ADD */}
              <Route path="/users" element={<PrivateRoute><UserList /></PrivateRoute>} />
              <Route path="/users/new" element={<PrivateRoute><UserForm /></PrivateRoute>} />
              <Route path="/users/edit/:id" element={<PrivateRoute><UserForm /></PrivateRoute>} />
              
              {/* Profile & Password */} {/* ✅ ADD */}
              <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

              {/* Analytics */} {/* ✅ ADD */}
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />

              {/* Reports */} {/* ✅ NEW */}
              <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
 <AuthProvider>
  <NotificationProvider> {/* ✅ ADD NotificationProvider */}
   <ToastProvider>
        <AppContent />
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;