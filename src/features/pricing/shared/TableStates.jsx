const EmptyState = ({ icon: Icon, message }) => (
  <tr>
    <td colSpan="100%" className="px-5 py-16 text-center text-sm text-text-secondary">
      <div className="flex flex-col items-center gap-3">
        {Icon && <Icon size={24} strokeWidth={1.5} className="text-text-muted" />}
        <span>{message}</span>
      </div>
    </td>
  </tr>
);

const LoadingRow = ({ colSpan, variant, message }) => (
  <tr>
    <td colSpan={colSpan} className="px-5 py-16 text-center text-sm text-text-secondary">
      <div className="flex flex-col items-center gap-3">
        <div className={`w-7 h-7 border-2 rounded-full animate-spin ${variant === 'surge' ? 'border-status-warning/25 border-t-status-warning' : 'border-accent-primary/25 border-t-accent-primary'}`} />
        <span>{message}</span>
      </div>
    </td>
  </tr>
);

const TableSpinner = ({ variant = 'configs' }) => (
  <div className={`w-7 h-7 border-2 rounded-full animate-spin ${variant === 'surge' ? 'border-status-warning/25 border-t-status-warning' : 'border-accent-primary/25 border-t-accent-primary'}`} />
);

export { EmptyState, LoadingRow, TableSpinner };
