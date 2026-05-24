import { useEffect, useState, useRef } from 'react';
import { Search, RefreshCw, Tag, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../../../services/api';
import PromoCodesTable from './PromoCodesTable';
import PromoCodeDetailModal from './PromoCodeDetailModal';
import PromoCodeFormModal from './PromoCodeFormModal';

const PromoCodesTab = ({ showCreateModal, onCloseCreateModal }) => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const fetchPromosRef = useRef(null);

  useEffect(() => {
    fetchPromosRef.current = () => {
      let cancelled = false;
      setLoading(true);
      api.get('/api/v1/admin/promo-codes')
        .then(res => {
          if (!cancelled) {
            setPromos(res.data.data || []);
          }
        })
        .catch((err) => {
          console.error("Lỗi tải danh sách mã giảm giá:", err);
          if (!cancelled) setPromos([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };
    fetchPromosRef.current();
    return () => {
      fetchPromosRef.current = null;
    };
  }, []);

  const handleRefresh = () => {
    fetchPromosRef.current?.();
  };

  const handleToggle = async (promo) => {
    // Optimistic update
    const previousState = promo.active;
    setPromos(promos.map(p => p.id === promo.id ? { ...p, active: !p.active } : p));
    
    try {
      const payload = {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        maxDiscountAmount: promo.maxDiscountAmount,
        minimumBookingAmount: promo.minimumBookingAmount,
        expiryDate: promo.expiryDate,
        usageLimit: promo.usageLimit,
        active: !promo.active,
      };
      
      const res = await api.put(`/api/v1/admin/promo-codes/${promo.id}`, payload);
      setPromos(promos.map(p => p.id === promo.id ? res.data.data : p));
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      // Revert on error
      setPromos(promos.map(p => p.id === promo.id ? { ...p, active: previousState } : p));
    }
  };

  const handleEdit = (promo) => {
    setEditData(promo);
    setIsEditModalOpen(true);
    setFormError('');
  };

  const handleDelete = async (promo) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${promo.code}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/promo-codes/${promo.id}`);
      setPromos(promos.filter(p => p.id !== promo.id));
    } catch (err) {
      console.error("Lỗi khi xóa mã giảm giá:", err);
      handleRefresh();
    }
  };

  const handlePromoSubmit = async (form) => {
    setFormLoading(true);
    setFormError('');
    try {
      if (isEditModalOpen && editData) {
        await api.put(`/api/v1/admin/promo-codes/${editData.id}`, form);
      } else {
        await api.post('/api/v1/admin/promo-codes', form);
      }
      onCloseCreateModal?.();
      setIsEditModalOpen(false);
      setEditData(null);
      fetchPromosRef.current();
    } catch (err) {
      console.error("Lỗi khi lưu mã giảm giá:", err);
      if (err.response?.status === 409) {
        setFormError(`Mã giảm giá "${form.code}" đã tồn tại trên hệ thống.`);
      } else {
        setFormError(err.response?.data?.message || err.message || 'Lỗi khi lưu mã giảm giá.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Filter logic
  const filteredPromos = promos.filter(promo => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (promo.code || '').toLowerCase().includes(q) || 
                          (promo.description || '').toLowerCase().includes(q);
    
    const isExpired = new Date(promo.expiryDate) < new Date();
    const isOutOfUsage = (promo.usedCount || 0) >= promo.usageLimit;
    
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') {
      matchesStatus = promo.active && !isExpired && !isOutOfUsage;
    } else if (statusFilter === 'LOCKED') {
      matchesStatus = !promo.active && !isExpired;
    } else if (statusFilter === 'EXPIRED') {
      matchesStatus = isExpired;
    } else if (statusFilter === 'OUT_OF_USAGE') {
      matchesStatus = isOutOfUsage && !isExpired;
    }

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredPromos.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPromos.slice(indexOfFirstItem, indexOfLastItem);

  // Stats calculation
  const totalCount = promos.length;
  const activeCount = promos.filter(p => p.active && new Date(p.expiryDate) >= new Date() && (p.usedCount || 0) < p.usageLimit).length;
  const lockedCount = promos.filter(p => !p.active && new Date(p.expiryDate) >= new Date()).length;
  const expiredCount = promos.filter(p => new Date(p.expiryDate) < new Date()).length;

  return (
    <div className="space-y-6">
      {/* Mini Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-border-light rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/8 flex items-center justify-center text-accent-primary">
            <Tag size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Tổng số mã</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-border-light rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-status-success/8 flex items-center justify-center text-status-success">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-border-light rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-text-muted border border-border-light">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Đang bị khóa</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">{lockedCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-border-light rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-status-danger/8 flex items-center justify-center text-status-danger">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Đã hết hạn</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">{expiredCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white border border-border-light rounded-2xl p-3 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc mô tả..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-secondary focus:outline-none focus:border-accent-primary/50 cursor-pointer min-w-[180px]"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="LOCKED">Đang khóa</option>
          <option value="EXPIRED">Đã hết hạn</option>
          <option value="OUT_OF_USAGE">Hết lượt dùng</option>
        </select>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-medium transition-all duration-200 cursor-pointer ms-auto sm:ms-0"
        >
          <RefreshCw size={14} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Table */}
      <PromoCodesTable
        promos={currentItems}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPromos.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onView={setSelectedPromo}
        onEdit={handleEdit}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <PromoCodeDetailModal promo={selectedPromo} onClose={() => setSelectedPromo(null)} />
      
      <PromoCodeFormModal
        isOpen={showCreateModal}
        onClose={() => {
          onCloseCreateModal?.();
          setFormError('');
        }}
        mode="create"
        data={null}
        onSubmit={handlePromoSubmit}
        loading={formLoading}
        error={formError}
      />

      <PromoCodeFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditData(null);
          setFormError('');
        }}
        mode="edit"
        data={editData}
        onSubmit={handlePromoSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
};

export default PromoCodesTab;
