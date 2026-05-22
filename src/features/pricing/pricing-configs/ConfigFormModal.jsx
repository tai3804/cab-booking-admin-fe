import { useEffect, useState } from 'react';
import { Plus, Pencil, AlertTriangle } from 'lucide-react';
import FormField from '../shared/FormField';

const ConfigFormModal = ({ isOpen, onClose, mode, data, onSubmit, loading, error }) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    vehicleType: data?.vehicleType || '',
    baseFare: data?.baseFare ?? '',
    perKmRate: data?.perKmRate ?? '',
    perMinuteRate: data?.perMinuteRate ?? '',
    multiplier: data?.multiplier ?? 1.0,
    active: data?.active ?? true,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      vehicleType: data?.vehicleType || '',
      baseFare: data?.baseFare ?? '',
      perKmRate: data?.perKmRate ?? '',
      perMinuteRate: data?.perMinuteRate ?? '',
      multiplier: data?.multiplier ?? 1.0,
      active: data?.active ?? true,
    });
    setFieldErrors({});
  }, [isOpen, data, mode]);

  const validate = (f) => {
    const errs = {};
    if (!f.baseFare || f.baseFare <= 0) errs.baseFare = 'Phải lớn hơn 0';
    if (!f.perKmRate || f.perKmRate <= 0) errs.perKmRate = 'Phải lớn hơn 0';
    if (!f.perMinuteRate || f.perMinuteRate <= 0) errs.perMinuteRate = 'Phải lớn hơn 0';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    onSubmit(form);
  };

  const vehicleTypes = ['BIKE', 'CAR4', 'CAR7'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
        <div className="gold-divider" />
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/8 border border-accent-primary/20 flex items-center justify-center">
              {isEdit
                ? <Pencil size={17} strokeWidth={1.75} className="text-accent-hover" />
                : <Plus size={17} strokeWidth={1.75} className="text-accent-hover" />
              }
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                {isEdit ? 'Chỉnh sửa cấu hình cước' : 'Tạo cấu hình cước mới'}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                {isEdit ? `Loại xe: ${data?.vehicleType}` : 'Thêm cấu hình cước cho loại xe'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active transition-all cursor-pointer">
            <svg size={15} strokeWidth={2} className="mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-status-danger-bg border border-status-danger/15 rounded-xl text-status-danger text-sm flex items-center gap-2">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}

          {!isEdit && (
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-text-secondary tracking-wide">
                Loại phương tiện <span className="text-status-danger">*</span>
              </label>
              <select
                className="w-full px-4 py-3 bg-surface-elevated border border-border-light rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 disabled:opacity-50 transition-all"
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                disabled={loading}
                required
              >
                <option value="">Chọn loại phương tiện</option>
                {vehicleTypes.map(t => (
                  <option key={t} value={t}>
                    {t === 'BIKE' ? 'Xe máy (BIKE)' : t === 'CAR4' ? 'Ô tô 4 chỗ (CAR4)' : 'Ô tô 7 chỗ (CAR7)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Cước cơ bản (VNĐ)"
              required
              type="number"
              placeholder="12000"
              value={form.baseFare}
              onChange={(v) => { setForm(prev => ({ ...prev, baseFare: parseFloat(v) || 0 })); setFieldErrors(prev => ({ ...prev, baseFare: '' })); }}
              disabled={loading}
              min={0}
              error={fieldErrors.baseFare}
            />
            <FormField
              label="Giá / km (VNĐ)"
              required
              type="number"
              placeholder="5000"
              value={form.perKmRate}
              onChange={(v) => { setForm(prev => ({ ...prev, perKmRate: parseFloat(v) || 0 })); setFieldErrors(prev => ({ ...prev, perKmRate: '' })); }}
              disabled={loading}
              min={0}
              error={fieldErrors.perKmRate}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Giá / phút (VNĐ)"
              required
              type="number"
              placeholder="500"
              value={form.perMinuteRate}
              onChange={(v) => { setForm(prev => ({ ...prev, perMinuteRate: parseFloat(v) || 0 })); setFieldErrors(prev => ({ ...prev, perMinuteRate: '' })); }}
              disabled={loading}
              min={0}
              error={fieldErrors.perMinuteRate}
            />
            <FormField
              label="Hệ số nhân"
              type="number"
              placeholder="1.0"
              value={form.multiplier}
              onChange={(v) => setForm(prev => ({ ...prev, multiplier: parseFloat(v) || 1.0 }))}
              disabled={loading}
              min={0}
              step={0.1}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl border border-border-light">
            <div>
              <p className="text-[13px] font-semibold text-text-secondary">Kích hoạt</p>
              <p className="text-[11px] text-text-muted mt-0.5">Cấu hình có hiệu lực khi bật</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${form.active ? 'bg-status-success' : 'bg-border-medium'}`}
              disabled={loading}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

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
              {loading ? 'Đang xử lý...' : isEdit ? 'Lưu thay đổi' : 'Tạo cấu hình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigFormModal;
