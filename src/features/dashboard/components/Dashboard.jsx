import { useEffect, useState } from 'react';
import { Users, Car, RefreshCw, TrendingUp, UserCheck, UserX, Activity } from 'lucide-react';
import api from '../../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
  });

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const userRes = await api.get('/api/users/count').catch(() => null);
      const driverRes = await api.get('/api/drivers/count').catch(() => null);

      setStats({
        totalUsers: (userRes && userRes.data && typeof userRes.data.result === 'number') ? userRes.data.result : 0,
        totalDrivers: (driverRes && driverRes.data && typeof driverRes.data.result === 'number') ? driverRes.data.result : 0,
      });
    } catch {
      console.warn('Failed to fetch dashboard stats from active API endpoints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchDashboardStats();
    })();
  }, []);

  const statCards = [
    {
      label: 'Tổng Khách Hàng (Users)',
      value: stats.totalUsers,
      icon: Users,
      iconBg: 'bg-accent-primary/8',
      iconColor: 'text-accent-hover',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Tổng Tài Xế (Drivers)',
      value: stats.totalDrivers,
      icon: Car,
      iconBg: 'bg-status-success/8',
      iconColor: 'text-status-success',
      trend: '+8%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={fetchDashboardStats}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-medium transition-all duration-200 cursor-pointer"
        >
          <RefreshCw size={14} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-surface border border-border-light rounded-xl p-5 hover:border-border-medium transition-all duration-300 group relative overflow-hidden"
            >
              {/* Subtle gold accent on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{card.label}</p>
                  <p className="text-3xl font-bold text-text-primary tracking-tight tabular-nums">
                    {loading ? (
                      <span className="inline-block w-16 h-8 bg-surface-elevated rounded animate-pulse" />
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </p>
                  {!loading && card.trend && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={12} strokeWidth={2.5} className={card.trendUp ? 'text-status-success' : 'text-status-danger'} />
                      <span className={`text-xs font-semibold ${card.trendUp ? 'text-status-success' : 'text-status-danger'}`}>
                        {card.trend}
                      </span>
                      <span className="text-xs text-text-muted">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={`p-2.5 rounded-lg ${card.iconBg} border border-border-light`}>
                  <Icon size={18} strokeWidth={1.75} className={card.iconColor} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Quick Stats Cards — placeholders */}
        <QuickStatCard
          icon={UserCheck}
          label="Users Hoạt động"
          value="—"
          bg="bg-status-info/8"
          color="text-status-info"
          loading={loading}
        />
        <QuickStatCard
          icon={UserX}
          label="Users Bị khóa"
          value="—"
          bg="bg-status-warning/8"
          color="text-status-warning"
          loading={loading}
        />
      </div>

      {/* System Overview Panel */}
      <div className="bg-surface border border-border-light rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-accent-primary/8 rounded-lg border border-accent-primary/15">
            <Activity size={16} strokeWidth={1.75} className="text-accent-hover" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Tổng quan hệ thống</h3>
            <p className="text-xs text-text-muted">Trạng thái hoạt động của các dịch vụ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface-elevated rounded-xl p-4 border border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <span className="status-dot bg-status-success animate-pulse" />
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">API Gateway</span>
            </div>
            <p className="text-sm text-text-secondary">Kết nối thành công</p>
          </div>
          <div className="bg-surface-elevated rounded-xl p-4 border border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <span className="status-dot bg-accent-primary" />
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Admin Portal</span>
            </div>
            <p className="text-sm text-text-secondary">Đang hoạt động</p>
          </div>
          <div className="bg-surface-elevated rounded-xl p-4 border border-border-light">
            <div className="flex items-center gap-2 mb-2">
              <span className="status-dot bg-status-info" />
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Database</span>
            </div>
            <p className="text-sm text-text-secondary">Sẵn sàng truy xuất</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick stat card sub-component
const QuickStatCard = ({ icon: Icon, label, value, bg, color, loading }) => (
  <div className="bg-surface border border-border-light rounded-xl p-5 hover:border-border-medium transition-all duration-300">
    <div className="flex items-center justify-between mb-3">
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
      <div className={`p-2 rounded-lg ${bg} border border-border-light`}>
        <Icon size={15} strokeWidth={1.75} className={color} />
      </div>
    </div>
    <p className="text-2xl font-bold text-text-primary tabular-nums">
      {loading ? (
        <span className="inline-block w-12 h-7 bg-surface-elevated rounded animate-pulse" />
      ) : (
        value
      )}
    </p>
  </div>
);

export default Dashboard;
