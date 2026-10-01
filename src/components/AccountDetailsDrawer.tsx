import React, { useState } from 'react';
import { InvestigationAccount } from '../types/soc';
import { MOCK_TRANSACTIONS } from '../data/mockSocData';

interface AccountDetailsDrawerProps {
  account: InvestigationAccount | null;
  onClose: () => void;
  onInvestigateGraph: (accountId: string) => void;
  onContainAccount: (accountId: string) => void;
  onShowToast: (msg: string) => void;
}

export const AccountDetailsDrawer: React.FC<AccountDetailsDrawerProps> = ({
  account,
  onClose,
  onInvestigateGraph,
  onContainAccount,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!account) return null;

  const transactions = MOCK_TRANSACTIONS[account.id] || [
    {
      txId: `tx_${account.id.toLowerCase()}_001`,
      sourceAccount: account.id,
      destAccount: 'ACC024',
      amountUSD: 14200.00,
      timestampUtc: '14:25:01 UTC',
      layer: account.layer,
      anomalyScore: account.riskScore,
      flagged: true,
      routingHop: 1,
    }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast(`Copied ${text} to clipboard`);
    setTimeout(() => setCopied(false), 1500);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-[#93000a]/40 text-[#ffb4ab] border-[#ffb4ab]/30';
      case 'HIGH':
        return 'bg-[#ff5451]/20 text-[#ffb3ad] border-[#ff5451]/30';
      case 'MEDIUM':
        return 'bg-[#4d8eff]/20 text-[#adc6ff] border-[#4d8eff]/30';
      default:
        return 'bg-[#00a572]/20 text-[#4edea3] border-[#4edea3]/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0f131c] border-l border-[#262a33] h-full flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#181c24] border-b border-[#262a33] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#0a0e16] border border-[#31353e] text-[#adc6ff]">
              <span className="material-symbols-outlined text-xl">account_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-lg text-[#dfe2ee] font-bold tracking-tight">
                  {account.id}
                </span>
                <button
                  onClick={() => handleCopy(account.id)}
                  className="text-[#8c909f] hover:text-[#dfe2ee] transition-colors p-1"
                  title="Copy ID"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
                <span
                  className={`px-2 py-0.5 rounded text-badge-label font-badge-label uppercase border ${getRiskBadge(
                    account.riskLevel
                  )}`}
                >
                  {account.riskLevel}
                </span>
                {account.isContained && (
                  <span className="px-2 py-0.5 rounded text-badge-label font-badge-label uppercase bg-[#ff5451] text-[#00285d] font-bold animate-pulse">
                    FROZEN / CONTAINED
                  </span>
                )}
              </div>
              <p className="font-mono-sm text-[#8c909f]">{account.entityName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#262a33] text-[#8c909f] hover:text-[#dfe2ee] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Risk Score & Velocity Meter */}
          <div className="p-4 rounded-lg bg-[#181c24] border border-[#262a33] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#0a0e16] border-2 border-[#31353e]">
                <span className="font-metric-display text-[#ffb3ad] font-bold">
                  {account.riskScore}
                </span>
              </div>
              <div>
                <span className="font-badge-label text-[#8c909f] uppercase">
                  Aggregated Risk Vector
                </span>
                <h4 className="font-headline-md text-[#dfe2ee]">
                  {account.riskLevel === 'CRITICAL'
                    ? 'Critical Fraud Risk Velocity'
                    : account.riskLevel === 'HIGH'
                    ? 'High Anomaly Dispersion'
                    : 'Standard Monitored Activity'}
                </h4>
                <span className="font-mono-sm text-[#8c909f]">
                  Layer Tier: <strong className="text-[#adc6ff]">{account.layer}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-48 text-right">
              <span className="font-badge-label text-[#8c909f] uppercase">
                24H Settled Volume
              </span>
              <span className="font-headline-md text-[#dfe2ee] font-mono tabular-nums">
                ${account.totalVolumeUSD.toLocaleString()} USD
              </span>
              <span className="font-mono-sm text-[#4edea3]">
                {account.transactionsCount} Transactions Logged
              </span>
            </div>
          </div>

          {/* Quick Containment Controls */}
          <div className="p-3.5 rounded-lg bg-[#0a0e16] border border-[#31353e] flex flex-wrap items-center justify-between gap-2">
            <span className="font-badge-label text-[#8c909f] uppercase">
              Operational Actions:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onContainAccount(account.id);
                  onShowToast(
                    account.isContained
                      ? `Account ${account.id} containment lifted.`
                      : `Emergency containment triggered for ${account.id}!`
                  );
                }}
                className={`px-3 py-1.5 rounded font-mono-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                  account.isContained
                    ? 'bg-[#00a572]/20 text-[#4edea3] hover:bg-[#00a572]/30 border border-[#00a572]/40'
                    : 'bg-[#ff5451] hover:bg-[#ffb4ab] text-[#00285d] font-bold'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {account.isContained ? 'lock_open' : 'lock_clock'}
                </span>
                <span>{account.isContained ? 'Lift Freeze' : 'Emergency Freeze'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onInvestigateGraph(account.id);
                }}
                className="px-3 py-1.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[#adc6ff] font-mono-sm transition-all cursor-pointer flex items-center gap-1.5 border border-[#424754]"
              >
                <span className="material-symbols-outlined text-sm">radar</span>
                <span>Inspect in Graph</span>
              </button>

              <button
                onClick={() => {
                  onShowToast(`FinCEN SAR draft generated for ${account.id} (#SAR-2026-X)`);
                }}
                className="px-3 py-1.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-mono-sm transition-all cursor-pointer flex items-center gap-1.5 border border-[#424754]"
              >
                <span className="material-symbols-outlined text-sm">assignment</span>
                <span>Draft SAR</span>
              </button>
            </div>
          </div>

          {/* Forensic Evidence Signals */}
          <div className="space-y-2">
            <span className="font-badge-label text-[#8c909f] uppercase tracking-wider">
              Triage Diagnostics & Indicators
            </span>
            <div className="p-3.5 rounded-lg bg-[#181c24] border border-[#262a33] space-y-3">
              <div>
                <span className="font-mono-sm text-[#ffb3ad] font-semibold block mb-0.5">
                  Primary Trigger:
                </span>
                <p className="font-body-sm text-[#dfe2ee]">{account.flagReason}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#262a33]">
                <div>
                  <span className="font-mono-sm text-[#8c909f] block">Egress IP Node:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono-sm text-[#dfe2ee]">{account.ipAddress}</span>
                    <button
                      onClick={() => handleCopy(account.ipAddress)}
                      className="text-[#8c909f] hover:text-[#dfe2ee]"
                    >
                      <span className="material-symbols-outlined text-xs">content_copy</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-mono-sm text-[#8c909f] block">Device Fingerprint:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono-sm text-[#adc6ff]">
                      {account.deviceFingerprint}
                    </span>
                    <button
                      onClick={() => handleCopy(account.deviceFingerprint)}
                      className="text-[#8c909f] hover:text-[#dfe2ee]"
                    >
                      <span className="material-symbols-outlined text-xs">content_copy</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-mono-sm text-[#8c909f] block">Jurisdiction:</span>
                  <span className="font-body-sm text-[#dfe2ee]">{account.jurisdiction}</span>
                </div>

                <div>
                  <span className="font-mono-sm text-[#8c909f] block">Last Activity:</span>
                  <span className="font-mono-sm text-[#4edea3]">{account.lastActiveUtc}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nested Transactions Ledger */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-badge-label text-[#8c909f] uppercase tracking-wider">
                Recent Nested Transactions ({transactions.length})
              </span>
              <span className="font-mono-sm text-[#8c909f]">DuckDB Live Log</span>
            </div>

            <div className="border border-[#262a33] rounded-lg overflow-hidden bg-[#0a0e16]">
              <table className="w-full text-left border-collapse font-body-sm">
                <thead>
                  <tr className="bg-[#181c24] text-[#8c909f] font-badge-label uppercase border-b border-[#262a33]">
                    <th className="py-2 px-3">TX Hash</th>
                    <th className="py-2 px-3">Flow</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Anomaly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a33] font-mono-sm">
                  {transactions.map((tx) => (
                    <tr key={tx.txId} className="hover:bg-[#181c24] transition-colors">
                      <td className="py-2 px-3 text-[#adc6ff]">{tx.txId}</td>
                      <td className="py-2 px-3">
                        <span className="text-[#dfe2ee]">{tx.sourceAccount}</span>
                        <span className="text-[#8c909f] mx-1">→</span>
                        <span className="text-[#dfe2ee]">{tx.destAccount}</span>
                      </td>
                      <td className="py-2 px-3 text-right text-[#dfe2ee] tabular-nums font-semibold">
                        ${tx.amountUSD.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-[#8c909f]">{tx.timestampUtc}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-badge-label ${
                            tx.anomalyScore > 85
                              ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                              : 'bg-[#4d8eff]/20 text-[#adc6ff]'
                          }`}
                        >
                          {tx.anomalyScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#181c24] border-t border-[#262a33] flex items-center justify-between">
          <span className="font-mono-sm text-[#8c909f]">
            Investigation Session #SOC-9921-X
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-body-sm transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
