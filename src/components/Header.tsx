import React, { useState, useEffect } from 'react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e16]/95 backdrop-blur-md border-b border-[#262a33]">
      <div className="h-16 w-full px-4 flex items-center justify-between gap-3">
        {/* Left Section: Logo, Title & Telemetry Node */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img
              alt="Cyber Astra Emblem"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XUwidAz_dQ5-q8xkL9UqB4hgUIGQ7jGKAf6Wxv1lX7uhhCpwHSmlSw6dVS1MSr6ed-QMqihxMbh3MhPfB2eKOojqq7jY6UmA-yxIWSRVU-3yo7ePYpARXH7ierOdwYL7T0FHcTh4U9Ldb19BXWwFa_QYhi-fY9Hw2xzkm27ShYWDfNZk-Rran4rr1EGFed341MF5gf-6g_nx05wLdh4rp12zqayWmZzUnOtc4WZIPdP1uuwgCEqdefotc"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-md tracking-wider text-[#dfe2ee] font-bold uppercase">
                  CYBER ASTRA
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#262a33] text-[#adc6ff] font-badge-label uppercase">
                  INVESTIGATION SOC
                </span>
              </div>
              <span className="font-mono-sm text-[#8c909f]">
                TELEMETRY NODE // AP-SOUTHEAST-1
              </span>
            </div>
          </div>

          {/* Top Bar Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-2 cursor-pointer font-body-sm ${
                currentTab === 'dashboard'
                  ? 'bg-[#1c2028] text-[#adc6ff] font-semibold ring-1 ring-[#adc6ff]/20'
                  : 'text-[#c2c6d6] hover:bg-[#262a33] hover:text-[#dfe2ee]'
              }`}
            >
              <span>Dashboard</span>
              <span className="font-mono-sm px-1 py-0.5 rounded bg-[#31353e] text-[#8c909f]">
                ⌘1
              </span>
            </button>

            <button
              onClick={() => onSelectTab('investigate')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-2 cursor-pointer font-body-sm ${
                currentTab === 'investigate'
                  ? 'bg-[#1c2028] text-[#adc6ff] font-semibold ring-1 ring-[#adc6ff]/20'
                  : 'text-[#c2c6d6] hover:bg-[#262a33] hover:text-[#dfe2ee]'
              }`}
            >
              <span>Investigate</span>
              <span className="font-mono-sm px-1 py-0.5 rounded bg-[#31353e] text-[#8c909f]">
                ⌘2
              </span>
            </button>

            <button
              onClick={() => onSelectTab('accounts')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-2 cursor-pointer font-body-sm ${
                currentTab === 'accounts'
                  ? 'bg-[#1c2028] text-[#adc6ff] font-semibold ring-1 ring-[#adc6ff]/20'
                  : 'text-[#c2c6d6] hover:bg-[#262a33] hover:text-[#dfe2ee]'
              }`}
            >
              <span>Accounts</span>
              <span className="font-mono-sm px-1 py-0.5 rounded bg-[#31353e] text-[#8c909f]">
                ⌘3
              </span>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-2 cursor-pointer font-body-sm ${
                currentTab === 'reports'
                  ? 'bg-[#1c2028] text-[#adc6ff] font-semibold ring-1 ring-[#adc6ff]/20'
                  : 'text-[#c2c6d6] hover:bg-[#262a33] hover:text-[#dfe2ee]'
              }`}
            >
              <span>Reports</span>
              <span className="font-mono-sm px-1 py-0.5 rounded bg-[#31353e] text-[#8c909f]">
                ⌘4
              </span>
            </button>
          </nav>
        </div>

        {/* Right Section: System Status, SOC Time & User Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
              </span>
              <span className="font-mono-sm text-[#dfe2ee] font-semibold">
                System Status: Online
              </span>
            </div>
            <span className="font-mono-sm text-[#8c909f]">
              FastAPI Core v2.4 • DuckDB synced
            </span>
          </div>

          <div className="hidden md:flex flex-col items-end px-3 py-1 rounded bg-[#181c24] border border-[#262a33]">
            <span className="font-badge-label text-[#8c909f] uppercase tracking-wider">
              SOC Time (UTC)
            </span>
            <span className="font-mono-md text-[#dfe2ee] font-semibold tabular-nums">
              {utcTime || '14:28:49 UTC'}
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-2 border-l border-[#262a33]">
            <img
              alt="A. Vance Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#31353e]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKGO-yrT_74eHIEvc1XonZ2Hs-fdiJYtlyEffEjE8hjz_mVDkUE1TYBeNAdNBQoKCsi9uItzX8ItY5RCMlhTbuMIkBiJjeUoLh_5gWucqj5d7AgCYJpSy9BgE0tbdp4lSEnGRL1XqHezdKhJkCYKL5CGkSo0lq4hMC--na4kFNIkKt48jd67UGhRTB5tOyabHVEKAIGzh33e4cIGMNfnmBvf4A_60Ays3MiFX6BpfH0-XyCCVkzRDN"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-body-sm font-semibold text-[#dfe2ee]">
                  A. Vance
                </span>
                <span className="px-1 py-0.2 rounded bg-[#00a572]/20 text-[#4edea3] font-badge-label uppercase">
                  VERIFIED
                </span>
              </div>
              <span className="font-mono-sm text-[#8c909f]">
                Lead Fraud Investigator
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
