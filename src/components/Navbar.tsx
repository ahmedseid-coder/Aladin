import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { ShieldCheck, Lock, Activity, FileText, Sparkles, Server, CheckCircle2, UserCheck, Code, ChevronDown, LogOut, Key, LogIn, QrCode, Clock, ShieldAlert } from 'lucide-react';
import { SabaClinicLogo } from './Logos';

interface NavbarProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  jwtToken: string;
  currentUser?: User | null;
  inactivitySeconds?: number;
  onOpenQrScanner?: () => void;
  onLogout?: () => void;
  onReLogin?: () => void;
  onOpenLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  onRoleChange,
  activeTab,
  setActiveTab,
  jwtToken,
  currentUser,
  inactivitySeconds = 900,
  onOpenQrScanner,
  onLogout,
  onReLogin,
  onOpenLoginModal
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimerLow = inactivitySeconds < 120;

  return (
    <header className="bg-red-950 border-b border-red-900 text-white sticky top-0 z-50 shadow-xl">
      {/* Security Protocol & Prepared By Bar */}
      <div className="bg-red-900/90 border-b border-red-800/80 text-rose-100 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            SABA API v1.4 Standards
          </span>
          <span className="hidden sm:inline text-rose-300/50">|</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-rose-100">
            <Lock className="w-3 h-3 text-rose-300" />
            Auth: Bearer JWT / SHA-256 Checksum
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* 15-Min Auto-Logout Security Timer */}
          {jwtToken && (
            <div
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
                isTimerLow
                  ? 'bg-amber-500/30 text-amber-200 border-amber-400 animate-pulse'
                  : 'bg-red-950/80 text-rose-200 border-red-800'
              }`}
              title="Auto-Logout Security Timer: Session expires after 15 minutes of inactivity"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Auto-Logout: {formatTimer(inactivitySeconds)}</span>
            </div>
          )}

          {/* Prepared By Ahmed IT Credit */}
          <div className="bg-gradient-to-r from-amber-500/20 via-red-500/30 to-amber-500/20 border border-amber-400/40 text-amber-200 px-3 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-inner">
            <UserCheck className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Prepared by: <strong className="text-white underline decoration-amber-400 underline-offset-2">Ahmed IT</strong></span>
          </div>
          <span className="hidden md:inline text-rose-300/60 font-mono text-[11px]">DKT Ethiopia Network</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logos & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* SABA & DKT Partner Logo */}
            <div className="flex items-center gap-2 bg-white/95 p-1.5 rounded-xl border border-rose-300 shadow-md">
              <SabaClinicLogo className="h-9" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight text-white">Clinic Partner Demand Portal</h1>
                {/* User & Organization Dropdown Menu */}
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30 hover:border-amber-400 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="User Profile & Session Controls"
                  >
                    <span className={`w-2 h-2 rounded-full ${jwtToken ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                    <span>{currentUser ? currentUser.full_name : 'DKT ETHIOPIA'}</span>
                    <ChevronDown className={`w-3 h-3 text-amber-300 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu Box */}
                  {isDropdownOpen && (
                    <>
                      {/* Backdrop to close when clicking outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />

                      <div className="absolute left-0 mt-2 w-68 bg-red-950 border border-red-800 rounded-xl shadow-2xl z-50 py-2 text-white divide-y divide-red-900 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* User Profile Info */}
                        <div className="px-3 py-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                              {currentUser ? currentUser.full_name : 'Ahmed IT'}
                            </span>
                            <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-bold capitalize">
                              {(currentUser ? currentUser.role : activeRole)} Mode
                            </span>
                          </div>
                          {currentUser?.clinic_name && (
                            <p className="text-[10px] text-amber-200 font-medium truncate">{currentUser.clinic_name}</p>
                          )}
                          <p className="text-[11px] text-rose-200 truncate font-mono">
                            {jwtToken ? `JWT Token: ${jwtToken.substring(0, 14)}...` : 'Session Expired / Logged Out'}
                          </p>
                        </div>

                        {/* Dropdown Actions */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onOpenLoginModal?.();
                            }}
                            className="w-full text-left px-3 py-2 text-amber-300 hover:bg-red-900 hover:text-amber-200 flex items-center justify-between font-bold transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <LogIn className="w-4 h-4 text-amber-400" />
                              Role-Based Login (Password)
                            </span>
                            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">Sign in</span>
                          </button>

                          {jwtToken && (
                            <button
                              onClick={() => {
                                setIsDropdownOpen(false);
                                onLogout?.();
                              }}
                              className="w-full text-left px-3 py-2 text-rose-200 hover:bg-red-900 hover:text-white flex items-center justify-between font-bold transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <LogOut className="w-4 h-4 text-rose-400" />
                                Logout (Clear Token)
                              </span>
                              <span className="text-[10px] bg-rose-900/60 text-rose-300 px-1.5 py-0.5 rounded font-mono">Sign out</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-rose-200 font-medium">Official Reproductive & Family Health Supply Chain System</p>
            </div>
          </div>
        </div>

        {/* Tab Links - Strict Role-Based Visibility */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Demand Request Form: Shown ONLY for Clinic Partners & Center Admin */}
          {(activeRole === 'clinic' || activeRole === 'center_admin') && (
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'form'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50 ring-1 ring-rose-400'
                  : 'text-rose-100 hover:bg-red-900/80 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Demand Request Form
            </button>
          )}

          {/* Requests & Tracker: Shown for everyone */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50 ring-1 ring-rose-400'
                : 'text-rose-100 hover:bg-red-900/80 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-300" />
            {activeRole === 'clinic' ? 'My Requests & Tracker' : activeRole === 'admin' ? 'Logistics Dispatch & Tracker' : 'Requests & Tracker'}
          </button>

          {/* Sales Queue: Shown ONLY for Sales Representatives, Logistics Admin, & Center Admin */}
          {(activeRole === 'sales' || activeRole === 'admin' || activeRole === 'center_admin') && (
            <button
              onClick={() => setActiveTab('review')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'review'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50 ring-1 ring-rose-400'
                  : 'text-rose-100 hover:bg-red-900/80 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              {activeRole === 'admin' ? 'Sales Queue (Audit)' : 'Sales Queue'}
            </button>
          )}

          {/* Center Admin Analytics Dashboard: Shown ONLY for Center Admin */}
          {activeRole === 'center_admin' && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50 ring-1 ring-rose-400'
                  : 'text-rose-100 hover:bg-red-900/80 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-rose-300" />
              Center Admin Analytics
            </button>
          )}

          {/* API & Keys: Shown ONLY for Center Admin */}
          {activeRole === 'center_admin' && (
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'api'
                  ? 'bg-rose-700 text-white shadow-lg shadow-rose-950/50 ring-1 ring-rose-400'
                  : 'text-rose-100 hover:bg-red-900/80 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4 text-amber-300" />
              API & Keys
            </button>
          )}
        </nav>

        {/* Role Switcher & Login Launcher */}
        <div className="flex items-center gap-2">
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              className="px-2.5 py-1.5 bg-red-900/90 hover:bg-red-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-red-700 shadow-sm transition-all cursor-pointer active:scale-95"
              title="Open QR Scanner & Checksum Verifier"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">QR Scanner</span>
            </button>
          )}

          <button
            onClick={onOpenLoginModal}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-red-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            title="Login with Username and Password"
          >
            <LogIn className="w-3.5 h-3.5 text-red-950" />
            <span>Role Login</span>
          </button>

          {/* Role Switcher / Locked Role Badge */}
          {currentUser && currentUser.role !== 'center_admin' ? (
            <div className="flex items-center gap-1.5 bg-red-900/90 border border-red-800 px-3 py-1.5 rounded-xl text-xs font-bold font-mono text-amber-300 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-rose-300" />
              <span className="capitalize">{currentUser.role === 'clinic' ? 'Clinic Partner' : currentUser.role === 'sales' ? 'Sales Representative' : 'Logistics Officer'}</span>
              <span className="text-[10px] bg-red-950 text-rose-300 px-1.5 py-0.5 rounded border border-red-800 font-sans font-normal">Locked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-red-900/90 border border-red-800 p-1 rounded-xl">
              <span className="text-[10px] font-mono text-rose-200 px-1 font-medium hidden sm:inline">Inspect:</span>
              <button
                onClick={() => onRoleChange('clinic')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeRole === 'clinic'
                    ? 'bg-white text-red-950 font-bold shadow'
                    : 'text-rose-200 hover:text-white'
                }`}
                title="Inspect Clinic Partner Dashboard View"
              >
                Clinic
              </button>
              <button
                onClick={() => onRoleChange('sales')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeRole === 'sales'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow'
                    : 'text-rose-200 hover:text-white'
                }`}
                title="Inspect Sales Rep Dashboard View"
              >
                Sales
              </button>
              <button
                onClick={() => onRoleChange('admin')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeRole === 'admin'
                    ? 'bg-rose-500 text-white font-bold shadow'
                    : 'text-rose-200 hover:text-white'
                }`}
                title="Inspect Logistics Officer Dashboard View"
              >
                Logistics
              </button>
              <button
                onClick={() => onRoleChange('center_admin')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeRole === 'center_admin'
                    ? 'bg-amber-400 text-red-950 font-black shadow ring-1 ring-amber-300'
                    : 'text-rose-200 hover:text-white'
                }`}
                title="Center Admin Master View"
              >
                Center Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
