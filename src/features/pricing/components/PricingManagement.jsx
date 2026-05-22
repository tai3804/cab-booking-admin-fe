import { useState } from 'react';
import { DollarSign, Zap, Plus } from 'lucide-react';
import PricingConfigsTab from '../pricing-configs/PricingConfigsTab';
import SurgeRulesTab from '../surge-rules/SurgeRulesTab';

const PricingManagement = () => {
  const [activeTab, setActiveTab] = useState('configs');
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-5">
      {/* Tab Bar + Add Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 p-1.5 bg-surface border border-border-light rounded-xl">
          <button
            onClick={() => setActiveTab('configs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'configs'
                ? 'bg-accent-primary text-white shadow-accent'
                : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
            }`}
          >
            <DollarSign size={15} strokeWidth={2} />
            Cấu hình cước
          </button>
          <button
            onClick={() => setActiveTab('surge')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'surge'
                ? 'bg-status-warning text-white shadow-accent'
                : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
            }`}
          >
            <Zap size={15} strokeWidth={2} />
            Quy tắc Surge
          </button>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className={`flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-accent hover:shadow-accent-hover transition-all duration-200 cursor-pointer ${
            activeTab === 'configs'
              ? 'bg-accent-primary hover:bg-accent-hover'
              : 'bg-status-warning hover:bg-status-warning/90'
          }`}
        >
          <Plus size={15} strokeWidth={2} />
          <span>{activeTab === 'configs' ? 'Thêm cấu hình' : 'Thêm quy tắc'}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'configs'
        ? <PricingConfigsTab showCreateModal={showCreateModal} onCloseCreateModal={() => setShowCreateModal(false)} />
        : <SurgeRulesTab showCreateModal={showCreateModal} onCloseCreateModal={() => setShowCreateModal(false)} />
      }
    </div>
  );
};

export default PricingManagement;
