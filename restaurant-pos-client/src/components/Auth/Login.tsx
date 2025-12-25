import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
} catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/restaurant.png" alt="Smart Order POS" style={{height: '64px', marginBottom: '1rem'}} />
          <h1>Smart Order POS</h1>
        <h2>Đăng nhập</h2>
       <p>Nhập thông tin để truy cập hệ thống</p>
        </div>

    {error && (
    <div className="error-message">
            {error}
    </div>
     )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
  <label htmlFor="username">Tên đăng nhập</label>
            <input
      type="text"
id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
       placeholder="Nhập tên đăng nhập"
    required
         autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
    type="password"
           id="password"
              value={password}
     onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
         required
/>
          </div>

          <div className="form-actions">
       <Link to="/forgot-password" className="forgot-password-link">
  Quên mật khẩu?
   </Link>
          </div>

   <button
     type="submit"
            className="btn-login"
       disabled={loading}
          >
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
    </button>
        </form>

        <div className="login-footer">
          <p>
    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
  </p>
  <div className="demo-account">
         <p><strong>Tài khoản demo:</strong></p>
          <p>Username: <code>admin</code></p>
 <p>Password: <code>Admin@123</code></p>
 </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
