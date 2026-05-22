import { useEffect, useState } from 'react';
import api from '../../../services/api';

const PricingStatsBar = ({ refreshKey = 0 }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/api/admin/dashboard')
      .then((res) => { if (!cancelled) setStats(res.data.data); })
      .catch(() => { if (!cancelled) setStats(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (loading || !stats) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex items-center gap-3 p-4 bg-surface border border-border-light rounded-xl">
        <div className="w-9 h-9 rounded-lg bg-accent-primary/8 border border-accent-primary/20 flex items-center justify-center flex-shrink-0">
          <svg size={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="text-accent-hover"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Cấu hình cước</p>
          <p className="text-lg font-bold text-text-primary">{stats.totalPricingConfigs}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-surface border border-border-light rounded-xl">
        <div className="w-9 h-9 rounded-lg bg-status-warning/8 border border-status-warning/20 flex items-center justify-center flex-shrink-0">
          <svg size={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="text-status-warning"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Quy tắt Surge</p>
          <p className="text-lg font-bold text-text-primary">{stats.totalSurgeRules}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-surface border border-border-light rounded-xl">
        <div className="w-9 h-9 rounded-lg bg-status-success/8 border border-status-success/20 flex items-center justify-center flex-shrink-0">
          <svg size={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="text-status-success"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <div>
          <p className="text-[11px] text-text-muted">Zone hoạt động</p>
          <p className="text-lg font-bold text-text-primary">{stats.activeZones}</p>
        </div>
      </div>
    </div>
  );
};

export default PricingStatsBar;
