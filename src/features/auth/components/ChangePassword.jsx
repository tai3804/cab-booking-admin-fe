import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Key } from 'lucide-react';
import api from '../../../services/api';
import { clearCredentials } from '../store/authSlice';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/password/change', {
        currentPassword,
        newPassword,
      });

      // Server revokes sessions; force local logout
      dispatch(clearCredentials());
      setSuccess('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Key size={20} />
        <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-text-secondary">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="text-sm text-text-secondary">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="text-sm text-text-secondary">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-md disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Thay đổi mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
