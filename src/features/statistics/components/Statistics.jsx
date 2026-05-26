import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Sector, Cell
} from 'recharts';
import {
  RefreshCw, TrendingUp, DollarSign, Receipt,
  CheckCircle2, XCircle, ArrowRightLeft, Calendar,
  CreditCard, Smartphone, Banknote, Wallet, ChevronLeft, ChevronRight,
  Filter, X
} from 'lucide-react';
import api from '../../../services/api';

const CURRENCY = 'VND';

const PAYMENT_METHOD_COLORS = [
  '#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
  '#3B82F6', '#6366F1', '#A50064', '#0068FF', '#00B14F'
];

const PAYMENT_METHOD_CONFIG = {
  CREDIT_CARD: { label: 'Thẻ tín dụng', icon: CreditCard, color: '#3B82F6' },
  DEBIT_CARD:  { label: 'Thẻ ghi nợ',   icon: CreditCard, color: '#6366F1' },
  WALLET:      { label: 'Ví điện tử',   icon: Wallet,     color: '#8B5CF6' },
  CASH:        { label: 'Tiền mặt',     icon: Banknote,   color: '#10B981' },
  VNPAY:       { label: 'VNPay',        icon: Smartphone, color: '#0EA5E9' },
  STRIPE:      { label: 'Stripe',       icon: CreditCard, color: '#6772E5' },
  MOMO:        { label: 'MoMo',         icon: Smartphone, color: '#A50064' },
  ZALOPAY:     { label: 'ZaloPay',      icon: Smartphone, color: '#0068FF' },
  SEP_AY:      { label: 'SePay',        icon: Smartphone, color: '#00B14F' },
};

const TRANSACTION_STATUS_COLORS = {
  SUCCESS: { bg: 'bg-status-success/10', text: 'text-status-success', label: 'Thành công' },
  PENDING: { bg: 'bg-status-warning/10', text: 'text-status-warning', label: 'Đang chờ' },
  FAILED:  { bg: 'bg-status-danger/10',  text: 'text-status-danger',  label: 'Thất bại' },
};

const formatCurrency = (value) => {
  if (value == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => {
  if (value == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(value);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    return `${parts[2].slice(0, 2)}/${parts[1]}`;
  }
  return dateStr;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDefaultRange = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);
  return {
    startDate: firstDay.toISOString(),
    endDate: today.toISOString(),
  };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border-light rounded-xl shadow-card px-4 py-3 space-y-1.5">
      <p className="text-xs font-semibold text-text-primary">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-medium">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  );
};

const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, payload, index
  } = props;
  const color = PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length];
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={color}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={color}
        opacity={0.4}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#374151" fontSize={12} fontWeight={600}>
        {PAYMENT_METHOD_CONFIG[payload.name]?.label || payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6B7280" fontSize={11}>
        {formatCurrency(payload.totalRevenue)}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#9CA3AF" fontSize={10}>
        {payload.transactionCount} giao dịch
      </text>
    </g>
  );
};

const OVERVIEW_TABS = [
  { id: 'overview', label: 'Tổng quan', endpoint: '/api/admin/revenue/overview', icon: TrendingUp },
  { id: 'weekly', label: 'Theo tuần', endpoint: '/api/admin/revenue/weekly', icon: Calendar },
  { id: 'monthly', label: 'Theo tháng', endpoint: '/api/admin/revenue/monthly', icon: Calendar },
];

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(getDefaultRange);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Transaction list state
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsPagination, setTransactionsPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [transactionFilters, setTransactionFilters] = useState({
    statuses: [],
    methods: [],
  });
  const [showFilter, setShowFilter] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
      const tab = OVERVIEW_TABS.find(t => t.id === activeTab);
      console.log('Fetching overview from:', tab.endpoint, 'with params:', params);
      const res = await api.get(tab.endpoint, { params });
      console.log('Overview response:', res.data);
      const result = res.data?.result;
      setStats(result || null);
    } catch (err) {
      console.error('Failed to fetch revenue overview:', err?.response?.data || err?.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, activeTab]);

  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const params = {
        page: transactionsPagination.page,
        size: transactionsPagination.size,
        sort: 'createdAt,desc',
      };
      if (transactionFilters.statuses.length > 0) {
        params.statuses = transactionFilters.statuses.join(',');
      }
      if (transactionFilters.methods.length > 0) {
        params.methods = transactionFilters.methods.join(',');
      }
      console.log('Fetching transactions with params:', params);
      const res = await api.get('/api/admin/revenue/transactions', { params });
      console.log('Transactions response:', res.data);
      const result = res.data?.result;
      if (result) {
        setTransactions(result.content || result.records || []);
        setTransactionsPagination(prev => ({
          ...prev,
          totalElements: result.totalElements || 0,
          totalPages: result.totalPages || 0,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err?.response?.data || err?.message);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [transactionsPagination.page, transactionsPagination.size, transactionFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOverview();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOverview]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const onPieEnter = (_, index) => setActiveIndex(index);

  const successfulTxn = stats?.statusBreakdown?.find(s => s.status === 'SUCCESS');
  const failedTxn = stats?.statusBreakdown?.find(s => s.status === 'FAILED');
  const pendingTxn = stats?.statusBreakdown?.find(s => s.status === 'PENDING');

  const successfulTransactions = successfulTxn ? Number(successfulTxn.transactionsCount) : 0;
  const failedTransactions = failedTxn ? Number(failedTxn.transactionsCount) : 0;
  const pendingTransactions = pendingTxn ? Number(pendingTxn.transactionsCount) : 0;
  const totalTransactions = Number(stats?.totalTransactions) || 0;
  const totalRevenue = Number(stats?.totalRevenue) || 0;

  const dailyData = (stats?.dailyBreakdown || stats?.revenueByPeriod || []).map((d) => ({
    ...d,
    date: formatDate(d.date || d.period),
    totalRevenue: Number(d.revenue) || 0,
    transactionCount: Number(d.transactionsCount) || 0,
  }));

  const methodData = (stats?.methodBreakdown || [])
    .filter((m) => Number(m.totalRevenue) > 0)
    .map((m) => ({
      ...m,
      name: m.paymentMethod,
      percentageOfTotalRevenue: Number(m.percentage) || 0,
      transactionCount: Number(m.transactionsCount) || 0,
    }));

  const successRate = totalTransactions > 0
    ? ((successfulTransactions / totalTransactions) * 100).toFixed(1)
    : null;

  const summaryCards = [
    {
      label: 'Tổng doanh thu',
      value: stats ? formatCurrency(totalRevenue) : '—',
      icon: DollarSign,
      iconBg: 'bg-accent-primary/8',
      iconColor: 'text-accent-hover',
      sub: CURRENCY,
    },
    {
      label: 'Tổng giao dịch',
      value: stats ? formatNumber(totalTransactions) : '—',
      icon: Receipt,
      iconBg: 'bg-status-info/8',
      iconColor: 'text-status-info',
      sub: null,
    },
    {
      label: 'Tỷ lệ thành công',
      value: successRate ? `${successRate}%` : '—',
      icon: CheckCircle2,
      iconBg: 'bg-status-success/8',
      iconColor: 'text-status-success',
      sub: stats ? `${formatNumber(successfulTransactions)} thành công` : null,
    },
    {
      label: 'Giao dịch thất bại',
      value: stats ? formatNumber(failedTransactions) : '—',
      icon: XCircle,
      iconBg: 'bg-status-danger/8',
      iconColor: 'text-status-danger',
      sub: stats ? `${formatNumber(pendingTransactions)} đang chờ` : null,
    },
  ];

  const toggleStatusFilter = (status) => {
    setTransactionFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status],
    }));
    setTransactionsPagination(prev => ({ ...prev, page: 0 }));
  };

  const toggleMethodFilter = (method) => {
    setTransactionFilters(prev => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method],
    }));
    setTransactionsPagination(prev => ({ ...prev, page: 0 }));
  };

  const clearFilters = () => {
    setTransactionFilters({ statuses: [], methods: [] });
    setTransactionsPagination(prev => ({ ...prev, page: 0 }));
  };

  const goToPage = (page) => {
    if (page >= 0 && page < transactionsPagination.totalPages) {
      setTransactionsPagination(prev => ({ ...prev, page }));
    }
  };

  const getMethodConfig = (method) => PAYMENT_METHOD_CONFIG[method] || { label: method, icon: CreditCard, color: '#9CA3AF' };
  const getStatusConfig = (status) => TRANSACTION_STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div />
        <div className="flex items-center gap-3">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2 bg-surface border border-border-light rounded-xl px-3 py-2">
            <Calendar size={14} strokeWidth={1.75} className="text-text-muted" />
            <input
              type="date"
              value={dateRange.startDate ? new Date(dateRange.startDate).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const d = new Date(e.target.value);
                d.setHours(0, 0, 0, 0);
                setDateRange((r) => ({ ...r, startDate: d.toISOString() }));
              }}
              className="bg-transparent text-xs font-medium text-text-primary focus:outline-none cursor-pointer"
            />
            <span className="text-text-muted text-xs">—</span>
            <input
              type="date"
              value={dateRange.endDate ? new Date(dateRange.endDate).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const d = new Date(e.target.value);
                d.setHours(23, 59, 59, 999);
                setDateRange((r) => ({ ...r, endDate: d.toISOString() }));
              }}
              className="bg-transparent text-xs font-medium text-text-primary focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => { fetchOverview(); fetchTransactions(); }}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-medium transition-all duration-200 cursor-pointer"
          >
            <RefreshCw size={14} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Overview Tabs */}
      <div className="bg-surface border border-border-light rounded-xl p-1.5 inline-flex">
        {OVERVIEW_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              <Icon size={14} strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-surface border border-border-light rounded-xl p-5 hover:border-border-medium transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-text-primary tracking-tight tabular-nums">
                    {loading ? (
                      <span className="inline-block w-20 h-7 bg-surface-elevated rounded animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </p>
                  {card.sub && !loading && (
                    <p className="text-[10px] text-text-muted">{card.sub}</p>
                  )}
                </div>
                <div className={`p-2.5 rounded-lg ${card.iconBg} border border-border-light`}>
                  <Icon size={16} strokeWidth={1.75} className={card.iconColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Daily/Weekly/Monthly Revenue Bar Chart */}
        <div className="xl:col-span-2 bg-surface border border-border-light rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-accent-primary/8 rounded-lg border border-accent-primary/15">
              <TrendingUp size={16} strokeWidth={1.75} className="text-accent-hover" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Doanh thu theo {activeTab === 'overview' ? 'ngày' : activeTab === 'weekly' ? 'tuần' : 'tháng'}</h3>
              <p className="text-[11px] text-text-muted">Tổng doanh thu trong khoảng thời gian</p>
            </div>
          </div>

          {loading ? (
            <div className="h-60 bg-surface-elevated rounded-lg animate-pulse" />
          ) : dailyData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-text-muted text-sm">
              Không có dữ liệu trong khoảng thời gian này
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyData} barSize={12} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.05)' }} />
                <Bar
                  dataKey="totalRevenue"
                  name="Doanh thu"
                  fill="#0EA5E9"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Average line */}
          {!loading && dailyData.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-text-muted">
              <TrendingUp size={11} strokeWidth={2} className="text-accent-hover" />
              <span>TB:</span>
              <span className="font-semibold text-text-secondary">
                {formatCurrency(dailyData.reduce((s, d) => s + d.totalRevenue, 0) / dailyData.length)}
              </span>
            </div>
          )}
        </div>

        {/* Payment Method Pie Chart */}
        <div className="bg-surface border border-border-light rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-status-success/8 rounded-lg border border-status-success/15">
              <ArrowRightLeft size={16} strokeWidth={1.75} className="text-status-success" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Theo phương thức</h3>
              <p className="text-[11px] text-text-muted">Phân bổ doanh thu</p>
            </div>
          </div>

          {loading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-surface-elevated animate-pulse" />
            </div>
          ) : methodData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-text-muted text-sm">
              Không có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="totalRevenue"
                  onMouseEnter={onPieEnter}
                  strokeWidth={0}
                >
                  {methodData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          {!loading && methodData.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {methodData.map((item, index) => {
                const config = PAYMENT_METHOD_CONFIG[item.paymentMethod] || {};
                const color = PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length];
                return (
                  <div key={item.paymentMethod} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-text-muted truncate">
                      {config.label || item.paymentMethod}
                    </span>
                    <span className="text-[10px] font-semibold text-text-secondary ml-auto">
                      {item.percentageOfTotalRevenue?.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-surface border border-border-light rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-status-info/8 rounded-lg border border-status-info/15">
              <Receipt size={16} strokeWidth={1.75} className="text-status-info" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Danh sách giao dịch</h3>
              <p className="text-[11px] text-text-muted">
                {formatNumber(transactionsPagination.totalElements)} giao dịch
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(transactionFilters.statuses.length > 0 || transactionFilters.methods.length > 0) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={12} />
                Xóa lọc
              </button>
            )}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showFilter ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Filter size={12} />
              Lọc
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="px-6 pb-4 border-b border-border-light">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Trạng thái
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TRANSACTION_STATUS_COLORS).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        transactionFilters.statuses.includes(status)
                          ? `${config.bg} ${config.text} ring-1 ring-current`
                          : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Phương thức
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PAYMENT_METHOD_CONFIG).map(([method, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={method}
                        onClick={() => toggleMethodFilter(method)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          transactionFilters.methods.includes(method)
                            ? 'bg-accent-primary/10 text-accent-primary ring-1 ring-current'
                            : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
                        }`}
                      >
                        <Icon size={10} style={{ color: config.color }} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-border-light bg-surface-elevated">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Mã GD</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Phương thức</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3 text-center text-[11px] font-semibold text-text-muted uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactionsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-light">
                    <td className="px-6 py-3"><div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" /></td>
                    <td className="px-6 py-3"><div className="h-4 w-32 bg-surface-elevated rounded animate-pulse" /></td>
                    <td className="px-6 py-3"><div className="h-4 w-20 bg-surface-elevated rounded animate-pulse" /></td>
                    <td className="px-6 py-3"><div className="h-4 w-24 bg-surface-elevated rounded animate-pulse ml-auto" /></td>
                    <td className="px-6 py-3"><div className="h-4 w-20 bg-surface-elevated rounded animate-pulse mx-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-text-muted">
                    Không có giao dịch nào
                  </td>
                </tr>
              ) : (
                transactions.map((txn, i) => {
                  const methodConfig = getMethodConfig(txn.paymentMethod);
                  const statusConfig = getStatusConfig(txn.status);
                  const MethodIcon = methodConfig.icon;
                  return (
                    <tr
                      key={txn.id || i}
                      className={`border-b border-border-light hover:bg-surface-elevated/50 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-surface-elevated/30'
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-mono font-medium text-text-secondary">
                          {txn.transactionId || txn.id || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-text-secondary">
                          {formatDateTime(txn.createdAt || txn.transactionDate)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <MethodIcon size={14} style={{ color: methodConfig.color }} />
                          <span className="text-sm font-medium text-text-primary">{methodConfig.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="text-sm font-semibold text-accent-primary">
                          {formatCurrency(txn.amount || txn.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!transactionsLoading && transactionsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-light bg-surface-elevated/50">
            <div className="text-xs text-text-muted">
              Hiển thị {transactionsPagination.page * transactionsPagination.size + 1} - {Math.min((transactionsPagination.page + 1) * transactionsPagination.size, transactionsPagination.totalElements)} trong {formatNumber(transactionsPagination.totalElements)} giao dịch
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(transactionsPagination.page - 1)}
                disabled={transactionsPagination.page === 0}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, transactionsPagination.totalPages) }, (_, i) => {
                let pageNum;
                if (transactionsPagination.totalPages <= 5) {
                  pageNum = i;
                } else if (transactionsPagination.page < 3) {
                  pageNum = i;
                } else if (transactionsPagination.page > transactionsPagination.totalPages - 3) {
                  pageNum = transactionsPagination.totalPages - 5 + i;
                } else {
                  pageNum = transactionsPagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      transactionsPagination.page === pageNum
                        ? 'bg-accent-primary text-white'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => goToPage(transactionsPagination.page + 1)}
                disabled={transactionsPagination.page >= transactionsPagination.totalPages - 1}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
