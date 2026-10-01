import React from 'react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeCritCount?: number;
  reviewPendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeCritCount = 14,
  reviewPendingCount = 38,
}) => {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#0a0e16] border-r border-[#262a33] z-40 flex flex-col justify-between py-3 px-2">
      <div className="flex flex-col gap-4">
        {/* Operational Triage Header & Metrics */}
        <div className="px-2 flex flex-col gap-1.5">
          <span className="font-badge-label text-[#8c909f] uppercase tracking-wider">
            Operational Triage
          </span>
          <div className="p-2 rounded bg-[#181c24] border border-[#262a33] flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="font-mono-sm text-[#c2c6d6]">Active Threats</span>
              <span className="font-mono-sm text-[#ffb3ad] font-bold">
                {activeCritCount} CRIT
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono-sm text-[#c2c6d6]">Review Queue</span>
              <span className="font-mono-sm text-[#4edea3] font-semibold">
                {reviewPendingCount} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Workspaces Navigation */}
        <nav className="flex flex-col gap-1">
          <span className="px-2 font-badge-label text-[#8c909f] uppercase tracking-wider mb-1">
            Workspaces
          </span>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-[#1c2028] text-[#adc6ff] font-semibold border-l-2 border-[#adc6ff]'
                : 'text-[#c2c6d6] hover:bg-[#262a33] hover:text-[#dfe2ee]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
            <span className="font-body-md">SOC Overview</span>
          </button>

          <button
            onClick={() => onSelectTab('investigate')}
            className={`flex items-center gap-2 px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'investigate'
                ? 'bg-[#1c2028] text-[#adc6ff] font-semibold border-l-2 border-[#adc6ff]'
                : 'text-[#c2c6d6] hover:bg-[#262a33] hover:text-[#dfe2ee]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">radar</span>
            <span className="font-body-md">Graph Intelligence</span>
          </button>

          <button
            onClick={() => onSelectTab('accounts')}
            className={`flex items-center gap-2 px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'accounts'
                ? 'bg-[#1c2028] text-[#adc6ff] font-semibold border-l-2 border-[#adc6ff]'
                : 'text-[#c2c6d6] hover:bg-[#262a33] hover:text-[#dfe2ee]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">account_tree</span>
            <span className="font-body-md">Account Ledgers</span>
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`flex items-center gap-2 px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
              currentTab === 'reports'
                ? 'bg-[#1c2028] text-[#adc6ff] font-semibold border-l-2 border-[#adc6ff]'
                : 'text-[#c2c6d6] hover:bg-[#262a33] hover:text-[#dfe2ee]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">assignment</span>
            <span className="font-body-md">Forensic Dossiers</span>
          </button>
        </nav>
      </div>

      {/* Enclave Security Status Bottom Widget */}
      <div className="px-2.5 py-2 rounded bg-[#181c24] border border-[#262a33] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#8c909f] text-lg">shield</span>
          <div className="flex flex-col">
            <span className="font-mono-sm text-[#dfe2ee]">Enclave Secure</span>
            <span className="font-badge-label text-[#8c909f]">EAL6+ ISOLATED</span>
          </div>
        </div>
        <span className="material-symbols-outlined text-[#4edea3] text-base">lock</span>
      </div>
    </aside>
  );
};
