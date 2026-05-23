import { useState } from 'react';
import { Plus, Pencil, AlertTriangle } from 'lucide-react';
import FormField from '../shared/FormField';


const buildForm = (data) => ({
  zoneId: data?.zoneId || '',
  zoneName: data?.zoneName || '',
  surgeMultiplier: data?.surgeMultiplier ?? 1.0,
  latitude: data?.latitude ?? '',
  longitude: data?.longitude ?? '',
  radiusKm: data?.radiusKm ?? '',
  minMultiplier: data?.minMultiplier ?? '',
  maxMultiplier: data?.maxMultiplier ?? '',
  source: data?.source || 'MANUAL',
});

const SurgeFormModal = ({ isOpen, onClose, mode, data, onSubmit, loading, error }) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(buildForm(data));
  const [fieldErrors, setFieldErrors] = useState({});

  if (isOpen && form.zoneId !== (data?.zoneId || '') && data) {
    setForm(buildForm(data));
  }

  if (!isOpen) return null;

  const validate = (f) => {
    const errs = {};
    const multiplier = parseFloat(f.surgeMultiplier);
    if (!multiplier || multiplier < 1.0 || multiplier > 3.0) {
      errs.surgeMultiplier = 'Giá trị từ 1.0 đến 3.0';
    }
    if (!isEdit) {
      if (f.latitude === '' || f.latitude == null) errs.latitude = 'Bắt buộc khi tạo mới';
      if (f.longitude === '' || f.longitude == null) errs.longitude = 'Bắt buộc khi tạo mới';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
        <div className="gold-divider" />
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-status-warning/8 border border-status-warning/20 flex items-center justify-center">
              {isEdit
                ? <Pencil size={17} strokeWidth={1.75} className="text-status-warning" />
                : <Plus size={17} strokeWidth={1.75} className="text-status-warning" />
              }
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                {isEdit ? 'Chỉnh sửa quy tắc Surge' : 'Tạo quy tắc Surge mới'}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                {isEdit ? `Zone: ${data?.zoneId}` : 'Backend tự sinh zone ID từ tọa độ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active transition-all cursor-pointer"
          >
            <svg size={15} strokeWidth={2} className="mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-status-danger-bg border border-status-danger/15 rounded-xl text-status-danger text-sm flex items-center gap-2">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}

          {isEdit && (
            <div className="flex flex-col gap-1">
              <label className="block text-[13px] font-semibold text-text-secondary tracking-wide">
                Zone ID
              </label>
              <div className="w-full px-4 py-3 bg-surface-elevated border border-border-light rounded-xl text-sm font-mono text-text-muted">
                {data?.zoneId}
              </div>
            </div>
          )}

          <FormField
            label="Tên khu vực"
            placeholder="Khu vực trung tâm"
            value={form.zoneName}
            onChange={(v) => setForm((prev) => ({ ...prev, zoneName: v }))}
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Hệ số Surge"
              required
              type="number"
              placeholder="1.5"
              value={form.surgeMultiplier}
              onChange={(v) => {
                setForm((prev) => ({ ...prev, surgeMultiplier: parseFloat(v) || 1.0 }));
                setFieldErrors((prev) => ({ ...prev, surgeMultiplier: '' }));
              }}
              disabled={loading}
              min={1}
              max={3}
              step={0.1}
              error={fieldErrors.surgeMultiplier}
            />
            <FormField
              label="Bán kính (km)"
              type="number"
              placeholder="2.0"
              value={form.radiusKm}
              onChange={(v) => setForm((prev) => ({ ...prev, radiusKm: v ? parseFloat(v) : null }))}
              disabled={loading}
              min={0}
              step={0.1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Vĩ độ"
              type="number"
              placeholder="10.7629"
              value={form.latitude}
              onChange={(v) => {
                setForm((prev) => ({ ...prev, latitude: v === '' ? '' : (parseFloat(v) || '') }));
                setFieldErrors((prev) => ({ ...prev, latitude: '' }));
              }}
              disabled={loading}
              step="any"
              required={!isEdit}
              error={fieldErrors.latitude}
            />
            <FormField
              label="Kinh độ"
              type="number"
              placeholder="106.6604"
              value={form.longitude}
              onChange={(v) => {
                setForm((prev) => ({ ...prev, longitude: v === '' ? '' : (parseFloat(v) || '') }));
                setFieldErrors((prev) => ({ ...prev, longitude: '' }));
              }}
              disabled={loading}
              step="any"
              required={!isEdit}
              error={fieldErrors.longitude}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Hệ số tối thiểu"
              type="number"
              placeholder="1.0"
              value={form.minMultiplier}
              onChange={(v) => setForm((prev) => ({ ...prev, minMultiplier: v ? parseFloat(v) : null }))}
              disabled={loading}
              min={1}
              max={5}
              step={0.1}
            />
            <FormField
              label="Hệ số tối đa"
              type="number"
              placeholder="3.0"
              value={form.maxMultiplier}
              onChange={(v) => setForm((prev) => ({ ...prev, maxMultiplier: v ? parseFloat(v) : null }))}
              disabled={loading}
              min={1}
              max={5}
              step={0.1}
            />
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
              className="flex-1 py-2.5 bg-status-warning text-white font-semibold text-sm rounded-xl shadow-accent hover:shadow-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? 'Đang xử lý...' : isEdit ? 'Lưu thay đổi' : 'Tạo quy tắc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurgeFormModal;
