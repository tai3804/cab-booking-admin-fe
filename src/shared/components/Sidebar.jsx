import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Car,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Compass,
  DollarSign,
  Key,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { selectCurrentUser, clearCredentials } from '../../features/auth/store/authSlice';
import api from '../../services/api';

const Sidebar = () => {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    { to: '/users', icon: Users, label: 'Quan ly Users' },
    { to: '/drivers', icon: Car, label: 'Quan ly Drivers' },
    { to: '/bookings', icon: BookOpen, label: 'Booking Admin' },
    { to: '/pricing', icon: DollarSign, label: 'Quan ly Pricing' },
    { to: '/statistics', icon: BarChart3, label: 'Thong ke' },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-white/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={() => setIsCollapsed(true)}
      />

      <aside
        className={`
          fixed lg:relative z-50 h-screen flex flex-col
          bg-surface border-r border-border-light shadow-card
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
      >
        <div className="flex items-center justify-between border-b border-border-light bg-gradient-to-r from-accent-primary/5 to-transparent p-5">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'w-full justify-center' : ''}`}>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-accent-primary/20 bg-accent-primary/10">
              <Compass size={18} strokeWidth={1.5} className="text-accent-hover" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-bold uppercase tracking-widest text-text-primary">Cab</span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-accent-primary">Admin</span>
              </div>
            )}
          </div>

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

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
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

              {isCollapsed && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent-primary" />
              )}

              {isCollapsed && (
                <div className="absolute left-full z-50 ml-3 invisible whitespace-nowrap rounded-lg border border-border-light bg-surface-elevated px-3 py-2 text-sm font-medium text-text-primary opacity-0 shadow-card transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-surface-elevated" />
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`border-t border-border-light bg-gradient-to-t from-surface-active/40 to-transparent p-3 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border border-border-light bg-white px-3.5 py-3 shadow-sm ${isCollapsed ? 'h-12 w-12 justify-center px-0 py-0' : ''}`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-accent-primary/25 bg-accent-primary/10 text-sm font-semibold text-accent-primary">
                {currentUser?.fullName?.charAt(0) || 'A'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight text-text-primary">
                    {currentUser?.fullName || 'System Admin'}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    {currentUser?.role || 'ADMIN'}
                  </p>
                </div>
              )}
            </div>

            {showProfileMenu && (
              <div className={`absolute bottom-14 z-50 ${isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-3'}`}>
                <div className="flex w-44 flex-col gap-2 rounded-xl border border-border-light bg-white p-2 shadow-sm">
                  {currentUser?.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/change-password');
                      }}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated"
                    >
                      <Key size={14} />
                      <span>Doi mat khau</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated"
                  >
                    <LogOut size={14} />
                    <span>Dang xuat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <button
        onClick={() => setIsCollapsed(false)}
        className={`
          fixed bottom-4 left-4 z-30 lg:hidden
          flex h-12 w-12 items-center justify-center rounded-xl border border-accent-primary/30 bg-surface text-accent-hover shadow-accent
          transition-all duration-300
          ${!isCollapsed ? 'pointer-events-none scale-75 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        <Compass size={18} strokeWidth={1.5} />
      </button>
    </>
  );
};

export default Sidebar;
