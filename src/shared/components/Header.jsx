import { useLocation } from 'react-router-dom';
import { Server, Activity } from 'lucide-react';
import { API_BASE_URL } from '../../config/env';

const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard & Hệ thống Báo cáo';
      case '/users':
        return 'Quản lý Khách hàng';
      case '/drivers':
        return 'Quản lý Hồ sơ Tài xế';
      case '/invoices':
        return 'Quản lý Giao dịch & Hóa đơn';
      default:
        return 'Quản lý  Pricing';
    }
  };

  return (
    <header className="h-[76px] bg-white/90 backdrop-blur-md border-b border-border-light flex items-center justify-between px-6 lg:px-8 sticky top-0 z-[90] shadow-sm">
      {/* Page Title */}
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          {getPageTitle()}
        </h1>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* System Status Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-surface-elevated px-3.5 py-2 rounded-xl border border-border-light text-xs font-medium text-text-secondary shadow-sm">
          <Activity size={12} strokeWidth={2} className="text-status-success" />
          <span>Hệ thống hoạt động</span>
          <span className="status-dot bg-status-success" />
        </div>

        {/* API Server Badge */}
        <div className="hidden md:flex items-center gap-2 bg-surface-elevated px-3.5 py-2 rounded-xl border border-border-light text-xs font-medium text-text-secondary shadow-sm">
          <Server size={12} strokeWidth={2} className="text-status-info" />
          <span className="max-w-[200px] truncate">{API_BASE_URL}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
