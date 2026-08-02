import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { Lock, User as UserIcon, ShieldCheck, Key, AlertCircle, Loader2, X, Building2, UserCheck, Briefcase, Eye } from 'lucide-react';
import { SabaClinicLogo } from './Logos';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: User) => void;
  onNotify?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onNotify
}) => {
  const [username, setUsername] = useState('clinic1');
  const [password, setPassword] = useState('clinic123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('clinic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleRolePreset = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'clinic') {
      setUsername('clinic1');
      setPassword('clinic123');
    } else if (role === 'sales') {
      setUsername('sales1');
      setPassword('sales123');
    } else if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'center_admin') {
      setUsername('centeradmin');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.access_token) {
        throw new Error(data.error || data.detail || 'Invalid username or password credentials.');
      }

      onLoginSuccess(data.access_token, data.user);
      onNotify?.('success', 'Authentication Successful', `Logged in as ${data.user.full_name || data.user.username} (${data.user.role.toUpperCase()})`);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-red-950 border border-red-800 text-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-rose-950 to-red-900 p-6 border-b border-red-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-rose-300 hover:text-white bg-red-900/50 p-1.5 rounded-full hover:bg-red-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/95 p-1.5 rounded-xl border border-rose-300 shadow">
              <SabaClinicLogo className="h-8" />
            </div>
            <div className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-[10px] font-bold font-mono">
              Prepared by: Ahmed IT
            </div>
          </div>

          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            Role-Based Login Portal
          </h2>
          <p className="text-xs text-rose-200 mt-1">
            DKT ETHIOPIA Reproductive Health Supply Chain Authorization
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-rose-200 mb-2 font-mono">
              1. SELECT USER ROLE PRESET
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleRolePreset('clinic')}
                className={`p-2.5 rounded-2xl border text-left flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedRole === 'clinic'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-lg ring-2 ring-rose-400'
                    : 'bg-red-900/40 border-red-800 text-rose-200 hover:bg-red-900/80 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                <span className="text-[11px] font-bold">Partner Clinic</span>
                <span className="text-[9px] text-rose-200 font-mono">clinic1</span>
              </button>

              <button
                type="button"
                onClick={() => handleRolePreset('sales')}
                className={`p-2.5 rounded-2xl border text-left flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedRole === 'sales'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-lg ring-2 ring-rose-400'
                    : 'bg-red-900/40 border-red-800 text-rose-200 hover:bg-red-900/80 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-300" />
                <span className="text-[11px] font-bold">Sales Rep</span>
                <span className="text-[9px] text-rose-200 font-mono">sales1</span>
              </button>

              <button
                type="button"
                onClick={() => handleRolePreset('admin')}
                className={`p-2.5 rounded-2xl border text-left flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-lg ring-2 ring-rose-400'
                    : 'bg-red-900/40 border-red-800 text-rose-200 hover:bg-red-900/80 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-300" />
                <span className="text-[11px] font-bold">HQ Admin</span>
                <span className="text-[9px] text-rose-200 font-mono">admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRolePreset('center_admin')}
                className={`p-2.5 rounded-2xl border text-left flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedRole === 'center_admin'
                    ? 'bg-amber-500 border-amber-300 text-red-950 font-bold shadow-lg ring-2 ring-amber-300'
                    : 'bg-red-900/40 border-red-800 text-rose-200 hover:bg-red-900/80 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4 text-amber-300" />
                <span className="text-[11px] font-bold">Center Admin</span>
                <span className="text-[9px] font-mono opacity-80">centeradmin</span>
              </button>
            </div>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-950/90 border border-rose-600 text-rose-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-rose-200 mb-1">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. clinic1, sales1, admin"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-red-900/50 border border-red-700 rounded-xl text-sm text-white placeholder-rose-400/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-200 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-red-900/50 border border-red-700 rounded-xl text-sm text-white placeholder-rose-400/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-red-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-red-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 text-red-950" />
                  <span>Authenticate & Generate JWT</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Credentials Legend */}
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-xl text-[11px] text-rose-200 space-y-1 font-mono">
            <div className="font-bold text-amber-300 text-xs font-sans">Available Demo Credentials:</div>
            <div>• <strong className="text-white">Clinic Partner:</strong> username <span className="text-amber-300">clinic1</span> / password <span className="text-amber-300">clinic123</span></div>
            <div>• <strong className="text-white">Sales Executive:</strong> username <span className="text-amber-300">sales1</span> / password <span className="text-amber-300">sales123</span></div>
            <div>• <strong className="text-white">HQ Admin:</strong> username <span className="text-amber-300">admin</span> / password <span className="text-amber-300">admin123</span></div>
            <div>• <strong className="text-white">Center Admin (Read-Only):</strong> username <span className="text-amber-300">centeradmin</span> / password <span className="text-amber-300">admin123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
