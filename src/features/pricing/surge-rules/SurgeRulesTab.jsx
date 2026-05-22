import { useEffect, useState, useRef } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import api from '../../../services/api';
import SurgeRulesTable from './SurgeRulesTable';
import SurgeDetailModal from './SurgeDetailModal';
import SurgeFormModal from './SurgeFormModal';
import { PricingStatsBar } from '../shared';

const SurgeRulesTab = ({ showCreateModal, onCloseCreateModal }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRule, setSelectedRule] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const fetchRulesRef = useRef(null);

  useEffect(() => {
    fetchRulesRef.current = () => {
      let cancelled = false;
      setLoading(true);
      api.get('/api/admin/surge-rules')
        .then(res => { if (!cancelled) setRules(res.data.data || []); })
        .catch(() => { if (!cancelled) setRules([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };
    fetchRulesRef.current();
    return () => { fetchRulesRef.current = null; };
  }, []);

  const handleRefresh = () => {
    fetchRulesRef.current?.();
    setStatsRefreshKey((k) => k + 1);
  };

  const handleEdit = (rule) => {
    setEditData(rule);
    setIsEditModalOpen(true);
    setFormError('');
  };

  const handleDelete = async (rule) => {
    if (!confirm(`Xóa quy tắt surge cho zone "${rule.zoneId}"?`)) return;
    try {
      await api.delete(`/api/admin/surge-rules/${rule.id}`);
      setRules(rules.filter(r => r.id !== rule.id));
      setStatsRefreshKey((k) => k + 1);
    } catch {
      handleRefresh();
    }
  };

  const handleRuleSubmit = async (form) => {
    setFormLoading(true);
    setFormError('');
    const payload = {
      zoneId: form.zoneId,
      zoneName: form.zoneName,
      surgeMultiplier: form.surgeMultiplier,
      latitude: form.latitude,
      longitude: form.longitude,
      radiusKm: form.radiusKm,
      activeDrivers: form.activeDrivers,
      pendingRides: form.pendingRides,
      minMultiplier: form.minMultiplier,
      maxMultiplier: form.maxMultiplier,
      source: form.source,
    };
    try {
      if (isEditModalOpen && editData) {
        await api.put(`/api/admin/surge-rules/${editData.id}`, payload);
      } else {
        await api.post('/api/admin/surge-rules', payload);
      }
      onCloseCreateModal?.();
      setIsEditModalOpen(false);
      setEditData(null);
      fetchRulesRef.current();
      setStatsRefreshKey((k) => k + 1);
    } catch (err) {
      if (err.response?.status === 409) {
        setFormError(`Zone "${form.zoneId}" đã tồn tại. Không thể tạo trùng zone.`);
      } else {
        setFormError(err.response?.data?.message || err.message || 'Lỗi khi lưu quy tắt surge.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const filteredRules = rules.filter(rule => {
    const q = searchQuery.toLowerCase();
    return (rule.zoneId || '').toLowerCase().includes(q) || (rule.zoneName || '').toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredRules.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRules.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-5">
      <PricingStatsBar refreshKey={statsRefreshKey} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm theo zone ID hoặc tên khu vực..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-status-warning/50 focus:ring-1 focus:ring-status-warning/20 transition-all"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-medium transition-all duration-200 cursor-pointer"
        >
          <RefreshCw size={14} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Table */}
      <SurgeRulesTable
        rules={currentItems}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredRules.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onView={setSelectedRule}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <SurgeDetailModal rule={selectedRule} onClose={() => setSelectedRule(null)} />
      <SurgeFormModal
        isOpen={showCreateModal}
        onClose={() => { onCloseCreateModal?.(); setFormError(''); }}
        mode="create"
        data={null}
        onSubmit={handleRuleSubmit}
        loading={formLoading}
        error={formError}
      />
      <SurgeFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditData(null); setFormError(''); }}
        mode="edit"
        data={editData}
        onSubmit={handleRuleSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
};

export default SurgeRulesTab;
