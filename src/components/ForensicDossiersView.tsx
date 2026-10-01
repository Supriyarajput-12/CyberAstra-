import React, { useState } from 'react';
import { MOCK_DOSSIERS } from '../data/mockSocData';
import { ForensicDossier } from '../types/soc';

interface ForensicDossiersViewProps {
  onOpenAccountById: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const ForensicDossiersView: React.FC<ForensicDossiersViewProps> = ({
  onOpenAccountById,
  onShowToast,
}) => {
  const [dossiers, setDossiers] = useState<ForensicDossier[]>(MOCK_DOSSIERS);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(MOCK_DOSSIERS[0].caseId);
  const [analystNote, setAnalystNote] = useState<string>('');
  const [notesList, setNotesList] = useState<string[]>([
    'Initial ingress detected at 14:15 UTC via SG proxy cluster.',
    'Sub-second hops confirmed between ACC001 and ACC024. Smurfing thresholds triggered.',
  ]);

  const activeDossier = dossiers.find((d) => d.caseId === selectedCaseId) || dossiers[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analystNote.trim()) return;
    setNotesList((prev) => [
      ...prev,
      `[${new Date().toISOString().substring(11, 19)} UTC - A. Vance]: ${analystNote}`,
    ]);
    setAnalystNote('');
    onShowToast('Analyst note appended to case ledger');
  };

  const handleExportSar = () => {
    const sarReport = {
      reportType: 'FinCEN_SUSPICIOUS_ACTIVITY_REPORT_SAR',
      generatedUtc: new Date().toISOString(),
      investigator: 'A. Vance // Lead Fraud Investigator',
      case: activeDossier,
      analystNotes: notesList,
    };
    const blob = new Blob([JSON.stringify(sarReport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAR_EXPORT_${activeDossier.caseId.replace('#', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Exported formal FinCEN SAR package for ${activeDossier.caseId}`);
  };

  const handleEscalateCase = () => {
    setDossiers((prev) =>
      prev.map((d) =>
        d.caseId === activeDossier.caseId ? { ...d, status: 'UNDER ESCALATION' } : d
      )
    );
    onShowToast(`${activeDossier.caseId} escalated to Federal Financial Crimes Taskforce.`);
  };

  return (
    <div className="flex flex-col w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#262a33]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#262a33] text-[#adc6ff] font-badge-label uppercase">
              WORKSPACE // FORENSIC DOSSIERS
            </span>
            <span className="font-mono-sm text-[#8c909f]">FINCEN SAR FORMAT V2</span>
          </div>
          <h1 className="font-headline-xl text-[#dfe2ee] font-bold">
            Forensic Incident Dossiers
          </h1>
          <p className="font-body-md text-[#c2c6d6]">
            Incident case files, forensic timelines, entity containment orders, and regulatory export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSar}
            className="px-4 py-2 rounded bg-[#adc6ff] text-[#002e6a] font-headline-md font-semibold hover:bg-[#4d8eff] transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>Export SAR Package</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Dossier List (Left) + Detailed Case Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Dossiers Selection List */}
        <div className="space-y-3">
          <span className="font-badge-label text-[#8c909f] uppercase tracking-wider block">
            Active Incident Files ({dossiers.length})
          </span>

          {dossiers.map((dossier) => {
            const isSelected = dossier.caseId === selectedCaseId;
            const isCritical = dossier.severity === 'CRITICAL';

            return (
              <div
                key={dossier.caseId}
                onClick={() => setSelectedCaseId(dossier.caseId)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#181c24] border-[#adc6ff] shadow-md ring-1 ring-[#adc6ff]/20'
                    : 'bg-[#181c24]/50 border-[#262a33] hover:bg-[#181c24]'
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span className="font-mono-md text-[#adc6ff] font-bold">
                    {dossier.caseId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-badge-label font-badge-label uppercase ${
                      isCritical
                        ? 'bg-[#ff5451]/20 text-[#ffb3ad] border border-[#ff5451]/30'
                        : 'bg-[#4d8eff]/20 text-[#adc6ff] border border-[#4d8eff]/30'
                    }`}
                  >
                    {dossier.severity}
                  </span>
                </div>

                <h3 className="font-headline-md text-[#dfe2ee] font-semibold text-sm mb-1 line-clamp-1">
                  {dossier.title}
                </h3>

                <div className="flex items-center justify-between text-[#8c909f] font-mono-sm mt-2 pt-2 border-t border-[#262a33]">
                  <span>Exposure: ${(dossier.totalExposureUSD / 1000000).toFixed(2)}M</span>
                  <span className="text-[#4edea3]">{dossier.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Case File Inspector */}
        <div className="lg:col-span-2 space-y-4 bg-[#181c24] p-5 rounded-xl border border-[#262a33]">
          {/* Case Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#262a33]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-lg text-[#adc6ff] font-bold">
                  {activeDossier.caseId}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#ff5451]/20 text-[#ffb3ad] font-badge-label uppercase border border-[#ff5451]/30">
                  {activeDossier.severity}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#262a33] text-[#4edea3] font-badge-label uppercase border border-[#31353e]">
                  {activeDossier.status}
                </span>
              </div>
              <h2 className="font-headline-lg text-[#dfe2ee] font-bold mt-1">
                {activeDossier.title}
              </h2>
            </div>

            <button
              onClick={handleEscalateCase}
              className="px-3.5 py-1.5 rounded bg-[#262a33] hover:bg-[#ff5451] hover:text-[#00285d] text-[#dfe2ee] font-mono-sm transition-all cursor-pointer flex items-center gap-1.5 border border-[#424754] self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-sm">emergency</span>
              <span>Escalate Incident</span>
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-[#0a0e16] border border-[#262a33]">
              <span className="font-badge-label text-[#8c909f] uppercase block">
                Total Exposure
              </span>
              <span className="font-headline-md text-[#ffb3ad] font-bold">
                ${activeDossier.totalExposureUSD.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded bg-[#0a0e16] border border-[#262a33]">
              <span className="font-badge-label text-[#8c909f] uppercase block">
                Mule Swarm Nodes
              </span>
              <span className="font-headline-md text-[#dfe2ee] font-bold">
                {activeDossier.muleSwarmCount} Entities
              </span>
            </div>
            <div className="p-3 rounded bg-[#0a0e16] border border-[#262a33]">
              <span className="font-badge-label text-[#8c909f] uppercase block">
                Lead Analyst
              </span>
              <span className="font-body-sm text-[#adc6ff] font-semibold truncate block">
                {activeDossier.assignedAnalyst}
              </span>
            </div>
            <div className="p-3 rounded bg-[#0a0e16] border border-[#262a33]">
              <span className="font-badge-label text-[#8c909f] uppercase block">
                Detection Time
              </span>
              <span className="font-mono-sm text-[#4edea3]">
                {activeDossier.detectedUtc}
              </span>
            </div>
          </div>

          {/* Primary Involved Accounts Chips */}
          <div className="p-3 rounded bg-[#0a0e16] border border-[#262a33] space-y-1.5">
            <span className="font-badge-label text-[#8c909f] uppercase block">
              Primary Target Accounts Linked to Swarm
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {activeDossier.primaryAccounts.map((accId) => (
                <button
                  key={accId}
                  onClick={() => onOpenAccountById(accId)}
                  className="px-3 py-1 rounded bg-[#181c24] hover:bg-[#262a33] text-[#adc6ff] font-mono-sm font-semibold border border-[#31353e] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">account_box</span>
                  <span>{accId}</span>
                  <span className="text-[#8c909f] text-[10px]">Inspect</span>
                </button>
              ))}
            </div>
          </div>

          {/* Narrative Summary */}
          <div className="space-y-1">
            <span className="font-badge-label text-[#8c909f] uppercase tracking-wider block">
              Forensic Narrative & Methodology
            </span>
            <p className="font-body-md text-[#c2c6d6] bg-[#0a0e16] p-3.5 rounded border border-[#262a33] leading-relaxed">
              {activeDossier.narrative}
            </p>
          </div>

          {/* Recommended Regulatory Action */}
          <div className="space-y-1">
            <span className="font-badge-label text-[#8c909f] uppercase tracking-wider block">
              Recommended Remediation & SAR Action
            </span>
            <div className="p-3.5 rounded bg-[#0a0e16] border border-[#ff5451]/30 text-[#dfe2ee] font-body-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[#ff5451] text-base shrink-0 mt-0.5">
                verified_user
              </span>
              <span>{activeDossier.recommendedAction}</span>
            </div>
          </div>

          {/* Analyst Notes Log & Submission */}
          <div className="space-y-2 pt-2 border-t border-[#262a33]">
            <span className="font-badge-label text-[#8c909f] uppercase tracking-wider block">
              Case Timeline & Analyst Ledger
            </span>
            <div className="space-y-1 max-h-32 overflow-y-auto font-mono-sm">
              {notesList.map((note, idx) => (
                <div key={idx} className="p-2 rounded bg-[#0a0e16] text-[#dfe2ee] text-xs">
                  {note}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
              <input
                type="text"
                value={analystNote}
                onChange={(e) => setAnalystNote(e.target.value)}
                placeholder="Append forensic observation or containment step..."
                className="flex-1 px-3 py-2 bg-[#0a0e16] text-[#dfe2ee] font-mono-sm rounded-lg border border-[#262a33] focus:outline-none focus:ring-1 focus:ring-[#adc6ff] placeholder:text-[#8c909f]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-[#262a33] hover:bg-[#31353e] text-[#dfe2ee] font-body-sm font-semibold border border-[#424754] transition-colors cursor-pointer"
              >
                Log Note
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
