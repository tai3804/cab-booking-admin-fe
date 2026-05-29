import { useEffect, useState, useRef } from 'react';
import { Search, Eye, RefreshCw, Plus, X, Ban, CheckCircle, CheckCircle2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Car, UserCheck, Phone, Mail, ShieldCheck } from 'lucide-react';
import api from '../../../services/api';

// Vehicle type badge
const VehicleBadge = ({ type }) => {
  const config = {
    BIKE: { label: 'Xe máy (BIKE)', color: 'text-accent-hover' },
    CAR4: { label: 'Ô tô 4 chỗ (CAR4)', color: 'text-status-info' },
    CAR7: { label: 'Ô tô 7 chỗ (CAR7)', color: 'text-status-success' },
  };
  const { label, color } = config[type] || { label: type, color: 'text-text-secondary' };
  return (
    <span className={`text-[12px] font-medium ${color}`}>
      {label}
    </span>
  );
};

// Minimalist status badge — dot + text only
const StatusBadge = ({ status }) => {
  const config = {
    active: { label: 'Hoạt động', dotColor: 'bg-status-success' },
    approved: { label: 'Đã duyệt', dotColor: 'bg-status-success' },
    pending: { label: 'Chờ duyệt', dotColor: 'bg-status-warning' },
    online: { label: 'Trực tuyến', dotColor: 'bg-status-success' },
    offline: { label: 'Ngoại tuyến', dotColor: 'bg-text-muted' },
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

// Action buttons
const ActionButtons = ({ driver, onView, onToggleAccount, onActivate }) => (
  <div className="flex items-center justify-end gap-1.5">
    <button
      onClick={() => onView(driver)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active hover:border-border-medium transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Xem chi tiết"
    >
      <Eye size={14} strokeWidth={1.75} />
    </button>
    {(driver.accountStatus || 'ACTIVE') === 'ACTIVE' ? (
      <button
        onClick={() => onToggleAccount(driver.id, driver.accountStatus || 'ACTIVE')}
        className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-danger hover:bg-status-danger-bg hover:border-status-danger/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
        title="Khóa tài khoản"
      >
        <Ban size={14} strokeWidth={1.75} />
      </button>
    ) : (
      <button
        onClick={() => onToggleAccount(driver.id, driver.accountStatus || 'SUSPENDED')}
        className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-success hover:bg-status-success-bg hover:border-status-success/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
        title="Mở khóa tài khoản"
      >
        <CheckCircle size={14} strokeWidth={1.75} />
      </button>
    )}
    {driver.verificationStatus === 'PENDING' && (
      <button
        onClick={() => onActivate(driver)}
        className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-success hover:bg-status-success-bg hover:border-status-success/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
        title="Kích hoạt phương tiện"
      >
        <CheckCircle2 size={14} strokeWidth={1.75} />
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
        {' tài xế'}
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
const DetailModal = ({ driver, onClose, onActivate }) => {
  if (!driver) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
        <div className="gold-divider" />
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/8 border border-accent-primary/20 flex items-center justify-center">
              <ShieldCheck size={17} strokeWidth={1.75} className="text-accent-hover" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Hồ sơ chi tiết tài xế</h3>
              <p className="text-[11px] text-text-muted mt-0.5">ID: {driver.id?.slice(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active transition-all cursor-pointer">
            <X size={15} strokeWidth={2} className="mx-auto" />
          </button>
        </div>

        <div className="p-5 space-y-2">
          <DriverDetailRow icon={UserCheck} label="Tên tài xế" value={driver.fullName} />
          <DriverDetailRow icon={Mail} label="Email" value={driver.email} />
          <DriverDetailRow icon={Phone} label="Số điện thoại" value={driver.phoneNumber || 'N/A'} />
          <DriverDetailRow icon={Car} label="Kiểu phương tiện" value={driver.vehicleType || 'N/A'} badge />
          <DriverDetailRow icon={ShieldCheck} label="Biển kiểm soát" value={driver.vehiclePlate || 'N/A'} />
          <DriverDetailRow icon={ShieldCheck} label="Giấy phép lái xe" value={driver.licenseNumber || 'N/A'} />
          <DriverDetailRow icon={driver.verificationStatus === 'APPROVED' ? CheckCircle2 : X} label="Trạng thái xác minh" badge status={driver.verificationStatus} />
          <DriverDetailRow icon={driver.accountStatus === 'ACTIVE' ? CheckCircle : Ban} label="Tài khoản" badge status={driver.accountStatus || 'ACTIVE'} />
        </div>

        <div className="p-5 pt-0 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-surface-elevated border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-active hover:text-text-primary hover:border-border-medium transition-all cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => onActivate(driver)}
            className="flex-1 py-2.5 bg-accent-primary text-white font-semibold text-sm rounded-xl shadow-accent hover:shadow-accent-hover transition-all cursor-pointer"
          >
            Cập nhật xe
          </button>
        </div>
      </div>
    </div>
  );
};

const VehicleActivationModal = ({ isOpen, driver, formData, setFormData, onSubmit, loading, error, onClose }) => {
  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
        <div className="gold-divider" />
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/8 border border-accent-primary/20 flex items-center justify-center">
              <Car size={17} strokeWidth={1.75} className="text-accent-hover" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Kích hoạt phương tiện</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Tài xế: {driver.fullName}</p>
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

          <DriverFormField
            label="Số GPLX"
            required
            placeholder="Nhập số giấy phép lái xe..."
            value={formData.licenseNumber}
            onChange={(v) => setFormData({ ...formData, licenseNumber: v })}
            disabled={loading}
          />

          <DriverSelectField
            label="Loại xe"
            required
            value={formData.vehicleType}
            onChange={(v) => setFormData({ ...formData, vehicleType: v })}
            disabled={loading}
            options={[
              { value: 'BIKE', label: 'Xe máy (BIKE)' },
              { value: 'CAR4', label: 'Ô tô 4 chỗ (CAR4)' },
              { value: 'CAR7', label: 'Ô tô 7 chỗ (CAR7)' },
            ]}
          />

          <DriverFormField
            label="Biển số"
            required
            placeholder="Nhập biển số xe..."
            value={formData.vehiclePlate}
            onChange={(v) => setFormData({ ...formData, vehiclePlate: v })}
            disabled={loading}
          />

          <DriverFormField
            label="Dòng xe"
            required
            placeholder="Nhập dòng xe..."
            value={formData.vehicleModel}
            onChange={(v) => setFormData({ ...formData, vehicleModel: v })}
            disabled={loading}
          />

          <DriverFormField
            label="Màu xe"
            required
            placeholder="Nhập màu xe..."
            value={formData.vehicleColor}
            onChange={(v) => setFormData({ ...formData, vehicleColor: v })}
            disabled={loading}
          />

          <DriverFormField
            label="Khu vực hoạt động"
            placeholder="Ví dụ: Ho Chi Minh City"
            value={formData.serviceArea}
            onChange={(v) => setFormData({ ...formData, serviceArea: v })}
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
              {loading ? 'Đang lưu...' : 'Kích hoạt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DriverDetailRow = ({ icon: Icon, label, value, badge, status }) => (
  <div className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl border border-border-light">
    <Icon size={15} strokeWidth={1.75} className="text-text-muted flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-text-muted mb-0.5">{label}</p>
      {badge ? (
        <StatusBadge status={status?.toLowerCase()} />
      ) : (
        <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      )}
    </div>
  </div>
);

// Create Driver Modal
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
              <h3 className="text-base font-semibold text-text-primary">Tạo Tài Xế Mới</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Thêm tài khoản tài xế mới</p>
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

          <DriverFormField
            label="Họ và Tên"
            required
            placeholder="Nhập họ và tên tài xế..."
            value={formData.fullName}
            onChange={(v) => setFormData({ ...formData, fullName: v })}
            disabled={loading}
          />
          <DriverFormField
            label="Địa chỉ Email"
            type="email"
            required
            placeholder="Nhập email tài xế..."
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
            disabled={loading}
          />
          <DriverFormField
            label="Mật khẩu"
            type="password"
            required
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
            value={formData.password}
            onChange={(v) => setFormData({ ...formData, password: v })}
            disabled={loading}
            minLength={6}
          />
          <DriverFormField
            label="Số điện thoại"
            placeholder="Nhập số điện thoại tài xế..."
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

const DriverFormField = ({ label, required, type = 'text', placeholder, value, onChange, disabled, minLength }) => (
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

const DriverSelectField = ({ label, required, value, onChange, disabled, options }) => (
  <div className="space-y-2">
    <label className="block text-[13px] font-semibold text-text-secondary tracking-wide">
      {label} {required && <span className="text-status-danger">*</span>}
    </label>
    <select
      className="w-full px-4 py-3 bg-surface-elevated border border-border-light rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 disabled:opacity-50 transition-all duration-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

// Main Component
const DriversManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phoneNumber: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [activationDriver, setActivationDriver] = useState(null);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationForm, setActivationForm] = useState({
    licenseNumber: '',
    vehicleType: 'CAR4',
    vehiclePlate: '',
    vehicleModel: '',
    vehicleColor: '',
    serviceArea: '',
  });
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationError, setActivationError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const fetchDriversRef = useRef(null);

  useEffect(() => {
    fetchDriversRef.current = () => {
      let cancelled = false;
      setLoading(true);
      api.get('/api/admin/drivers')
        .then(res => { if (!cancelled) setDrivers(res.data.result || []); })
        .catch(() => { if (!cancelled) setDrivers([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };
    fetchDriversRef.current();
    return () => { fetchDriversRef.current = null; };
  }, []);

  const handleRefresh = () => fetchDriversRef.current?.();

  const handleToggleAccountStatus = async (driverId, currentStatus) => {
    const isBlocking = currentStatus === 'ACTIVE';
    const endpoint = isBlocking ? `/api/admin/drivers/${driverId}/block` : `/api/admin/drivers/${driverId}/unblock`;
    const nextStatus = isBlocking ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.post(endpoint);
      setDrivers(drivers.map(d => d.id === driverId ? { ...d, accountStatus: nextStatus } : d));
    } catch {
      setDrivers(drivers.map(d => d.id === driverId ? { ...d, accountStatus: nextStatus } : d));
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      await api.post('/api/admin/drivers', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        avatarUrl: '',
      });
      setIsCreateModalOpen(false);
      setFormData({ fullName: '', email: '', password: '', phoneNumber: '' });
      fetchDriversRef.current();
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Lỗi khi tạo tài xế.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openActivationModal = (driver) => {
    setActivationDriver(driver);
    setActivationForm({
      licenseNumber: driver.licenseNumber || '',
      vehicleType: driver.vehicleType || 'CAR4',
      vehiclePlate: driver.vehiclePlate || '',
      vehicleModel: driver.vehicleModel || '',
      vehicleColor: driver.vehicleColor || '',
      serviceArea: driver.serviceArea || '',
    });
    setActivationError('');
    setIsActivationModalOpen(true);
  };

  const handleActivateVehicle = async (e) => {
    e.preventDefault();
    if (!activationDriver?.externalUserId) {
      setActivationError('Không tìm thấy mã tài xế để cập nhật.');
      return;
    }

    setActivationLoading(true);
    setActivationError('');
    try {
      const payload = {
        externalUserId: activationDriver.externalUserId,
        fullName: activationDriver.fullName,
        email: activationDriver.email,
        phoneNumber: activationDriver.phoneNumber,
        avatarUrl: activationDriver.avatarUrl || '',
        licenseNumber: activationForm.licenseNumber,
        vehicleType: activationForm.vehicleType,
        vehiclePlate: activationForm.vehiclePlate,
        vehicleModel: activationForm.vehicleModel,
        vehicleColor: activationForm.vehicleColor,
        serviceArea: activationForm.serviceArea,
      };

      const res = await api.put('/api/drivers/me/profile', payload);
      const updated = res.data?.result;
      if (updated) {
        setDrivers((prev) => prev.map(d => d.externalUserId === activationDriver.externalUserId ? { ...d, ...updated } : d));
      }
      setIsActivationModalOpen(false);
    } catch (err) {
      setActivationError(err.response?.data?.message || err.message || 'Lỗi khi cập nhật phương tiện.');
    } finally {
      setActivationLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (driver.fullName || '').toLowerCase().includes(q) ||
      (driver.vehiclePlate || '').toLowerCase().includes(q) ||
      (driver.phoneNumber || '').includes(searchQuery);
    const matchesVehicle = vehicleFilter === 'ALL' || driver.vehicleType === vehicleFilter;
    const matchesStatus = statusFilter === 'ALL' || (driver.accountStatus || 'ACTIVE') === statusFilter;
    return matchesSearch && matchesVehicle && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDrivers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-primary text-white text-sm font-semibold rounded-xl shadow-accent hover:shadow-accent-hover transition-all duration-200 cursor-pointer"
        >
          <Plus size={15} strokeWidth={2} />
          <span>Thêm tài xế</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm tài xế theo tên, biển số, sđt..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all duration-200"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Vehicle Type Filter */}
        <select
          className="px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-secondary focus:outline-none focus:border-accent-primary/50 cursor-pointer min-w-[180px]"
          value={vehicleFilter}
          onChange={(e) => { setVehicleFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="ALL">Tất cả loại xe</option>
          <option value="BIKE">Xe máy (BIKE)</option>
          <option value="CAR4">Ô tô 4 chỗ (CAR4)</option>
          <option value="CAR7">Ô tô 7 chỗ (CAR7)</option>
        </select>

        {/* Status Filter */}
        <select
          className="px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-secondary focus:outline-none focus:border-accent-primary/50 cursor-pointer min-w-[160px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
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
          <span className="hidden xl:inline">Làm mới</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-elevated">
                {['Tài xế', 'SĐT', 'GPLX', 'Loại xe', 'Biển số', 'Xác minh', 'Trực tuyến', 'Tài khoản', ''].map((th, i) => (
                  <th key={i} className={`px-4 py-3.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap ${i === 0 ? 'rounded-tl-xl' : ''} ${i === 8 ? 'rounded-tr-xl text-right' : ''}`}>
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-sm text-text-secondary">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-7 h-7 border border-accent-primary/25 border-t-accent-primary rounded-full animate-spin" />
                      <span>Đang tải danh sách tài xế...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-sm text-text-secondary">
                    Không tìm thấy tài xế nào phù hợp.
                  </td>
                </tr>
              ) : currentItems.map((driver, idx) => (
                <tr
                  key={driver.id}
                  className={`border-t border-border-light hover:bg-white/[0.02] transition-colors duration-150 ${idx === currentItems.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-text-primary whitespace-nowrap">{driver.fullName}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary whitespace-nowrap">{driver.phoneNumber || '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary whitespace-nowrap">{driver.licenseNumber || '—'}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap"><VehicleBadge type={driver.vehicleType} /></td>
                  <td className="px-4 py-3.5 text-sm font-medium text-text-primary whitespace-nowrap">{driver.vehiclePlate || '—'}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={driver.verificationStatus?.toLowerCase()} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={driver.availabilityStatus?.toLowerCase()} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={(driver.accountStatus || 'ACTIVE').toLowerCase()} />
                  </td>
                  <td className="px-4 py-3.5">
                    <ActionButtons
                      driver={driver}
                      onView={setSelectedDriver}
                      onToggleAccount={handleToggleAccountStatus}
                      onActivate={openActivationModal}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredDrivers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDrivers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modals */}
      <DetailModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} onActivate={openActivationModal} />
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setCreateError(''); }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateDriver}
        loading={createLoading}
        error={createError}
      />
      <VehicleActivationModal
        isOpen={isActivationModalOpen}
        driver={activationDriver}
        formData={activationForm}
        setFormData={setActivationForm}
        onSubmit={handleActivateVehicle}
        loading={activationLoading}
        error={activationError}
        onClose={() => { setIsActivationModalOpen(false); setActivationError(''); }}
      />
    </div>
  );
}

export default DriversManagement;
