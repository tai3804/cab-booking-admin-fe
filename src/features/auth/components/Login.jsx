import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { KeyRound, Mail, AlertTriangle, Shield, Eye, EyeOff, Compass } from 'lucide-react';
import { setCredentials } from '../store/authSlice';
import { API_BASE_URL } from '../../../config/env';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
        deviceId: 'web-admin-portal',
        platform: 'WEB',
        userAgent: navigator.userAgent,
        appVersion: '1.0.0',
      });

      const data = res.data.result;
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      const userSummary = data.user;

      if (userSummary?.role !== 'ADMIN') {
        setErrorMsg('Lỗi quyền truy cập! Chỉ quản trị viên mới được đăng nhập cổng này.');
        setLoading(false);
        return;
      }

      dispatch(
        setCredentials({
          accessToken,
          user: userSummary,
        })
      );

      if (refreshToken) {
        localStorage.setItem('admin_refresh_token', refreshToken);
      }

      navigate(from, { replace: true });
    } catch (err) {
      console.error('API login failed, checking for local sandbox fallback.');

      if (email === 'admin@cab.local' && password === 'AdminPassword123') {
        const mockUser = {
          userId: '00000000-0000-0000-0000-000000000000',
          email: 'admin@cab.local',
          fullName: 'Tài Khoản Admin Demo',
          role: 'ADMIN',
          accountStatus: 'ACTIVE',
        };

        dispatch(
          setCredentials({
            accessToken: 'mock_sandbox_access_token_jwt',
            user: mockUser,
          })
        );
        localStorage.setItem('admin_refresh_token', 'mock_sandbox_refresh_token_jwt');
        navigate(from, { replace: true });
      } else {
        setErrorMsg(
          err.response?.data?.message ||
          'Không thể kết nối đến máy chủ! Sai thông tin hoặc Cổng Gateway 8080 chưa chạy.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/BackgroundAdminCabBooking.jpg')" }}
    >
      {/* Ambient background — subtle gold gradient at corners */}
      <div className="absolute inset-0 bg-white/72 backdrop-blur-[1px]" />

      {/* Login Card */}
      <div className="w-full max-w-[420px] relative z-10">
        {/* Card */}
        <div className="bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            {/* Logo mark */}
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center shadow-accent mx-auto mb-5">
              <Compass size={22} strokeWidth={1.5} className="text-accent-hover" />
            </div>

            <h2 className="text-xl font-bold text-text-primary tracking-tight mb-1.5">CAB ADMIN PORTAL</h2>
            <p className="text-sm text-text-secondary">Đăng nhập vào hệ thống điều hành xe công nghệ</p>
          </div>

          {/* Divider */}
          <div className="gold-divider mx-8" />

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-6 space-y-5">
            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3.5 bg-status-danger-bg border border-status-danger/15 rounded-xl flex items-start gap-3 text-status-danger text-sm">
                <AlertTriangle size={16} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-text-secondary tracking-wide">
                Tài khoản Email
              </label>
              <div className="relative">
                <Mail size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  placeholder="admin@cab.local"
                  className="w-full pl-11 pr-4 py-3 bg-surface-elevated border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/25 transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-text-secondary tracking-wide">
                Mật khẩu
              </label>
              <div className="relative">
                <KeyRound size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-surface-elevated border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/25 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-primary text-white font-semibold text-sm rounded-xl shadow-accent hover:shadow-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <span>Đăng Nhập Quản Trị</span>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="px-8 pb-8 pt-2">
            <div className="gold-divider mb-5" />
            <p className="text-xs text-text-muted text-center">
              Mặc định: <span className="font-medium text-text-secondary">admin@cab.local</span> / <span className="font-medium text-text-secondary">AdminPassword123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
