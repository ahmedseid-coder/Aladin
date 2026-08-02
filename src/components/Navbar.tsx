import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, Lock, Activity, FileText, Sparkles, Server, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  jwtToken: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  onRoleChange,
  activeTab,
  setActiveTab,
  jwtToken
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      {/* Security Protocol Status Bar */}
      <div className="bg-emerald-950/80 border-b border-emerald-900/60 text-emerald-300 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            SABA API v1.4 Standards
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-200">
            <Lock className="w-3 h-3 text-emerald-400" />
            Auth Protocol: Bearer JWT / SHA-256 Payload Signature
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            REST Gateway: Active
          </span>
          <span className="hidden md:inline text-slate-400">Token Exp: 30d</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-900/40">
              <span className="text-xl tracking-tighter">SABA</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-white">Clinic Partner Demand Portal</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  API Standardized
                </span>
              </div>
              <p className="text-xs text-slate-400">Official Reproductive & Family Health Supply Network</p>
            </div>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'form'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            Demand Request Form
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-300" />
            Requests & Tracker
          </button>

          {activeRole !== 'clinic' && (
            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'review'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              Sales & Dispatch Queue
            </button>
          )}

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            Demand Analytics
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'api'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4 text-indigo-300" />
            API & Tokens Center
          </button>
        </nav>

        {/* Role Switcher Demo Control */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 p-1 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 px-2 font-medium">Role:</span>
          <button
            onClick={() => onRoleChange('clinic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeRole === 'clinic'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Clinic Partner Mode (Dr. Abebe)"
          >
            Clinic Partner
          </button>
          <button
            onClick={() => onRoleChange('sales')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeRole === 'sales'
                ? 'bg-amber-400 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Sales Rep Mode (Dawit)"
          >
            Sales Rep
          </button>
          <button
            onClick={() => onRoleChange('admin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeRole === 'admin'
                ? 'bg-indigo-500 text-white font-bold shadow'
                : 'text-slate-300 hover:text-white'
            }`}
            title="SABA Admin Mode (HQ Logistics Lead)"
          >
            SABA HQ Admin
          </button>
        </div>
      </div>
    </header>
  );
};
