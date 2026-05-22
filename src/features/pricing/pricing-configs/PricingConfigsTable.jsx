import { Eye, Pencil, Trash2, ToggleLeft, RefreshCw } from 'lucide-react';
import { Pagination, StatusBadge, EmptyState, LoadingRow, TableSpinner } from '../shared';

const vehicleTypeLabel = (type) => ({
  BIKE: 'Xe máy', CAR4: 'Ô tô 4 chỗ', CAR7: 'Ô tô 7 chỗ',
}[type] || type);

const ActionButtons = ({ config, onView, onEdit, onToggle, onDelete }) => (
  <div className="flex items-center justify-end gap-1.5">
    <button
      onClick={() => onView(config)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active hover:border-border-medium transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Xem chi tiết"
    >
      <Eye size={14} strokeWidth={1.75} />
    </button>
    <button
      onClick={() => onEdit(config)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-info hover:bg-status-info-bg hover:border-status-info/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Chỉnh sửa"
    >
      <Pencil size={14} strokeWidth={1.75} />
    </button>
    <button
      onClick={() => onToggle(config)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-success hover:bg-status-success-bg hover:border-status-success/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
      title={config.active ? 'Tắt kích hoạt' : 'Kích hoạt'}
    >
      {config.active
        ? <ToggleLeft size={14} strokeWidth={1.75} />
        : <svg size={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      }
    </button>
    <button
      onClick={() => onDelete(config)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-danger hover:bg-status-danger-bg hover:border-status-danger/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Xóa"
    >
      <Trash2 size={14} strokeWidth={1.75} />
    </button>
  </div>
);

const COLUMNS = ['Loại xe', 'Cước cơ bản', 'Giá / km', 'Giá / phút', 'Hệ số nhân', 'Trạng thái', 'Cập nhật', ''];
const COL_SPAN = 7;

const PricingConfigsTable = ({
  configs,
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
  loadingSpinner,
}) => (
  <div className="bg-surface border border-border-light rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-elevated">
            {COLUMNS.map((th, i) => (
              <th
                key={i}
                className={`px-5 py-3.5 text-[11px] font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap
                  ${i === 0 ? 'rounded-tl-xl' : ''} ${i === COL_SPAN ? 'rounded-tr-xl text-right' : ''}`}
              >
                {th}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <LoadingRow colSpan={COL_SPAN} variant="configs" message="Đang tải cấu hình cước..." />
          ) : configs.length === 0 ? (
            <EmptyState message="Không tìm thấy cấu hình cước nào." />
          ) : (
            configs.map((cfg, idx) => (
              <tr
                key={cfg.id}
                className={`border-t border-border-light hover:bg-white/[0.02] transition-colors duration-150 ${idx === configs.length - 1 ? 'border-b-0' : ''}`}
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-text-primary">{vehicleTypeLabel(cfg.vehicleType)}</p>
                  <p className="text-[11px] text-text-muted">{cfg.vehicleType}</p>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-text-primary whitespace-nowrap">{cfg.baseFare?.toLocaleString('vi-VN')} đ</td>
                <td className="px-5 py-4 text-sm text-text-secondary whitespace-nowrap">{cfg.perKmRate?.toLocaleString('vi-VN')} đ</td>
                <td className="px-5 py-4 text-sm text-text-secondary whitespace-nowrap">{cfg.perMinuteRate?.toLocaleString('vi-VN')} đ</td>
                <td className="px-5 py-4 text-sm font-medium text-status-warning whitespace-nowrap">×{cfg.multiplier}</td>
                <td className="px-5 py-4"><StatusBadge status={cfg.active} /></td>
                <td className="px-5 py-4 text-sm text-text-muted whitespace-nowrap">{cfg.updatedAt ? new Date(cfg.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td className="px-5 py-4">
                  <ActionButtons config={cfg} onView={onView} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    {totalItems > 0 && (
      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={onPageChange} />
    )}
  </div>
);

export default PricingConfigsTable;
