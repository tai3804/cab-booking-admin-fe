import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { LayoutDashboard, Users, Car, LogOut, ChevronLeft, ChevronRight, Compass, DollarSign } from 'lucide-react';
import { selectCurrentUser, clearCredentials } from '../../features/auth/store/authSlice';
import api from '../../services/api';

const Sidebar = () => {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Quản lý Users' },
    { to: '/drivers', icon: Car, label: 'Quản lý Drivers' },
    { to: '/pricing', icon: DollarSign, label: 'Quản lý Pricing' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-white/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={() => setIsCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 h-screen flex flex-col
          bg-surface border-r border-border-light shadow-card
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
      >
        {/* Logo & Collapse Toggle */}
        <div className="flex items-center justify-between p-5 border-b border-border-light bg-gradient-to-r from-accent-primary/5 to-transparent">
          {/* Logo */}
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'w-full justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center flex-shrink-0">
              <Compass size={18} strokeWidth={1.5} className="text-accent-hover" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-bold tracking-widest text-text-primary uppercase">Cab</span>
                <span className="text-[11px] font-medium tracking-wider text-accent-primary uppercase">Admin</span>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              hidden lg:flex items-center justify-center w-7 h-7 rounded-lg
              bg-surface-elevated border border-border-light
              text-text-muted hover:text-text-primary hover:bg-surface-active
              transition-all duration-200 cursor-pointer
              ${isCollapsed ? 'absolute -right-3.5 top-5 shadow-card' : ''}
            `}
          >
            {isCollapsed ? <ChevronRight size={13} strokeWidth={2} /> : <ChevronLeft size={13} strokeWidth={2} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {menuItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm
                transition-all duration-200 cursor-pointer group relative
                ${isCollapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? 'bg-sky-100 text-sky-700 border border-sky-200 shadow-sm'
                    : 'text-text-secondary border border-transparent hover:bg-surface-elevated hover:text-text-primary'
                }
              `}
            >
              <Icon size={16} strokeWidth={1.75} className="flex-shrink-0" />
              {!isCollapsed && <span>{label}</span>}

              {/* Active left indicator */}
              {isCollapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-primary rounded-r-full" />
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-surface-elevated border border-border-light rounded-lg text-sm font-medium text-text-primary whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-card z-50">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-surface-elevated" />
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer: Profile Card + Logout */}
        <div className={`p-3 border-t border-border-light bg-gradient-to-t from-surface-active/40 to-transparent space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {/* Profile Card */}
          <div className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border-light bg-white shadow-sm ${isCollapsed ? 'w-12 h-12 justify-center px-0 py-0' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-accent-primary/10 border border-accent-primary/25 flex items-center justify-center font-semibold text-accent-primary text-sm flex-shrink-0">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate leading-tight">
                  {currentUser?.fullName || 'System Admin'}
                </p>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.14em] mt-0.5">
                  {currentUser?.role || 'ADMIN'}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center justify-center gap-2.5 w-full py-2.5 rounded-xl
              bg-white border border-border-light shadow-sm
              text-text-secondary font-semibold text-sm
              hover:bg-surface-elevated hover:text-text-primary hover:border-border-medium
              transition-all duration-200 cursor-pointer
              ${isCollapsed ? 'w-12 h-12 px-0' : 'px-3'}
            `}
          >
            <LogOut size={15} strokeWidth={1.75} />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu toggle button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className={`
          fixed bottom-4 left-4 z-30 lg:hidden
          w-12 h-12 rounded-xl bg-surface border border-accent-primary/30 text-accent-hover
          flex items-center justify-center shadow-accent
          transition-all duration-300
          ${!isCollapsed ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}
        `}
      >
        <Compass size={18} strokeWidth={1.5} />
      </button>
    </>
  );
};

export default Sidebar;
