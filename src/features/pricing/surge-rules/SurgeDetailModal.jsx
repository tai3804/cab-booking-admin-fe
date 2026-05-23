import { Zap, MapPin, Gauge, Car, AlertTriangle } from 'lucide-react';
import SourceBadge from './SourceBadge';

const toMultiplier = (v) => v != null ? `×${Number(v).toFixed(2)}` : '—';
const toNum = (v) => v != null ? Number(v).toFixed(2) : '—';
const toDateTime = (v) => v ? new Date(v).toLocaleString('vi-VN') : '—';

const InfoPill = ({ label, value, highlight, mono }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[11px] text-text-muted font-medium">{label}</p>
    <p
      className={`text-sm font-semibold leading-tight ${mono ? 'font-mono text-[12px]' : ''} ${highlight ? 'text-status-warning' : 'text-text-primary'}`}
    >
      {value}
    </p>
  </div>
);

const Divider = () => <div className="border-t border-border-light" />;

const SurgeDetailModal = ({ rule, onClose }) => {
  if (!rule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-light flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-status-warning/8 border border-status-warning/20 flex items-center justify-center">
              <Zap size={17} strokeWidth={1.75} className="text-status-warning" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Chi tiết quy tắt Surge</h3>
              <p className="text-[11px] text-text-muted mt-0.5 font-mono">{rule.zoneId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active transition-all cursor-pointer flex items-center justify-center"
          >
            <svg size={15} strokeWidth={2} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Surge multiplier — full width highlight */}
          <div className="flex items-center gap-3 p-4 bg-status-warning/6 border border-status-warning/20 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-status-warning/12 border border-status-warning/25 flex items-center justify-center flex-shrink-0">
              <Zap size={18} strokeWidth={1.75} className="text-status-warning" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted mb-0.5">Hệ số Surge</p>
              <p className="text-2xl font-bold text-status-warning tracking-tight">{toMultiplier(rule.surgeMultiplier)}</p>
            </div>
          </div>

          {/* Zone info */}
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Khu vực</p>
            <div className="grid grid-cols-2 gap-2">
              <InfoPill label="Tên khu vực" value={rule.zoneName || '—'} />
              <InfoPill label="Bán kính" value={rule.radiusKm != null ? `${Number(rule.radiusKm).toFixed(2)} km` : '—'} />
              <InfoPill label="Vĩ độ" value={rule.latitude != null ? Number(rule.latitude).toFixed(6) : '—'} mono />
              <InfoPill label="Kinh độ" value={rule.longitude != null ? Number(rule.longitude).toFixed(6) : '—'} mono />
            </div>
          </div>

          <Divider />

          {/* Demand metrics */}
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Nhu cầu thị trường</p>
            <div className="grid grid-cols-2 gap-2">
              <InfoPill label="Tài xế đang hoạt động" value={rule.activeDrivers != null ? rule.activeDrivers : '—'} />
              <InfoPill label="Chuyến đang chờ" value={rule.pendingRides != null ? rule.pendingRides : '—'} />
              <InfoPill label="Điểm nhu cầu" value={toNum(rule.demandScore)} />
              <InfoPill label="Nguồn" value={<SourceBadge source={rule.source} />} />
            </div>
          </div>

          <Divider />

          {/* Multiplier bounds */}
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Giới hạn hệ số</p>
            <div className="grid grid-cols-2 gap-2">
              <InfoPill label="Tối thiểu" value={toMultiplier(rule.minMultiplier)} highlight={false} />
              <InfoPill label="Tối đa" value={toMultiplier(rule.maxMultiplier)} highlight={false} />
            </div>
          </div>

          <Divider />

          {/* Metadata */}
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Thông tin hệ thống</p>
            <div className="grid grid-cols-2 gap-2">
              <InfoPill label="Schema Version" value={rule.schemaVersion || '1.0.0'} mono />
              <InfoPill label="Ngày tạo" value={toDateTime(rule.createdAt)} />
              <div className="col-span-2">
                <InfoPill label="Cập nhật lần cuối" value={toDateTime(rule.lastUpdated)} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-light flex-shrink-0">
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
