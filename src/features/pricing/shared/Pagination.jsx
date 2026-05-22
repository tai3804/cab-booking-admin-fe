import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const PageButton = ({ label, icon: Icon, disabled, onClick, currentPage }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[36px] h-9 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-1 border transition-all duration-200 cursor-pointer
      ${disabled
        ? 'text-text-muted border-border-light bg-transparent cursor-not-allowed opacity-40'
        : label === currentPage
          ? 'bg-accent-primary text-white border-accent-primary'
          : 'bg-surface-elevated text-text-secondary border-border-light hover:bg-surface-active hover:text-text-primary hover:border-border-medium'
      }`}
  >
    {Icon && <Icon size={13} strokeWidth={2} />}
    {typeof label === 'number' ? label : null}
  </button>
);

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 p-4 bg-surface border border-border-light rounded-xl">
      <p className="text-sm text-text-secondary">
        Hiển thị <span className="font-semibold text-text-primary">{startItem}</span>
        {' – '}<span className="font-semibold text-text-primary">{endItem}</span>
        {' trong tổng số '}<span className="font-semibold text-text-primary">{totalItems}</span> bản ghi
      </p>
      <div className="flex items-center gap-1.5">
        <PageButton icon={ChevronsLeft} onClick={() => onPageChange(1)} disabled={currentPage === 1} currentPage={currentPage} />
        <PageButton icon={ChevronLeft} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} currentPage={currentPage} />
        {getVisiblePages().map(page => (
          <PageButton key={page} label={page} onClick={() => onPageChange(page)} currentPage={currentPage} />
        ))}
        <PageButton icon={ChevronRight} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} currentPage={currentPage} />
        <PageButton icon={ChevronsRight} onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
};

export default Pagination;
