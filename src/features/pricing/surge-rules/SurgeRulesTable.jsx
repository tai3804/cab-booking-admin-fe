import { Eye, Pencil, Trash2, RefreshCw } from 'lucide-react';
import SourceBadge from './SourceBadge';
import { Pagination, EmptyState, LoadingRow } from '../shared';

const getSurgeColor = (multiplier) => {
  if (multiplier >= 2.5) return 'text-status-danger';
  if (multiplier >= 1.5) return 'text-status-warning';
  return 'text-status-success';
};

const ActionButtons = ({ rule, onView, onEdit, onDelete }) => (
  <div className="flex items-center justify-end gap-1.5">
    <button
      onClick={() => onView(rule)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-text-primary hover:bg-surface-active hover:border-border-medium transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Xem chi tiết"
    >
      <Eye size={14} strokeWidth={1.75} />
    </button>
    <button
      onClick={() => onEdit(rule)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-info hover:bg-status-info-bg hover:border-status-info/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Chỉnh sửa"
    >
      <Pencil size={14} strokeWidth={1.75} />
    </button>
    <button
      onClick={() => onDelete(rule)}
      className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-light text-text-muted hover:text-status-danger hover:bg-status-danger-bg hover:border-status-danger/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
      title="Xóa"
    >
      <Trash2 size={14} strokeWidth={1.75} />
    </button>
  </div>
);

const COLUMNS = ['Zone ID', 'Tên khu vực', 'Hệ số Surge', 'Tài xế hoạt động', 'Chuyến chờ', 'Nguồn', 'Cập nhật', ''];
const COL_SPAN = 7;

const SurgeRulesTable = ({
  rules,
  loading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onView,
  onEdit,
  onDelete,
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
            <LoadingRow colSpan={COL_SPAN} variant="surge" message="Đang tải quy tắc surge..." />
          ) : rules.length === 0 ? (
            <EmptyState message="Không tìm thấy quy tắc surge nào." />
          ) : (
            rules.map((rule, idx) => (
              <tr
                key={rule.id}
                className={`border-t border-border-light hover:bg-white/[0.02] transition-colors duration-150 ${idx === rules.length - 1 ? 'border-b-0' : ''}`}
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-text-primary">{rule.zoneId}</p>
                </td>
                <td className="px-5 py-4 text-sm text-text-secondary">{rule.zoneName || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-bold ${getSurgeColor(Number(rule.surgeMultiplier))}`}>
                    ×{Number(rule.surgeMultiplier).toFixed(2)}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-text-secondary whitespace-nowrap">{rule.activeDrivers ?? '—'}</td>
                <td className="px-5 py-4 text-sm text-text-secondary whitespace-nowrap">{rule.pendingRides ?? '—'}</td>
                <td className="px-5 py-4"><SourceBadge source={rule.source} /></td>
                <td className="px-5 py-4 text-sm text-text-muted whitespace-nowrap">
                  {rule.lastUpdated ? new Date(rule.lastUpdated).toLocaleDateString('vi-VN') : 'N/A'}
                </td>
                <td className="px-5 py-4">
                  <ActionButtons rule={rule} onView={onView} onEdit={onEdit} onDelete={onDelete} />
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

export default SurgeRulesTable;
