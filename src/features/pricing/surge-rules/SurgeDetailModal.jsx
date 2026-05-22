import { Zap, MapPin, Gauge, Car, AlertTriangle } from 'lucide-react';
import SourceBadge from './SourceBadge';

const SurgeDetailRow = ({ icon: Icon, label, value, badge, source }) => (
  <div className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl border border-border-light">
    <Icon size={15} strokeWidth={1.75} className="text-text-muted flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-text-muted mb-0.5">{label}</p>
      {badge
        ? <SourceBadge source={source} />
        : <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      }
    </div>
  </div>
);

const SurgeDetailModal = ({ rule, onClose }) => {
  if (!rule) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
        <div className="gold-divider" />
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-status-warning/8 border border-status-warning/20 flex items-center justify-center">
              <Zap size={17} strokeWidth={1.75} className="text-status-warning" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Chi tiết quy tắc Surge</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Zone: {rule.zoneId}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active transition-all cursor-pointer">
            <svg size={15} strokeWidth={2} className="mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-2">
          <SurgeDetailRow icon={MapPin} label="Zone ID" value={rule.zoneId} />
          <SurgeDetailRow icon={MapPin} label="Tên khu vực" value={rule.zoneName || 'N/A'} />
          <SurgeDetailRow icon={Zap} label="Hệ số Surge" value={`×${rule.surgeMultiplier}`} />
          <SurgeDetailRow icon={Gauge} label="Vĩ độ" value={rule.latitude} />
          <SurgeDetailRow icon={Gauge} label="Kinh độ" value={rule.longitude} />
          <SurgeDetailRow icon={Gauge} label="Bán kính (km)" value={rule.radiusKm} />
          <SurgeDetailRow icon={Car} label="Tài xế đang hoạt động" value={rule.activeDrivers} />
          <SurgeDetailRow icon={AlertTriangle} label="Chuyến đang chờ" value={rule.pendingRides} />
          <SurgeDetailRow icon={Gauge} label="Điểm nhu cầu" value={rule.demandScore != null ? rule.demandScore.toFixed(2) : 'N/A'} />
          <SurgeDetailRow icon={Gauge} label="Hệ số tối thiểu" value={rule.minMultiplier != null ? `×${rule.minMultiplier}` : 'N/A'} />
          <SurgeDetailRow icon={Gauge} label="Hệ số tối đa" value={rule.maxMultiplier != null ? `×${rule.maxMultiplier}` : 'N/A'} />
          <SurgeDetailRow icon={Gauge} label="Nguồn" badge source={rule.source} />
          <SurgeDetailRow icon={Car} label="Cập nhật lần cuối" value={rule.lastUpdated ? new Date(rule.lastUpdated).toLocaleString('vi-VN') : 'N/A'} />
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

export default SurgeDetailModal;
