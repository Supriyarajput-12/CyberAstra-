/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { GraphIntelligenceView } from './components/GraphIntelligenceView';
import { AccountLedgersView } from './components/AccountLedgersView';
import { ForensicDossiersView } from './components/ForensicDossiersView';
import { AccountDetailsDrawer } from './components/AccountDetailsDrawer';
import { Toast } from './components/Toast';
import { INITIAL_ACCOUNTS } from './data/mockSocData';
import { InvestigationAccount } from './types/soc';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [accounts, setAccounts] = useState<InvestigationAccount[]>(INITIAL_ACCOUNTS);
  const [selectedAccount, setSelectedAccount] = useState<InvestigationAccount | null>(null);
  const [graphFocusId, setGraphFocusId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const handleOpenAccountById = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (acc) {
      setSelectedAccount(acc);
    } else {
      // Create synthetic record if exploring graph-only entity
      const syntheticAcc: InvestigationAccount = {
        id,
        riskScore: 89,
        riskLevel: 'HIGH',
        layer: id.startsWith('ACC') ? 'L1 Ingress' : 'L3 Vault',
        transactionsCount: 42,
        status: 'Investigating',
        entityName: `Entity ${id} Cluster`,
        ipAddress: '103.241.12.94',
        deviceFingerprint: `dfp_${id.toLowerCase()}_x`,
        jurisdiction: 'Offshore Settlement Ledger',
        totalVolumeUSD: 240000,
        flagReason: 'Identified via graph adjacency traversal.',
        lastActiveUtc: '14:28:10 UTC',
        isContained: false,
      };
      setSelectedAccount(syntheticAcc);
    }
  };

  const handleContainAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const newContained = !acc.isContained;
          return {
            ...acc,
            isContained: newContained,
            status: newContained ? 'Escalated' : 'Review',
          };
        }
        return acc;
      })
    );
    if (selectedAccount && selectedAccount.id === id) {
      setSelectedAccount((prev) =>
        prev
          ? {
              ...prev,
              isContained: !prev.isContained,
              status: !prev.isContained ? 'Escalated' : 'Review',
            }
          : null
      );
    }
  };

  const handleSearchAccount = (query: string) => {
    const normalized = query.trim().toUpperCase();

    if (normalized === 'FLAGGED_HIGH' || normalized === 'HIGH RISK QUEUE') {
      setCurrentTab('accounts');
      showToast('Navigating to High Risk Account Ledger');
      return;
    }

    const match = accounts.find(
      (a) =>
        a.id.toUpperCase() === normalized ||
        a.entityName.toUpperCase().includes(normalized)
    );

    if (match) {
      setSelectedAccount(match);
      showToast(`Located account record for ${match.id}`);
    } else {
      // If it looks like an account ID, open synthetic investigation
      if (normalized.startsWith('ACC')) {
        handleOpenAccountById(normalized);
        showToast(`Queried ledger for ${normalized}`);
      } else {
        showToast(`No exact match for "${query}". Opening ledgers catalog.`);
        setCurrentTab('accounts');
      }
    }
  };

  const handleInspectInGraph = (id: string) => {
    setGraphFocusId(id);
    setCurrentTab('investigate');
    showToast(`Focused ${id} in Graph Intelligence`);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user presses Escape, close drawer
      if (e.key === 'Escape' && selectedAccount) {
        setSelectedAccount(null);
        return;
      }

      // Check for meta or alt key combinations
      if (e.metaKey || e.ctrlKey || e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setCurrentTab('dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          setCurrentTab('investigate');
        } else if (e.key === '3') {
          e.preventDefault();
          setCurrentTab('accounts');
        } else if (e.key === '4') {
          e.preventDefault();
          setCurrentTab('reports');
        } else if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          const searchInput = document.querySelector('input') as HTMLInputElement | null;
          if (searchInput) searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAccount]);

  const activeCritCount = accounts.filter(
    (a) => a.riskLevel === 'CRITICAL' && !a.isContained
  ).length;

  const reviewPendingCount = accounts.filter(
    (a) => a.status === 'Review' || a.status === 'Queued'
  ).length;

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] font-body-md antialiased flex flex-col">
      {/* Top Header */}
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Layout Container */}
      <div className="flex pt-16 min-h-screen">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeCritCount={activeCritCount || 14}
          reviewPendingCount={reviewPendingCount || 38}
        />

        {/* Primary Main Workspace View */}
        <main className="pl-64 flex-1 bg-[#0f131c] min-h-[calc(100vh-4rem)]">
          {currentTab === 'dashboard' && (
            <DashboardView
              accounts={accounts}
              onOpenAccount={(acc) => setSelectedAccount(acc)}
              onSearchAccount={handleSearchAccount}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'investigate' && (
            <GraphIntelligenceView
              onOpenAccountById={handleOpenAccountById}
              onShowToast={showToast}
              initialSelectedId={graphFocusId}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountLedgersView
              accounts={accounts}
              onOpenAccount={(acc) => setSelectedAccount(acc)}
              onContainAccount={handleContainAccount}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'reports' && (
            <ForensicDossiersView
              onOpenAccountById={handleOpenAccountById}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Slide-out Account Details / Forensic Drawer */}
      {selectedAccount && (
        <AccountDetailsDrawer
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onInvestigateGraph={handleInspectInGraph}
          onContainAccount={handleContainAccount}
          onShowToast={showToast}
        />
      )}

      {/* Action Notification Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
