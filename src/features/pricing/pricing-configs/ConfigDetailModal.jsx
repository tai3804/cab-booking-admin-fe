import { DollarSign, ToggleLeft, ToggleRight, Car, Gauge, ArrowUpDown, Zap } from 'lucide-react';
import { StatusBadge } from '../shared';

const ConfigDetailRow = ({ icon: Icon, label, value, badge, status }) => (
  <div className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl border border-border-light">
    <Icon size={15} strokeWidth={1.75} className="text-text-muted flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-text-muted mb-0.5">{label}</p>
      {badge
        ? <StatusBadge status={status} />
        : <p className="text-sm font-medium text-text-primary truncate">{value}</p>
      }
    </div>
  </div>
);

const ConfigDetailModal = ({ config, onClose }) => {
  if (!config) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
        <div className="gold-divider" />
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/8 border border-accent-primary/20 flex items-center justify-center">
              <DollarSign size={17} strokeWidth={1.75} className="text-accent-hover" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Chi tiết cấu hình cước</h3>
              <p className="text-[11px] text-text-muted mt-0.5">ID: {config.id?.slice(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active transition-all cursor-pointer">
            <svg size={15} strokeWidth={2} className="mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-2">
          <ConfigDetailRow icon={Car} label="Loại phương tiện" value={config.vehicleType} />
          <ConfigDetailRow icon={DollarSign} label="Cước cơ bản (VNĐ)" value={config.baseFare?.toLocaleString('vi-VN')} />
          <ConfigDetailRow icon={Gauge} label="Giá / km (VNĐ)" value={config.perKmRate?.toLocaleString('vi-VN')} />
          <ConfigDetailRow icon={ArrowUpDown} label="Giá / phút (VNĐ)" value={config.perMinuteRate?.toLocaleString('vi-VN')} />
          <ConfigDetailRow icon={Zap} label="Hệ số nhân" value={config.multiplier} />
          <ConfigDetailRow
            icon={config.active ? ToggleRight : ToggleLeft}
            label="Trạng thái"
            badge
            status={config.active}
          />
          <ConfigDetailRow icon={Gauge} label="Schema Version" value={config.schemaVersion || '1.0.0'} />
          <ConfigDetailRow
            icon={Car}
            label="Cập nhật lần cuối"
            value={config.updatedAt ? new Date(config.updatedAt).toLocaleString('vi-VN') : 'N/A'}
          />
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

export default ConfigDetailModal;
