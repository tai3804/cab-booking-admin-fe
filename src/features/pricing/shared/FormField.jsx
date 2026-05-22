const FormField = ({ label, required, type = 'text', placeholder, value, onChange, disabled, min, max, step, error }) => (
  <div className="space-y-2">
    <label className="block text-[13px] font-semibold text-text-secondary tracking-wide">
      {label} {required && <span className="text-status-danger">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-surface-elevated border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 disabled:opacity-50 transition-all
        ${error
          ? 'border-status-danger/40 focus:border-status-danger/60 focus:ring-status-danger/20'
          : 'border-border-light focus:border-accent-primary/50 focus:ring-accent-primary/20'
        }`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      min={min}
      max={max}
      step={step}
    />
    {error && <p className="text-[11px] text-status-danger">{error}</p>}
  </div>
);

export default FormField;
