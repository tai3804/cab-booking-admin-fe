import { useEffect, useState } from 'react';
import { Plus, Pencil, AlertTriangle } from 'lucide-react';
import FormField from '../shared/FormField';

const PromoCodeFormModal = ({ isOpen, onClose, mode, data, onSubmit, loading, error }) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'FIXED',
    discountValue: '',
    maxDiscountAmount: '',
    minimumBookingAmount: '',
    expiryDate: '',
    usageLimit: '',
    active: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    
    if (isEdit && data) {
      // Backend LocalDateTime is 'YYYY-MM-DDTHH:mm:ss' or similar. 
      // HTML input type="datetime-local" needs 'YYYY-MM-DDTHH:mm'.
      let formattedDate = '';
      if (data.expiryDate) {
        formattedDate = data.expiryDate.substring(0, 16);
      }
      
      setForm({
        code: data.code || '',
        description: data.description || '',
        discountType: data.discountType || 'FIXED',
        discountValue: data.discountValue ?? '',
        maxDiscountAmount: data.maxDiscountAmount ?? '',
        minimumBookingAmount: data.minimumBookingAmount ?? '',
        expiryDate: formattedDate,
        usageLimit: data.usageLimit ?? '',
        active: data.active ?? true,
      });
    } else {
      setForm({
        code: '',
        description: '',
        discountType: 'FIXED',
        discountValue: '',
        maxDiscountAmount: '',
        minimumBookingAmount: '',
        expiryDate: '',
        usageLimit: '',
        active: true,
      });
    }
    setFieldErrors({});
  }, [isOpen, data, mode, isEdit]);

  const validate = (f) => {
    const errs = {};
    if (!f.code || f.code.trim() === '') {
      errs.code = 'Mã giảm giá không được để trống';
    }
    if (!f.discountValue || parseFloat(f.discountValue) <= 0) {
      errs.discountValue = 'Giá trị giảm phải lớn hơn 0';
    } else if (f.discountType === 'PERCENTAGE' && parseFloat(f.discountValue) > 100) {
      errs.discountValue = 'Phần trăm giảm không được vượt quá 100%';
    }
    
    if (f.discountType === 'PERCENTAGE' && (!f.maxDiscountAmount || parseFloat(f.maxDiscountAmount) <= 0)) {
      errs.maxDiscountAmount = 'Vui lòng nhập giá trị giảm tối đa hợp lệ cho loại giảm giá %';
    }

    if (!f.expiryDate) {
      errs.expiryDate = 'Vui lòng chọn ngày hết hạn';
    } else {
      const expDate = new Date(f.expiryDate);
      if (expDate <= new Date()) {
        errs.expiryDate = 'Ngày hết hạn phải ở tương lai';
      }
    }

    if (!f.usageLimit || parseInt(f.usageLimit, 10) <= 0) {
      errs.usageLimit = 'Giới hạn sử dụng phải lớn hơn 0';
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

    // Formatting date to include seconds for backend: YYYY-MM-DDTHH:mm:ss
    let apiExpiryDate = form.expiryDate;
    if (apiExpiryDate && apiExpiryDate.length === 16) {
      apiExpiryDate = `${apiExpiryDate}:00`;
    }

    onSubmit({
      ...form,
      code: form.code.trim().toUpperCase(),
      discountValue: parseFloat(form.discountValue),
      maxDiscountAmount: form.discountType === 'PERCENTAGE' ? parseFloat(form.maxDiscountAmount) : null,
      minimumBookingAmount: form.minimumBookingAmount ? parseFloat(form.minimumBookingAmount) : null,
      usageLimit: parseInt(form.usageLimit, 10),
      expiryDate: apiExpiryDate,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
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
                {isEdit ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                {isEdit ? `Mã: ${data?.code}` : 'Thêm mã giảm giá áp dụng khi khách hàng đặt xe'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active transition-all cursor-pointer">
            <svg size={15} strokeWidth={2} className="mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-status-danger-bg border border-status-danger/15 rounded-xl text-status-danger text-sm flex items-center gap-2">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Mã giảm giá"
              required
              type="text"
              placeholder="E.g., SUMMER50"
              value={form.code}
              onChange={(v) => {
                setForm(prev => ({ ...prev, code: v.toUpperCase() }));
                setFieldErrors(prev => ({ ...prev, code: '' }));
              }}
              disabled={loading || isEdit} // Cannot edit code after creation
              error={fieldErrors.code}
            />

            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-text-secondary tracking-wide">
                Loại giảm giá <span className="text-status-danger">*</span>
              </label>
              <select
                className="w-full px-4 py-3 bg-surface-elevated border border-border-light rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 disabled:opacity-50 transition-all"
                value={form.discountType}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, discountType: e.target.value }));
                  setFieldErrors(prev => ({ ...prev, discountValue: '', maxDiscountAmount: '' }));
                }}
                disabled={loading}
                required
              >
                <option value="FIXED">Giá trị cố định (FIXED)</option>
                <option value="PERCENTAGE">Phần trăm (PERCENTAGE)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-text-secondary tracking-wide">
              Mô tả mã giảm giá
            </label>
            <textarea
              placeholder="Nhập mô tả chương trình ưu đãi..."
              className="w-full px-4 py-3 bg-surface-elevated border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 disabled:opacity-50 transition-all"
              rows={2}
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={form.discountType === 'PERCENTAGE' ? 'Giá trị giảm (%)' : 'Giá trị giảm (VNĐ)'}
              required
              type="number"
              placeholder={form.discountType === 'PERCENTAGE' ? '20' : '20000'}
              value={form.discountValue}
              onChange={(v) => {
                setForm(prev => ({ ...prev, discountValue: v }));
                setFieldErrors(prev => ({ ...prev, discountValue: '' }));
              }}
              disabled={loading}
              min={0}
              error={fieldErrors.discountValue}
            />

            <FormField
              label="Giảm tối đa (VNĐ)"
              required={form.discountType === 'PERCENTAGE'}
              type="number"
              placeholder={form.discountType === 'PERCENTAGE' ? '50000' : 'Không giới hạn'}
              value={form.maxDiscountAmount}
              onChange={(v) => {
                setForm(prev => ({ ...prev, maxDiscountAmount: v }));
                setFieldErrors(prev => ({ ...prev, maxDiscountAmount: '' }));
              }}
              disabled={loading || form.discountType === 'FIXED'}
              min={0}
              error={fieldErrors.maxDiscountAmount}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Giá trị đơn tối thiểu (VNĐ)"
              type="number"
              placeholder="E.g., 50000"
              value={form.minimumBookingAmount}
              onChange={(v) => setForm(prev => ({ ...prev, minimumBookingAmount: v }))}
              disabled={loading}
              min={0}
            />

            <FormField
              label="Ngày hết hạn"
              required
              type="datetime-local"
              value={form.expiryDate}
              onChange={(v) => {
                setForm(prev => ({ ...prev, expiryDate: v }));
                setFieldErrors(prev => ({ ...prev, expiryDate: '' }));
              }}
              disabled={loading}
              error={fieldErrors.expiryDate}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Giới hạn sử dụng (lượt)"
              required
              type="number"
              placeholder="100"
              value={form.usageLimit}
              onChange={(v) => {
                setForm(prev => ({ ...prev, usageLimit: v }));
                setFieldErrors(prev => ({ ...prev, usageLimit: '' }));
              }}
              disabled={loading}
              min={1}
              error={fieldErrors.usageLimit}
            />

            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl border border-border-light h-[56px] self-end mb-0.5">
              <div>
                <p className="text-[13px] font-semibold text-text-secondary">Trạng thái</p>
                <p className="text-[10px] text-text-muted mt-0.5">Hiệu lực khi bật</p>
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
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border-light">
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
              {loading ? 'Đang xử lý...' : isEdit ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoCodeFormModal;
