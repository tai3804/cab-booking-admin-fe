import { useEffect, useState, useRef } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import api from '../../../services/api';
import PricingConfigsTable from './PricingConfigsTable';
import ConfigDetailModal from './ConfigDetailModal';
import ConfigFormModal from './ConfigFormModal';
import { PricingStatsBar } from '../shared';

const PricingConfigsTab = ({ showCreateModal, onCloseCreateModal }) => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const fetchConfigsRef = useRef(null);

  useEffect(() => {
    fetchConfigsRef.current = () => {
      let cancelled = false;
      setLoading(true);
      api.get('/api/admin/pricing-configs')
        .then(res => { if (!cancelled) setConfigs(res.data.data || []); })
        .catch(() => { if (!cancelled) setConfigs([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };
    fetchConfigsRef.current();
    return () => { fetchConfigsRef.current = null; };
  }, []);

  const handleRefresh = () => fetchConfigsRef.current?.();

  const handleToggle = async (config) => {
    try {
      const res = await api.patch(`/api/admin/pricing-configs/${config.id}/toggle`);
      setConfigs(configs.map(c => c.id === config.id ? res.data.data : c));
    } catch {
      setConfigs(configs.map(c => c.id === config.id ? { ...c, active: !c.active } : c));
    }
  };

  const handleEdit = (config) => {
    setEditData(config);
    setIsEditModalOpen(true);
    setFormError('');
  };

  const handleDelete = async (config) => {
    if (!confirm(`Xóa cấu hình cước cho "${config.vehicleType}"?`)) return;
    try {
      await api.delete(`/api/admin/pricing-configs/${config.id}`);
      setConfigs(configs.filter(c => c.id !== config.id));
    } catch {
      handleRefresh();
    }
  };

  const handleConfigSubmit = async (form) => {
    setFormLoading(true);
    setFormError('');
    const payload = {
      vehicleType: form.vehicleType,
      baseFare: form.baseFare,
      perKmRate: form.perKmRate,
      perMinuteRate: form.perMinuteRate,
      multiplier: form.multiplier,
      active: form.active,
    };
    try {
      if (isEditModalOpen && editData) {
        await api.put(`/api/admin/pricing-configs/${editData.id}`, payload);
      } else {
        await api.post('/api/admin/pricing-configs', payload);
      }
      onCloseCreateModal?.();
      setIsEditModalOpen(false);
      setEditData(null);
      fetchConfigsRef.current();
    } catch (err) {
      if (err.response?.status === 409) {
        setFormError(`${form.vehicleType} đã tồn tại. Không thể tạo trùng loại xe.`);
      } else {
        setFormError(err.response?.data?.message || err.message || 'Lỗi khi lưu cấu hình cước.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const filteredConfigs = configs.filter(cfg => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (cfg.vehicleType || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? cfg.active : !cfg.active);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredConfigs.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConfigs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-5">
      <PricingStatsBar />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm theo loại xe..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-secondary focus:outline-none focus:border-accent-primary/50 cursor-pointer min-w-[160px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Không hoạt động</option>
        </select>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-medium transition-all duration-200 cursor-pointer"
        >
          <RefreshCw size={14} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Table */}
      <PricingConfigsTable
        configs={currentItems}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredConfigs.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onView={setSelectedConfig}
        onEdit={handleEdit}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <ConfigDetailModal config={selectedConfig} onClose={() => setSelectedConfig(null)} />
      <ConfigFormModal
        isOpen={showCreateModal}
        onClose={() => { onCloseCreateModal?.(); setFormError(''); }}
        mode="create"
        data={null}
        onSubmit={handleConfigSubmit}
        loading={formLoading}
        error={formError}
      />
      <ConfigFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditData(null); setFormError(''); }}
        mode="edit"
        data={editData}
        onSubmit={handleConfigSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
};

export default PricingConfigsTab;
