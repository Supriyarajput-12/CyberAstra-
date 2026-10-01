import React, { useState, useMemo } from 'react';
import { InvestigationAccount } from '../types/soc';

interface AccountLedgersViewProps {
  accounts: InvestigationAccount[];
  onOpenAccount: (acc: InvestigationAccount) => void;
  onContainAccount: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const AccountLedgersView: React.FC<AccountLedgersViewProps> = ({
  accounts,
  onOpenAccount,
  onContainAccount,
  onShowToast,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<'ALL' | 'L1 Ingress' | 'L2 Routing' | 'L3 Vault'>('ALL');
  const [minRiskScore, setMinRiskScore] = useState<number>(0);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (selectedLayer !== 'ALL' && acc.layer !== selectedLayer) {
        return false;
      }
      if (acc.riskScore < minRiskScore) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchId = acc.id.toLowerCase().includes(q);
        const matchName = acc.entityName.toLowerCase().includes(q);
        const matchIp = acc.ipAddress.toLowerCase().includes(q);
        const matchDfp = acc.deviceFingerprint.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchIp && !matchDfp) return false;
      }
      return true;
    });
  }, [accounts, selectedLayer, minRiskScore, searchFilter]);

  const toggleSelectAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedAccountIds.length === filteredAccounts.length) {
      setSelectedAccountIds([]);
    } else {
      setSelectedAccountIds(filteredAccounts.map((a) => a.id));
    }
  };

  const handleBatchContain = () => {
    if (selectedAccountIds.length === 0) {
      onShowToast('Please select at least one account');
      return;
    }
    selectedAccountIds.forEach((id) => onContainAccount(id));
    onShowToast(`Quarantined ${selectedAccountIds.length} accounts from settlement pool.`);
    setSelectedAccountIds([]);
  };

  const handleExportCsv = () => {
    const headers = 'ID,Entity,RiskScore,RiskLevel,Layer,Transactions,VolumeUSD,Status,Jurisdiction\n';
    const rows = filteredAccounts
      .map(
        (a) =>
          `"${a.id}","${a.entityName}",${a.riskScore},"${a.riskLevel}","${a.layer}",${a.transactionsCount},${a.totalVolumeUSD},"${a.status}","${a.jurisdiction}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account_ledgers_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported Account Ledgers CSV');
  };

  return (
    <div className="flex flex-col w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#262a33]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#262a33] text-[#adc6ff] font-badge-label uppercase">
              WORKSPACE // ACCOUNT LEDGERS
            </span>
            <span className="font-mono-sm text-[#8c909f]">DUCKDB IN-MEMORY CATALOG</span>
          </div>
          <h1 className="font-headline-xl text-[#dfe2ee] font-bold">
            Account Ledgers & Settlement Tiers
          </h1>
          <p className="font-body-md text-[#c2c6d6]">
            Inspect entity settlement layers, behavioral profiles, device hashes, and cross-border jurisdictions.
          </p>
        </div>

        {/* Batch actions */}
        <div className="flex items-center gap-2">
          {selectedAccountIds.length > 0 && (
            <button
              onClick={handleBatchContain}
              className="px-3.5 py-2 rounded bg-[#ff5451] hover:bg-[#ffb4ab] text-[#00285d] font-mono-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>Batch Contain ({selectedAccountIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded bg-[#181c24] hover:bg-[#262a33] text-[#dfe2ee] font-body-sm transition-all cursor-pointer flex items-center gap-1.5 border border-[#31353e]"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Query Controls Bar */}
      <div className="p-4 rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8c909f]">
            <span className="material-symbols-outlined text-base">search</span>
          </div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by Account ID, Entity, IP, or Device Fingerprint..."
            className="w-full pl-9 pr-3 py-2 bg-[#0a0e16] text-[#dfe2ee] font-mono-sm rounded-lg border border-[#262a33] focus:outline-none focus:ring-1 focus:ring-[#adc6ff] placeholder:text-[#8c909f]"
          />
        </div>

        {/* Layer Tabs */}
        <div className="bg-[#0a0e16] p-0.5 rounded-lg border border-[#262a33] flex items-center font-mono-sm">
          {(['ALL', 'L1 Ingress', 'L2 Routing', 'L3 Vault'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setSelectedLayer(layer)}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                selectedLayer === layer
                  ? 'bg-[#1c2028] text-[#adc6ff] font-semibold'
                  : 'text-[#8c909f] hover:text-[#dfe2ee]'
              }`}
            >
              {layer === 'ALL' ? 'All Tiers' : layer}
            </button>
          ))}
        </div>

        {/* Min Risk Score Slider */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0a0e16] border border-[#262a33]">
          <span className="font-badge-label text-[#8c909f] uppercase whitespace-nowrap">
            Min Risk:
          </span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minRiskScore}
            onChange={(e) => setMinRiskScore(Number(e.target.value))}
            className="w-24 accent-[#ff5451] cursor-pointer"
          />
          <span className="font-mono-sm text-[#ffb3ad] font-bold w-6 text-right tabular-nums">
            {minRiskScore}
          </span>
        </div>
      </div>

      {/* Account Ledgers Table */}
      <div className="bg-[#181c24] rounded-xl border border-[#262a33] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-[#0a0e16] text-[#8c909f] font-badge-label uppercase tracking-wider border-b border-[#262a33]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedAccountIds.length === filteredAccounts.length &&
                      filteredAccounts.length > 0
                    }
                    onChange={selectAll}
                    className="accent-[#adc6ff] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Account ID & Entity</th>
                <th className="py-3 px-4">Layer / Tier</th>
                <th className="py-3 px-4">Risk Gauge</th>
                <th className="py-3 px-4 text-right">Settled Volume</th>
                <th className="py-3 px-4">Device Fingerprint & IP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2028]">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8c909f] font-mono-sm">
                    No accounts found matching current query and filter thresholds.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => {
                  const isCritical = account.riskLevel === 'CRITICAL';
                  const isHigh = account.riskLevel === 'HIGH';
                  const isLow = account.riskLevel === 'LOW';

                  const badgeClass = isCritical
                    ? 'bg-[#93000a]/40 text-[#ffb4ab] border-[#ffb4ab]/30'
                    : isHigh
                    ? 'bg-[#ff5451]/20 text-[#ffb3ad] border-[#ff5451]/30'
                    : isLow
                    ? 'bg-[#00a572]/20 text-[#4edea3] border-[#00a572]/30'
                    : 'bg-[#4d8eff]/20 text-[#adc6ff] border-[#4d8eff]/30';

                  const isSelected = selectedAccountIds.includes(account.id);

                  return (
                    <tr
                      key={account.id}
                      className={`hover:bg-[#262a33]/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#262a33]/80' : ''
                      }`}
                      onClick={() => onOpenAccount(account)}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectAccount(account.id)}
                          className="accent-[#adc6ff] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono-md text-[#adc6ff] font-bold">
                            {account.id}
                          </span>
                          <span className="text-[#dfe2ee] font-body-sm font-medium">
                            {account.entityName}
                          </span>
                          <span className="font-mono-sm text-[#8c909f]">
                            {account.jurisdiction}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono-sm px-2 py-0.5 rounded bg-[#262a33] text-[#dfe2ee] border border-[#31353e]">
                          {account.layer}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono-md font-bold tabular-nums ${
                              isCritical ? 'text-[#ffb4ab]' : isHigh ? 'text-[#ffb3ad]' : 'text-[#4edea3]'
                            }`}
                          >
                            {account.riskScore}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-badge-label font-badge-label uppercase border ${badgeClass}`}
                          >
                            {account.riskLevel}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-mono-md text-[#dfe2ee] font-bold tabular-nums block">
                          ${account.totalVolumeUSD.toLocaleString()}
                        </span>
                        <span className="font-mono-sm text-[#8c909f]">
                          {account.transactionsCount} txs
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono-sm">
                        <div className="flex flex-col">
                          <span className="text-[#adc6ff]">{account.deviceFingerprint}</span>
                          <span className="text-[#8c909f] text-[11px]">{account.ipAddress}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {account.isContained ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ff5451] text-[#00285d] font-badge-label font-bold uppercase">
                            <span className="material-symbols-outlined text-xs">lock</span>
                            FROZEN
                          </span>
                        ) : (
                          <span className="font-mono-sm text-[#dfe2ee]">
                            {account.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAccount(account)}
                            className="px-2.5 py-1 rounded bg-[#262a33] hover:bg-[#adc6ff] hover:text-[#002e6a] text-[#dfe2ee] font-body-sm transition-colors cursor-pointer border border-[#31353e]"
                          >
                            Dossier
                          </button>
                          <button
                            onClick={() => {
                              onContainAccount(account.id);
                              onShowToast(
                                account.isContained
                                  ? `Account ${account.id} unfreezed`
                                  : `Account ${account.id} frozen!`
                              );
                            }}
                            className={`p-1 rounded transition-colors cursor-pointer border ${
                              account.isContained
                                ? 'bg-[#00a572]/20 border-[#00a572]/40 text-[#4edea3]'
                                : 'bg-[#262a33] hover:bg-[#ff5451] hover:text-[#00285d] border-[#31353e] text-[#8c909f]'
                            }`}
                            title={account.isContained ? 'Lift Containment' : 'Freeze Account'}
                          >
                            <span className="material-symbols-outlined text-base">
                              {account.isContained ? 'lock_open' : 'lock'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#181c24] border-t border-[#262a33] flex items-center justify-between text-[#8c909f] font-mono-sm">
          <span>
            Displaying {filteredAccounts.length} of {accounts.length} ledgers
          </span>
          <span className="text-[#4edea3]">Real-time synchronization active</span>
        </div>
      </div>
    </div>
  );
};
