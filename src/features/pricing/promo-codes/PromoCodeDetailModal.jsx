import { Calendar, Tag, ShieldAlert, Award, FileText, CheckCircle2, XCircle } from 'lucide-react';

const PromoCodeDetailModal = ({ promo, onClose }) => {
  if (!promo) return null;

  const isExpired = new Date(promo.expiryDate) < new Date();
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-border-light rounded-2xl shadow-card-hover animate-scale-up overflow-hidden">
        <div className="gold-divider" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light bg-gradient-to-r from-accent-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/8 border border-accent-primary/20 flex items-center justify-center">
              <Tag size={17} className="text-accent-hover" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Chi tiết mã giảm giá</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Thông tin chi tiết cấu hình và thống kê</p>
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Promo code badge */}
          <div className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-2xl border border-dashed border-border-medium text-center">
            <span className="px-5 py-2 bg-accent-primary/10 border border-accent-primary/30 rounded-xl text-lg font-bold text-accent-hover tracking-wider">
              {promo.code}
            </span>
            {promo.description && (
              <p className="text-xs text-text-secondary mt-3 font-medium px-4">{promo.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-elevated rounded-xl border border-border-light space-y-1">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Loại giảm giá</span>
              <span className="text-sm font-semibold text-text-primary">
                {promo.discountType === 'PERCENTAGE' ? 'Giảm theo %' : 'Khấu trừ cố định'}
              </span>
            </div>

            <div className="p-3 bg-surface-elevated rounded-xl border border-border-light space-y-1">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Mức giảm giá</span>
              <span className="text-sm font-semibold text-text-primary">
                {promo.discountType === 'PERCENTAGE' 
                  ? `${promo.discountValue}%` 
                  : `${promo.discountValue?.toLocaleString('vi-VN')} đ`
                }
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-border-light pb-1">Điều kiện áp dụng</h4>
            
            <div className="space-y-2.5">
              {promo.discountType === 'PERCENTAGE' && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <ShieldAlert size={14} className="text-text-muted" />
                    <span>Giảm tối đa</span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {promo.maxDiscountAmount ? `${promo.maxDiscountAmount.toLocaleString('vi-VN')} đ` : 'Không giới hạn'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Award size={14} className="text-text-muted" />
                  <span>Đơn tối thiểu</span>
                </div>
                <span className="font-semibold text-text-primary">
                  {promo.minimumBookingAmount ? `${promo.minimumBookingAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar size={14} className="text-text-muted" />
                  <span>Hạn sử dụng</span>
                </div>
                <span className={`font-semibold ${isExpired ? 'text-status-danger' : 'text-text-primary'}`}>
                  {formatDate(promo.expiryDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-border-light pb-1">Trạng thái & Lượt dùng</h4>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <FileText size={14} className="text-text-muted" />
                  <span>Giới hạn sử dụng</span>
                </div>
                <span className="font-semibold text-text-primary">
                  {promo.usedCount ?? 0} / {promo.usageLimit} lượt
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  {promo.active ? <CheckCircle2 size={14} className="text-status-success" /> : <XCircle size={14} className="text-status-danger" />}
                  <span>Kích hoạt hệ thống</span>
                </div>
                <span className={`font-semibold ${promo.active ? 'text-status-success' : 'text-status-danger'}`}>
                  {promo.active ? 'Hoạt động' : 'Đã khóa'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle2 size={14} className="text-text-muted" />
                  <span>Tình trạng mã</span>
                </div>
                {isExpired ? (
                  <span className="px-2 py-0.5 text-xs font-semibold text-status-danger bg-status-danger-bg border border-status-danger/10 rounded-md">
                    Đã hết hạn
                  </span>
                ) : !promo.active ? (
                  <span className="px-2 py-0.5 text-xs font-semibold text-text-muted bg-surface-elevated border border-border-medium rounded-md">
                    Vô hiệu hóa
                  </span>
                ) : (promo.usedCount >= promo.usageLimit) ? (
                  <span className="px-2 py-0.5 text-xs font-semibold text-status-warning bg-status-warning/10 border border-status-warning/20 rounded-md">
                    Hết lượt dùng
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold text-status-success bg-status-success-bg border border-status-success/15 rounded-md">
                    Đang khả dụng
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-light grid grid-cols-2 gap-2 text-[10px] text-text-muted">
            <div>Tạo lúc: {formatDate(promo.createdAt)}</div>
            <div className="text-right">Cập nhật: {formatDate(promo.updatedAt)}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-elevated border-t border-border-light flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-border-light rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface-active hover:text-text-primary transition-all cursor-pointer shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeDetailModal;
