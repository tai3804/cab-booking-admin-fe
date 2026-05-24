import { Eye, Pencil, Trash2, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { Pagination, EmptyState, LoadingRow } from '../shared';

const ActionButtons = ({ promo, onView, onEdit, onToggle, onDelete }) => (
  <div className="flex items-center justify-end gap-1.5">
    <button
      onClick={() => onView(promo)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active hover:border-border-medium transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Xem chi tiết"
    >
      <Eye size={14} strokeWidth={1.75} />
    </button>
    <button
      onClick={() => onEdit(promo)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-info hover:bg-status-info-bg hover:border-status-info/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Chỉnh sửa"
    >
      <Pencil size={14} strokeWidth={1.75} />
    </button>
    <button
      onClick={() => onToggle(promo)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-success hover:bg-status-success-bg hover:border-status-success/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
      title={promo.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
    >
      {promo.active ? (
        <ToggleRight size={14} strokeWidth={1.75} className="text-status-success" />
      ) : (
        <ToggleLeft size={14} strokeWidth={1.75} />
      )}
    </button>
    <button
      onClick={() => onDelete(promo)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-danger hover:bg-status-danger-bg hover:border-status-danger/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Xóa"
    >
      <Trash2 size={14} strokeWidth={1.75} />
    </button>
  </div>
);

const getPromoStatus = (promo) => {
  const isExpired = new Date(promo.expiryDate) < new Date();
  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-status-danger">
        <span className="w-1.5 h-1.5 rounded-full bg-status-danger" />
        Hết hạn
      </span>
    );
  }
  if (!promo.active) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
        Đã khóa
      </span>
    );
  }
  if (promo.usedCount >= promo.usageLimit) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-status-warning">
        <span className="w-1.5 h-1.5 rounded-full bg-status-warning" />
        Hết lượt
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-status-success">
      <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
      Hoạt động
    </span>
  );
};

const COLUMNS = [
  'Mã giảm giá',
  'Mô tả',
  'Loại giảm giá',
  'Mức giảm',
  'Lượt dùng (Đã dùng/Hạn mức)',
  'Hạn sử dụng',
  'Trạng thái',
  ''
];
const COL_SPAN = COLUMNS.length;

const PromoCodesTable = ({
  promos,
  loading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onView,
  onEdit,
  onToggle,
  onDelete,
}) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-surface border border-border-light rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-elevated">
              {COLUMNS.map((th, i) => (
                <th
                  key={i}
                  className={`px-5 py-3.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap
                    ${i === 0 ? 'rounded-tl-xl' : ''} ${i === COL_SPAN - 1 ? 'rounded-tr-xl text-right' : ''}`}
                >
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingRow colSpan={COL_SPAN} variant="configs" message="Đang tải danh sách mã giảm giá..." />
            ) : promos.length === 0 ? (
              <EmptyState message="Không tìm thấy mã giảm giá nào." />
            ) : (
              promos.map((promo, idx) => (
                <tr
                  key={promo.id}
                  className={`border-t border-border-light hover:bg-black/[0.01] transition-colors duration-150 ${
                    idx === promos.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  {/* Code */}
                  <td className="px-5 py-4">
                    <span className="px-3 py-1.5 bg-accent-primary/10 border border-accent-primary/20 rounded-lg text-xs font-bold text-accent-hover whitespace-nowrap tracking-wide">
                      {promo.code}
                    </span>
                  </td>
                  
                  {/* Description */}
                  <td className="px-5 py-4 max-w-[200px] truncate text-sm text-text-secondary" title={promo.description}>
                    {promo.description || <span className="text-text-muted italic">Không có mô tả</span>}
                  </td>
                  
                  {/* Type */}
                  <td className="px-5 py-4 text-xs font-medium text-text-secondary">
                    {promo.discountType === 'PERCENTAGE' ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md">
                        Phần trăm (%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-md">
                        Cố định (đ)
                      </span>
                    )}
                  </td>
                  
                  {/* Value */}
                  <td className="px-5 py-4 text-sm font-semibold text-text-primary whitespace-nowrap">
                    {promo.discountType === 'PERCENTAGE' ? (
                      <div>
                        <div>{promo.discountValue}%</div>
                        {promo.maxDiscountAmount && (
                          <div className="text-[10px] text-text-muted font-normal mt-0.5">
                            Tối đa: {promo.maxDiscountAmount.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </div>
                    ) : (
                      `${promo.discountValue?.toLocaleString('vi-VN')} đ`
                    )}
                  </td>
                  
                  {/* Usage count */}
                  <td className="px-5 py-4 text-sm text-text-secondary whitespace-nowrap">
                    <div className="font-semibold">
                      {promo.usedCount || 0} <span className="font-normal text-text-muted">/ {promo.usageLimit}</span>
                    </div>
                    {/* Tiny progress bar */}
                    <div className="w-24 bg-border-light h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (promo.usedCount || 0) >= promo.usageLimit 
                            ? 'bg-status-warning' 
                            : 'bg-accent-primary'
                        }`}
                        style={{ width: `${Math.min(100, (((promo.usedCount || 0) / promo.usageLimit) * 100))}%` }}
                      />
                    </div>
                  </td>
                  
                  {/* Expiry */}
                  <td className="px-5 py-4 text-sm text-text-secondary whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-text-muted" />
                      <span className={new Date(promo.expiryDate) < new Date() ? 'text-status-danger font-medium' : ''}>
                        {formatDate(promo.expiryDate)}
                      </span>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="px-5 py-4">
                    {getPromoStatus(promo)}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-5 py-4">
                    <ActionButtons
                      promo={promo}
                      onView={onView}
                      onEdit={onEdit}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default PromoCodesTable;
