import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
   return;
    }

    setLoading(true);

    try {
      const success = await register({
      username: formData.username,
   email: formData.email,
     password: formData.password,
        fullName: formData.fullName,
phoneNumber: formData.phoneNumber || undefined,
        role: 'Staff',
      });

      if (success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
    setError('Tên đăng nhập hoặc email đã tồn tại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <img src="/restaurant.png" alt="Smart Order POS" style={{height: '64px', marginBottom: '1rem'}} />
          <h1>Smart Order POS</h1>
          <h2>Đăng ký</h2>
   <p>Tạo tài khoản mới để sử dụng hệ thống</p>
      </div>

        {error && (
  <div className="error-message">
 {error}
   </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
     <label htmlFor="fullName">Họ và tên *</label>
            <input
         type="text"
 id="fullName"
  name="fullName"
     value={formData.fullName}
         onChange={handleChange}
       placeholder="Nhập họ và tên"
          required
   autoFocus
            />
          </div>

      <div className="form-group">
        <label htmlFor="username">Tên đăng nhập *</label>
            <input
       type="text"
  id="username"
          name="username"
      value={formData.username}
     onChange={handleChange}
       placeholder="Nhập tên đăng nhập"
      required
        />
          </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
  <input
     type="email"
        id="email"
              name="email"
       value={formData.email}
      onChange={handleChange}
     placeholder="Nhập email"
              required
       />
       </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Số điện thoại</label>
        <input
              type="tel"
  id="phoneNumber"
           name="phoneNumber"
       value={formData.phoneNumber}
    onChange={handleChange}
      placeholder="Nhập số điện thoại"
            />
</div>

          <div className="form-group">
     <label htmlFor="password">Mật khẩu *</label>
     <input
            type="password"
          id="password"
   name="password"
       value={formData.password}
       onChange={handleChange}
       placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
  required
 />
     </div>

 <div className="form-group">
   <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
            <input
    type="password"
              id="confirmPassword"
        name="confirmPassword"
 value={formData.confirmPassword}
     onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
       required
         />
          </div>

          <button
            type="submit"
            className="btn-register"
   disabled={loading}
 >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
  </p>
      </div>
      </div>
    </div>
  );
};

export default Register;
