import React, { useState, useEffect, useMemo } from 'react';
import { InvestigationAccount } from '../types/soc';

interface DashboardViewProps {
  accounts: InvestigationAccount[];
  onOpenAccount: (account: InvestigationAccount) => void;
  onSearchAccount: (query: string) => void;
  onShowToast: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  onOpenAccount,
  onSearchAccount,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'l1' | 'review'>('all');
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(15);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; time: string; rate: number } | null>(null);

  // Auto-refresh countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    onShowToast(`Copied ${id} to clipboard`);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      onShowToast('Please enter an Account ID or filter term');
      return;
    }

    onSearchAccount(query);
  };

  const handleQuickQuery = (term: string) => {
    setSearchQuery(term);
    onSearchAccount(term);
  };

  // Filtered accounts based on table filter pill
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (filterType === 'critical') {
        return acc.riskLevel === 'CRITICAL' || acc.riskLevel === 'HIGH';
      }
      if (filterType === 'l1') {
        return acc.layer === 'L1 Ingress';
      }
      if (filterType === 'review') {
        return acc.status === 'Review' || acc.status === 'Investigating';
      }
      return true;
    });
  }, [accounts, filterType]);

  const exportTableData = () => {
    const jsonStr = JSON.stringify(filteredAccounts, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investigations_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported investigation records (JSON)');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-6 space-y-6">
        {/* Top Telemetry & Investigation Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#262a33] text-[#adc6ff] font-badge-label uppercase">
                LIVE TRIAGE CONSOLE
              </span>
              <span className="font-mono-sm text-[#8c909f]">SESSION // #SOC-9921-X</span>
            </div>
            <h1 className="font-headline-xl text-[#dfe2ee] font-bold tracking-tight">
              Cyber Fraud Investigation Dashboard
            </h1>
            <p className="font-body-md text-[#c2c6d6]">
              Monitor suspicious accounts, transaction activity and risk indicators across nested settlement ledgers.
            </p>
          </div>

          {/* Operational Telemetry Chips */}
          <div className="flex flex-wrap items-center gap-1 bg-[#0a0e16] p-1.5 rounded-lg border border-[#262a33] shadow-sm">
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#ff5451]/15 text-[#ffb3ad] border border-[#ff5451]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5451] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5451]"></span>
              </span>
              <span className="font-badge-label uppercase tracking-wider font-semibold">
                Threat Level: ELEVATED
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#181c24] text-[#dfe2ee]">
              <span className="material-symbols-outlined text-[#4edea3] text-sm">memory</span>
              <span className="font-mono-sm">DuckDB Engine Active</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#181c24] text-[#8c909f]">
              <span className="material-symbols-outlined text-xs animate-spin" style={{ animationDuration: '4s' }}>
                sync
              </span>
              <span className="font-mono-sm tabular-nums">Auto-refresh: {refreshCountdown}s</span>
            </div>
          </div>
        </div>

        {/* Prominent Account Search Section */}
        <div className="relative bg-[#181c24] p-4 rounded-xl shadow-md border border-[#262a33] overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#adc6ff]/5 to-transparent pointer-events-none"></div>
          <div className="flex flex-col gap-3 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-[#adc6ff] font-headline-md font-semibold">
                  <span className="material-symbols-outlined text-base">manage_search</span>
                  <span>Investigate an Account</span>
                </div>
                <p className="font-body-sm text-[#c2c6d6]">
                  Query real-time ledger layers and behavioral risk signatures directly across graph entities.
                </p>
              </div>

              {/* Quick Query Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-badge-label text-[#8c909f] uppercase">Quick Query:</span>
                <button
                  type="button"
                  onClick={() => handleQuickQuery('ACC001')}
                  className="px-2 py-0.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-mono-sm transition-colors cursor-pointer border border-[#31353e]"
                >
                  ACC001
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickQuery('ACC105')}
                  className="px-2 py-0.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-mono-sm transition-colors cursor-pointer border border-[#31353e]"
                >
                  ACC105
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickQuery('FLAGGED_HIGH')}
                  className="px-2 py-0.5 rounded bg-[#93000a]/40 hover:bg-[#93000a]/70 text-[#ffb4ab] font-mono-sm transition-colors cursor-pointer border border-[#ffb4ab]/30"
                >
                  High Risk Queue
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8c909f]">
                  <span className="material-symbols-outlined text-lg">fingerprint</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Account ID (e.g. ACC001, ACC024, ACC105)..."
                  className="w-full pl-10 pr-12 py-2.5 bg-[#0a0e16] text-[#dfe2ee] font-mono-md rounded-lg border border-[#262a33] focus:outline-none focus:ring-1 focus:ring-[#adc6ff] placeholder:text-[#8c909f] transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded bg-[#262a33] text-[#8c909f] font-mono-sm">⌘K</span>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#adc6ff] text-[#002e6a] font-headline-md font-semibold hover:bg-[#4d8eff] hover:text-[#00285d] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-base">search</span>
                <span>SEARCH</span>
                <span className="font-mono-sm px-1.5 py-0.5 rounded bg-[#002e6a]/20 text-[#002e6a]">
                  ↵ Return
                </span>
              </button>
            </form>

            <div className="flex items-center justify-between text-[#8c909f] font-mono-sm pt-1">
              <div className="flex items-center gap-3">
                <span>
                  Filter Syntax: <span className="text-[#dfe2ee]">layer:L1</span>,{' '}
                  <span className="text-[#dfe2ee]">score:&gt;80</span>
                </span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">
                  DuckDB Index: <span className="text-[#4edea3]">Optimal (14.8M tx/sec)</span>
                </span>
              </div>
              <span className="text-[#8c909f]">Latency: ~3.8ms</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Stat Card 1 */}
          <div className="bg-[#181c24] p-3 rounded-lg border border-[#262a33] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-[#1c2028] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-badge-label text-[#8c909f] uppercase tracking-wider">Total Accounts</span>
              <span className="material-symbols-outlined text-[#adc6ff] text-lg">dataset</span>
            </div>
            <div className="my-2 flex items-baseline justify-between">
              <span className="font-metric-display text-[#dfe2ee]">12,480</span>
              <span className="flex items-center text-[#4edea3] font-mono-sm bg-[#00a572]/20 px-1.5 py-0.5 rounded border border-[#00a572]/30">
                <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span>+4.2%
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8c909f] font-body-sm">
              <span>24h Baseline</span>
              <span className="font-mono-sm text-[#c2c6d6]">Synchronized</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#adc6ff]/30"></div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-[#181c24] p-3 rounded-lg border border-[#262a33] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-[#1c2028] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-badge-label text-[#8c909f] uppercase tracking-wider">High Risk Accounts</span>
              <span className="material-symbols-outlined text-[#ffb3ad] text-lg">warning</span>
            </div>
            <div className="my-2 flex items-baseline justify-between">
              <span className="font-metric-display text-[#ffb3ad] font-bold">342</span>
              <span className="flex items-center text-[#ffb4ab] font-badge-label bg-[#ff5451]/30 px-1.5 py-0.5 rounded uppercase font-semibold border border-[#ff5451]/40">
                CRITICAL
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8c909f] font-body-sm">
              <span className="text-[#ffb3ad]">Immediate triage required</span>
              <span className="font-mono-sm text-[#ffb3ad] font-semibold">+18 today</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5451]"></div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-[#181c24] p-3 rounded-lg border border-[#262a33] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-[#1c2028] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-badge-label text-[#8c909f] uppercase tracking-wider">Suspicious Transactions</span>
              <span className="material-symbols-outlined text-[#adc6ff] text-lg">receipt_long</span>
            </div>
            <div className="my-2 flex items-baseline justify-between">
              <span className="font-metric-display text-[#dfe2ee]">1,284</span>
              <span className="flex items-center text-[#adc6ff] font-mono-sm bg-[#adc6ff]/10 px-1.5 py-0.5 rounded border border-[#adc6ff]/20">
                L1-L3 Layers
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8c909f] font-body-sm">
              <span>Flagged in execution queue</span>
              <span className="font-mono-sm text-[#c2c6d6]">$2.41M Vol</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4d8eff]"></div>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-[#181c24] p-3 rounded-lg border border-[#262a33] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-[#1c2028] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-badge-label text-[#8c909f] uppercase tracking-wider">Active Investigations</span>
              <span className="material-symbols-outlined text-[#4edea3] text-lg">group_work</span>
            </div>
            <div className="my-2 flex items-baseline justify-between">
              <span className="font-metric-display text-[#dfe2ee]">76</span>
              <span className="flex items-center text-[#4edea3] font-mono-sm bg-[#00a572]/20 px-1.5 py-0.5 rounded border border-[#00a572]/30">
                Assigned
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8c909f] font-body-sm">
              <span>SOC Analyst Capacity</span>
              <span className="font-mono-sm text-[#4edea3] font-semibold">12 Available</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4edea3]"></div>
          </div>
        </div>

        {/* Active Visual Correlation Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {/* Risk Trend Sparkline & Visual Indicator */}
          <div className="xl:col-span-2 bg-[#181c24] p-4 rounded-lg border border-[#262a33] shadow-sm flex flex-col justify-between relative">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="font-headline-md font-semibold text-[#dfe2ee]">
                  Hourly Fraud Velocity Velocity vs. Baseline
                </span>
                <span className="px-2 py-0.5 rounded bg-[#31353e] text-[#8c909f] font-badge-label">
                  UTC TIME
                </span>
              </div>
              <span className="font-mono-sm text-[#4edea3]">Peak: 14:15 UTC (218 alerts/min)</span>
            </div>

            {/* Inline Telemetry SVG Chart with interactive hover Scrubber */}
            <div className="w-full h-32 pt-2 relative">
              <svg
                className="w-full h-full text-[#adc6ff] overflow-visible"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 600 100"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = ((e.clientX - rect.left) / rect.width) * 600;
                  const estimatedY = 80 - ((relX - 100) * 0.1);
                  setHoveredPoint({
                    x: relX,
                    y: Math.max(20, Math.min(85, estimatedY)),
                    time: `${Math.floor(8 + (relX / 600) * 8)}:${String(Math.floor((relX % 60))).padStart(2, '0')} UTC`,
                    rate: Math.round(40 + (100 - estimatedY) * 2.2),
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  <linearGradient id="fraudSpikeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff5451" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#adc6ff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#adc6ff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line stroke="#31353e" strokeDasharray="2 2" strokeWidth="0.5" x1="0" x2="600" y1="25" y2="25" />
                <line stroke="#31353e" strokeDasharray="2 2" strokeWidth="0.5" x1="0" x2="600" y1="50" y2="50" />
                <line stroke="#31353e" strokeDasharray="2 2" strokeWidth="0.5" x1="0" x2="600" y1="75" y2="75" />

                {/* Baseline Trend */}
                <path d="M0,75 Q150,70 300,72 T600,68" fill="none" stroke="#424754" strokeWidth="1.5" />

                {/* Active Spike Trend */}
                <path
                  d="M0,80 L50,78 L100,70 L150,72 L200,65 L250,55 L300,62 L350,40 L400,20 L450,28 L500,45 L550,50 L600,42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                {/* Area Gradient Fill */}
                <path
                  d="M0,80 L50,78 L100,70 L150,72 L200,65 L250,55 L300,62 L350,40 L400,20 L450,28 L500,45 L550,50 L600,42 L600,100 L0,100 Z"
                  fill="url(#fraudSpikeGradient)"
                />

                {/* Critical Anomaly Pin at (400, 20) */}
                <circle cx="400" cy="20" fill="#ff5451" r="4" />
                <circle cx="400" cy="20" fill="#ff5451" fillOpacity="0.2" r="8" className="animate-ping" />

                {/* Scrubber vertical line if hovered */}
                {hoveredPoint && (
                  <line
                    x1={hoveredPoint.x}
                    x2={hoveredPoint.x}
                    y1="10"
                    y2="90"
                    stroke="#adc6ff"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                )}
              </svg>

              {/* Scrubber Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none bg-[#0a0e16] border border-[#adc6ff]/50 px-2 py-1 rounded text-xs font-mono shadow-lg z-20"
                  style={{
                    left: `${(hoveredPoint.x / 600) * 100}%`,
                    top: '20px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="text-[#dfe2ee] font-semibold">{hoveredPoint.time}</div>
                  <div className="text-[#ffb3ad]">{hoveredPoint.rate} alerts / min</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 font-mono-sm text-[#8c909f]">
              <span>08:00 UTC</span>
              <span>10:00 UTC</span>
              <span>12:00 UTC</span>
              <span className="text-[#ffb3ad] font-semibold">14:00 (Anomaly Spike)</span>
              <span>16:00 (Projected)</span>
            </div>
          </div>

          {/* Layer Breakdown Mini Panel */}
          <div className="bg-[#181c24] p-4 rounded-lg border border-[#262a33] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1">
              <span className="font-headline-md font-semibold text-[#dfe2ee]">Topology Distribution</span>
              <span className="font-badge-label text-[#8c909f] uppercase">3-TIER ARCH</span>
            </div>

            <div className="space-y-3 py-1">
              <div>
                <div className="flex justify-between items-center font-mono-sm pb-1">
                  <span className="text-[#dfe2ee]">L1 // Direct Ingress (Mule Swarms)</span>
                  <span className="text-[#ffb3ad] font-bold">58% (High Vol)</span>
                </div>
                <div className="w-full h-1.5 bg-[#31353e] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff5451] rounded-full" style={{ width: '58%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-mono-sm pb-1">
                  <span className="text-[#dfe2ee]">L2 // Synthetic Identity Shuffling</span>
                  <span className="text-[#adc6ff] font-bold">28% (Medium)</span>
                </div>
                <div className="w-full h-1.5 bg-[#31353e] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4d8eff] rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-mono-sm pb-1">
                  <span className="text-[#dfe2ee]">L3 // Off-ramp Clearing Vaults</span>
                  <span className="text-[#4edea3] font-bold">14% (Isolated)</span>
                </div>
                <div className="w-full h-1.5 bg-[#31353e] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00a572] rounded-full" style={{ width: '14%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[#8c909f] font-mono-sm border-t border-[#262a33]">
              <span>Engine: Graph-Adjacency-v4</span>
              <span className="text-[#4edea3]">OK // Synced</span>
            </div>
          </div>
        </div>

        {/* Recent Investigations Section */}
        <div className="bg-[#181c24] rounded-xl shadow-md border border-[#262a33] overflow-hidden">
          {/* Section Header & Operational Filters */}
          <div className="p-4 bg-[#181c24] border-b border-[#262a33] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-xs bg-[#adc6ff]"></div>
              <div>
                <h2 className="font-headline-lg text-[#dfe2ee] font-semibold tracking-tight">
                  Recent Investigations
                </h2>
                <p className="font-body-sm text-[#c2c6d6]">
                  Target entities awaiting resolution, active containment, or forensic review
                </p>
              </div>
            </div>

            {/* Filter Pills & Export Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-[#0a0e16] p-0.5 rounded-lg border border-[#262a33] flex items-center">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded font-mono-sm transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-[#1c2028] text-[#adc6ff] font-semibold'
                      : 'text-[#8c909f] hover:text-[#dfe2ee]'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('critical')}
                  className={`px-3 py-1 rounded font-mono-sm transition-all cursor-pointer ${
                    filterType === 'critical'
                      ? 'bg-[#1c2028] text-[#adc6ff] font-semibold'
                      : 'text-[#8c909f] hover:text-[#dfe2ee]'
                  }`}
                >
                  High & Critical
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('l1')}
                  className={`px-3 py-1 rounded font-mono-sm transition-all cursor-pointer ${
                    filterType === 'l1'
                      ? 'bg-[#1c2028] text-[#adc6ff] font-semibold'
                      : 'text-[#8c909f] hover:text-[#dfe2ee]'
                  }`}
                >
                  L1 Layer
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('review')}
                  className={`px-3 py-1 rounded font-mono-sm transition-all cursor-pointer ${
                    filterType === 'review'
                      ? 'bg-[#1c2028] text-[#adc6ff] font-semibold'
                      : 'text-[#8c909f] hover:text-[#dfe2ee]'
                  }`}
                >
                  Under Review
                </button>
              </div>

              <div className="flex items-center gap-1.5 pl-1">
                <button
                  type="button"
                  onClick={exportTableData}
                  className="p-1.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] transition-colors cursor-pointer border border-[#31353e]"
                  title="Export CSV / JSON"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Table synchronized with DuckDB')}
                  className="p-1.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] transition-colors cursor-pointer border border-[#31353e]"
                  title="Refresh Table"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Investigations Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0e16] text-[#8c909f] font-badge-label uppercase tracking-wider border-b border-[#262a33]">
                  <th className="py-2.5 px-4">Account ID</th>
                  <th className="py-2.5 px-4">Risk Score</th>
                  <th className="py-2.5 px-4">Risk Level</th>
                  <th className="py-2.5 px-4">Layer</th>
                  <th className="py-2.5 px-4 text-right">Transactions</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2028]">
                {filteredAccounts.map((account) => {
                  const isCritical = account.riskLevel === 'CRITICAL';
                  const isHigh = account.riskLevel === 'HIGH';
                  const isLow = account.riskLevel === 'LOW';

                  const scoreColor = isCritical
                    ? 'text-[#ffb4ab]'
                    : isHigh
                    ? 'text-[#ffb3ad]'
                    : isLow
                    ? 'text-[#4edea3]'
                    : 'text-[#adc6ff]';

                  const scoreBarColor = isCritical
                    ? 'bg-[#ff5451]'
                    : isHigh
                    ? 'bg-[#ff5451]'
                    : isLow
                    ? 'bg-[#4edea3]'
                    : 'bg-[#4d8eff]';

                  return (
                    <tr
                      key={account.id}
                      onClick={() => onOpenAccount(account)}
                      className="hover:bg-[#262a33]/60 transition-colors group cursor-pointer"
                    >
                      {/* Account ID */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-md text-[#adc6ff] font-semibold group-hover:underline">
                            {account.id}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(account.id, e)}
                            className="text-[#8c909f] hover:text-[#dfe2ee] transition-colors p-0.5"
                            title="Copy Account ID"
                          >
                            <span className="material-symbols-outlined text-xs">
                              {copiedId === account.id ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className={`font-mono-md font-semibold ${scoreColor} tabular-nums`}>
                            {account.riskScore}
                          </span>
                          <div className="w-16 h-1.5 bg-[#31353e] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${scoreBarColor} rounded-full`}
                              style={{ width: `${account.riskScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-2.5 px-4">
                        {isCritical && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#93000a]/40 text-[#ffb4ab] font-badge-label uppercase font-bold border border-[#ffb4ab]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
                            Critical
                          </span>
                        )}
                        {isHigh && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ff5451]/20 text-[#ffb3ad] font-badge-label uppercase border border-[#ff5451]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb3ad]"></span>
                            High
                          </span>
                        )}
                        {account.riskLevel === 'MEDIUM' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#4d8eff]/20 text-[#adc6ff] font-badge-label uppercase border border-[#4d8eff]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#adc6ff]"></span>
                            Medium
                          </span>
                        )}
                        {isLow && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3] font-badge-label uppercase border border-[#00a572]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                            Low
                          </span>
                        )}
                      </td>

                      {/* Layer */}
                      <td className="py-2.5 px-4">
                        <span className="font-mono-sm px-1.5 py-0.5 rounded bg-[#262a33] text-[#dfe2ee] border border-[#31353e]">
                          {account.layer}
                        </span>
                      </td>

                      {/* Transactions */}
                      <td className="py-2.5 px-4 text-right">
                        <span className="font-mono-md text-[#dfe2ee] tabular-nums">
                          {account.transactionsCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-4">
                        {account.status === 'Investigating' && (
                          <div className="flex items-center gap-1 text-[#adc6ff]">
                            <span className="material-symbols-outlined text-xs">radio_button_checked</span>
                            <span className="font-mono-sm">Investigating</span>
                          </div>
                        )}
                        {account.status === 'Review' && (
                          <div className="flex items-center gap-1 text-[#8c909f]">
                            <span className="material-symbols-outlined text-xs">visibility</span>
                            <span className="font-mono-sm">Review</span>
                          </div>
                        )}
                        {account.status === 'Cleared' && (
                          <div className="flex items-center gap-1 text-[#4edea3]">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            <span className="font-mono-sm">Cleared</span>
                          </div>
                        )}
                        {account.status === 'Queued' && (
                          <div className="flex items-center gap-1 text-[#8c909f]">
                            <span className="material-symbols-outlined text-xs">pending</span>
                            <span className="font-mono-sm">Queued</span>
                          </div>
                        )}
                        {account.status === 'Escalated' && (
                          <div className="flex items-center gap-1 text-[#ffb3ad] font-semibold">
                            <span className="material-symbols-outlined text-xs">bolt</span>
                            <span className="font-mono-sm">Escalated</span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAccount(account);
                          }}
                          className="px-3 py-1 rounded bg-[#262a33] hover:bg-[#adc6ff] hover:text-[#002e6a] text-[#dfe2ee] font-body-sm transition-all cursor-pointer border border-[#31353e]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Metadata */}
          <div className="p-4 bg-[#181c24] border-t border-[#262a33] flex flex-col sm:flex-row items-center justify-between gap-2 font-mono-sm text-[#8c909f]">
            <div className="flex items-center gap-3">
              <span>Displaying {filteredAccounts.length} of 342 active cases</span>
              <span>•</span>
              <span>
                Filter: <span className="text-[#dfe2ee] font-semibold">{filterType.toUpperCase()}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="px-2 py-1 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] disabled:opacity-40 cursor-pointer"
                disabled
              >
                Previous
              </button>
              <span className="px-2 py-1 text-[#dfe2ee]">1</span>
              <button
                type="button"
                className="px-2 py-1 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Frontend Architecture / Developer Handshake Collapsible Panel */}
        <div className="bg-[#181c24] rounded-xl shadow-sm border border-[#262a33] overflow-hidden">
          <button
            type="button"
            onClick={() => setIsDevPanelOpen(!isDevPanelOpen)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1c2028] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#adc6ff] text-base">code</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-badge-label text-[#8c909f] uppercase">
                  API HANDSHAKE // PERSON 1 SCOPE
                </span>
                <span className="font-mono-sm text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-0.5 rounded border border-[#adc6ff]/20">
                  GET /api/v1/investigations/overview
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 font-mono-sm text-[#4edea3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                <span>DuckDB Query Latency: 4.2ms</span>
              </div>
              <span
                className="material-symbols-outlined text-[#8c909f] transition-transform duration-200"
                style={{ transform: isDevPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                expand_more
              </span>
            </div>
          </button>

          {isDevPanelOpen && (
            <div className="p-4 bg-[#0a0e16] border-t border-[#262a33] font-mono-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <span className="font-badge-label text-[#8c909f] uppercase block mb-1">
                    Contract Schema Integration Payload
                  </span>
                  <pre className="bg-[#181c24] p-3 rounded text-[#adc6ff] overflow-x-auto leading-tight border border-[#262a33]">
{JSON.stringify(
  {
    status: 'success',
    engine: 'duckdb_v0.10.1',
    execution_time_ms: 4.21,
    summary: {
      total_accounts: 12480,
      high_risk_count: 342,
      suspicious_tx_volume: 1284,
      active_investigations: 76,
    },
    risk_distribution: {
      L1_ingress_pct: 58,
      L2_synthetic_pct: 28,
      L3_vault_pct: 14,
    },
  },
  null,
  2
)}
                  </pre>
                </div>

                <div className="w-full md:w-80 flex flex-col justify-between bg-[#181c24] p-3 rounded border border-[#262a33]">
                  <div className="space-y-1">
                    <span className="font-badge-label text-[#8c909f] uppercase">
                      Integration Notes
                    </span>
                    <p className="font-body-sm text-[#c2c6d6]">
                      Connected to DuckDB in-memory OLAP ledger cache. WebSocket stream listener updates live telemetry nodes over <code className="text-[#adc6ff]">wss://soc-gateway.cyberastra.internal/v1/stream</code>.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center justify-between border-t border-[#262a33] mt-3">
                    <span className="font-badge-label text-[#4edea3] uppercase font-semibold">
                      CACHE HIT (DUCKDB)
                    </span>
                    <span className="text-[#8c909f]">SHA: 8cf39a</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
