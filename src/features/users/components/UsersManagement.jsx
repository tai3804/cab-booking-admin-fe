import { useEffect, useState, useRef } from 'react';
import { Search, Eye, CheckCircle, Ban, RefreshCw, Plus, X, UserCheck, UserX, Mail, Phone, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import api from '../../../services/api';

// Minimalist status badge — dot + text only
const StatusBadge = ({ status }) => {
  const config = {
    active: { label: 'Hoạt động', dotColor: 'bg-status-success' },
    suspended: { label: 'Bị khóa', dotColor: 'bg-status-danger' },
  };
  const { label, dotColor } = config[status?.toLowerCase()] || config.active;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary">
      <span className={`status-dot ${dotColor}`} />
      {label}
    </span>
  );
};

// Email verification badge
const EmailBadge = ({ verified }) => (
  <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${verified ? 'text-status-success' : 'text-text-muted'}`}>
    {verified
      ? <CheckCircle size={13} strokeWidth={2} />
      : <X size={13} strokeWidth={2} />
    }
    {verified ? 'Đã xác minh' : 'Chưa xác minh'}
  </span>
);

// Action buttons group
const ActionButtons = ({ user, onView, onToggle }) => (
  <div className="flex items-center gap-1.5">
    <button
      onClick={() => onView(user)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active hover:border-border-medium transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Xem chi tiết"
    >
      <Eye size={14} strokeWidth={1.75} />
    </button>
    {user.accountStatus === 'ACTIVE' ? (
      <button
        onClick={() => onToggle(user.userId, user.accountStatus)}
        className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-danger hover:bg-status-danger-bg hover:border-status-danger/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
        title="Khóa tài khoản"
      >
        <Ban size={14} strokeWidth={1.75} />
      </button>
    ) : (
      <button
        onClick={() => onToggle(user.userId, user.accountStatus)}
        className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-success hover:bg-status-success-bg hover:border-status-success/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
        title="Mở khóa tài khoản"
      >
        <CheckCircle size={14} strokeWidth={1.75} />
      </button>
    )}
  </div>
);

// Pagination button
const PageButton = ({ page, label, icon: Icon, disabled, onClick, currentPage }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[36px] h-9 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-1 border transition-all duration-200 cursor-pointer
      ${disabled
        ? 'text-text-muted border-border-light bg-transparent cursor-not-allowed opacity-40'
        : page === currentPage
          ? 'bg-accent-primary text-white border-accent-primary'
          : 'bg-surface-elevated text-text-secondary border-border-light hover:bg-surface-active hover:text-text-primary hover:border-border-medium'
      }`}
  >
    {Icon && <Icon size={13} strokeWidth={2} />}
    {label}
  </button>
);

// Pagination
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 p-4 bg-surface border border-border-light rounded-xl">
      <p className="text-sm text-text-secondary">
        Hiển thị{' '}
        <span className="font-semibold text-text-primary">{startItem}</span>
        {' – '}
        <span className="font-semibold text-text-primary">{endItem}</span>
        {' trong tổng số '}
        <span className="font-semibold text-text-primary">{totalItems}</span>
        {' người dùng'}
      </p>
      <div className="flex items-center gap-1.5">
        <PageButton icon={ChevronsLeft} onClick={() => onPageChange(1)} disabled={currentPage === 1} currentPage={currentPage} />
        <PageButton icon={ChevronLeft} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} currentPage={currentPage} />
        {getVisiblePages().map(page => (
          <PageButton key={page} page={page} onClick={() => onPageChange(page)} currentPage={currentPage} />
        ))}
        <PageButton icon={ChevronRight} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} currentPage={currentPage} />
        <PageButton icon={ChevronsRight} onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
};

// Detail Modal
const DetailModal = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
        <div className="gold-divider" />
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/8 border border-accent-primary/20 flex items-center justify-center">
              <UserCheck size={17} strokeWidth={1.75} className="text-accent-hover" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Chi tiết người dùng</h3>
              <p className="text-[11px] text-text-muted mt-0.5">ID: {user.userId?.slice(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active transition-all cursor-pointer">
            <X size={15} strokeWidth={2} className="mx-auto" />
          </button>
        </div>

        <div className="p-5 space-y-2">
          <DetailRow icon={UserCheck} label="Họ và tên" value={user.fullName} />
          <DetailRow icon={Mail} label="Địa chỉ email" value={user.email} />
          <DetailRow icon={Phone} label="Số điện thoại" value={user.phoneNumber || 'N/A'} />
          <DetailRow icon={user.accountStatus === 'ACTIVE' ? CheckCircle : UserX} label="Trạng thái" value={user.accountStatus === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'} badge />
          <DetailRow icon={Calendar} label="Đăng nhập cuối" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'} />
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-surface-elevated border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-active hover:text-text-primary hover:border-border-medium transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, badge }) => (
  <div className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl border border-border-light">
    <Icon size={15} strokeWidth={1.75} className="text-text-muted flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-text-muted mb-0.5">{label}</p>
      {badge ? (
        <StatusBadge status={value === 'Hoạt động' ? 'active' : 'suspended'} />
      ) : (
        <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      )}
    </div>
  </div>
);

// Create User Modal
const CreateModal = ({ isOpen, onClose, formData, setFormData, onSubmit, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
        <div className="gold-divider" />
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/8 border border-accent-primary/20 flex items-center justify-center">
              <Plus size={17} strokeWidth={1.75} className="text-accent-hover" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Tạo Người Dùng Mới</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Thêm tài khoản khách hàng mới</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active transition-all cursor-pointer">
            <X size={15} strokeWidth={2} className="mx-auto" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-status-danger-bg border border-status-danger/15 rounded-xl text-status-danger text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <FormField
            label="Họ và Tên"
            required
            placeholder="Nhập họ và tên..."
            value={formData.fullName}
            onChange={(v) => setFormData({ ...formData, fullName: v })}
            disabled={loading}
          />
          <FormField
            label="Địa chỉ Email"
            type="email"
            required
            placeholder="Nhập email..."
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
            disabled={loading}
          />
          <FormField
            label="Mật khẩu"
            type="password"
            required
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
            value={formData.password}
            onChange={(v) => setFormData({ ...formData, password: v })}
            disabled={loading}
            minLength={6}
          />
          <FormField
            label="Số điện thoại"
            placeholder="Nhập số điện thoại..."
            value={formData.phoneNumber}
            onChange={(v) => setFormData({ ...formData, phoneNumber: v })}
            disabled={loading}
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-surface-elevated border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-active hover:text-text-primary hover:border-border-medium transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-accent-primary text-white font-semibold text-sm rounded-xl shadow-accent hover:shadow-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ label, required, type = 'text', placeholder, value, onChange, disabled, minLength }) => (
  <div className="space-y-2">
    <label className="block text-[13px] font-semibold text-text-secondary tracking-wide">
      {label} {required && <span className="text-status-danger">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-surface-elevated border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 disabled:opacity-50 transition-all duration-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      minLength={minLength}
    />
  </div>
);

// Main Component
const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phoneNumber: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const fetchUsersRef = useRef(null);

  useEffect(() => {
    fetchUsersRef.current = () => {
      let cancelled = false;
      setLoading(true);
      api.get('/api/admin/users')
        .then(res => { if (!cancelled) setUsers(res.data.result || []); })
        .catch(() => { if (!cancelled) setUsers([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };
    fetchUsersRef.current();
    return () => { fetchUsersRef.current = null; };
  }, []);

  const handleRefresh = () => fetchUsersRef.current?.();

  const handleToggleStatus = async (userId, currentStatus) => {
    const isBlocking = currentStatus === 'ACTIVE';
    const endpoint = isBlocking ? `/api/admin/users/${userId}/block` : `/api/admin/users/${userId}/unblock`;
    const nextStatus = isBlocking ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.post(endpoint);
      setUsers(users.map(u => u.userId === userId ? { ...u, accountStatus: nextStatus } : u));
    } catch {
      setUsers(users.map(u => u.userId === userId ? { ...u, accountStatus: nextStatus } : u));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      await api.post('/api/admin/users', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        avatarUrl: '',
      });
      setIsCreateModalOpen(false);
      setFormData({ fullName: '', email: '', password: '', phoneNumber: '' });
      fetchUsersRef.current();
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Lỗi khi tạo người dùng.');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (user.fullName || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q) ||
      (user.phoneNumber || '').includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || user.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearch = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilter = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-primary text-white text-sm font-semibold rounded-xl shadow-accent hover:shadow-accent-hover transition-all duration-200 cursor-pointer"
        >
          <Plus size={15} strokeWidth={2} />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all duration-200"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-secondary focus:outline-none focus:border-accent-primary/50 cursor-pointer min-w-[160px]"
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="SUSPENDED">Đang khóa</option>
        </select>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-medium transition-all duration-200 cursor-pointer"
        >
          <RefreshCw size={14} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-elevated">
                {['Họ và Tên', 'Email', 'Số điện thoại', 'Xác thực email', 'Trạng thái', 'Đăng nhập cuối', 'Hành động'].map((th, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest ${i === 0 ? 'rounded-tl-xl' : ''} ${i === 6 ? 'rounded-tr-xl text-right' : ''}`}>
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-sm text-text-secondary">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-7 h-7 border border-accent-primary/25 border-t-accent-primary rounded-full animate-spin" />
                      <span>Đang tải danh sách người dùng...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center text-sm text-text-secondary">
                    Không tìm thấy kết quả phù hợp.
                  </td>
                </tr>
              ) : currentItems.map((user, idx) => (
                <tr
                  key={user.userId}
                  className={`border-t border-border-light hover:bg-white/[0.02] transition-colors duration-150 ${idx === currentItems.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-text-primary">{user.fullName}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{user.email}</td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{user.phoneNumber || '—'}</td>
                  <td className="px-5 py-4"><EmailBadge verified={user.emailVerified} /></td>
                  <td className="px-5 py-4"><StatusBadge status={user.accountStatus?.toLowerCase()} /></td>
                  <td className="px-5 py-4 text-sm text-text-muted">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ActionButtons user={user} onView={setSelectedUser} onToggle={handleToggleStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modals */}
      <DetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setCreateError(''); }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateUser}
        loading={createLoading}
        error={createError}
      />
    </div>
  );
};

export default UsersManagement;
