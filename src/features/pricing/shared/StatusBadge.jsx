import { ToggleLeft, ToggleRight } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const isActive = status === true || status === 'ACTIVE' || status === 'active';
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary">
      <span className={`status-dot ${isActive ? 'bg-status-success' : 'bg-text-muted'}`} />
      {isActive ? 'Hoạt động' : 'Không hoạt động'}
    </span>
  );
};

const ToggleBadge = ({ isActive }) => (
  isActive
    ? <ToggleRight size={14} strokeWidth={1.75} className="text-status-success" />
    : <ToggleLeft size={14} strokeWidth={1.75} />
);

export { StatusBadge, ToggleBadge };
