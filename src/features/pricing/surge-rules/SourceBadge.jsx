const SourceBadge = ({ source }) => {
  const config = {
    MANUAL: { label: 'Thủ công', color: 'text-status-info' },
    AUTOMATIC: { label: 'Tự động', color: 'text-status-success' },
    EVENT_BASED: { label: 'Sự kiện', color: 'text-status-warning' },
  };
  const { label, color } = config[source?.toUpperCase()] || { label: source || 'N/A', color: 'text-text-muted' };
  return <span className={`text-[12px] font-medium ${color}`}>{label}</span>;
};

export default SourceBadge;
