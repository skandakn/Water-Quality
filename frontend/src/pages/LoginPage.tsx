import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'analyst' | 'viewer'>('admin');
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: 'admin' as const,
      name: 'Dr. Aditi Sharma',
      email: 'admin@jaaldrushti.org',
      password: 'Admin@123',
      badge: 'Admin Access',
      desc: 'Full read, write, lake deletion & CSV import permissions',
      color: '#06b6d4'
    },
    {
      role: 'analyst' as const,
      name: 'Rohan Verma',
      email: 'analyst@jaaldrushti.org',
      password: 'Analyst@123',
      badge: 'Analyst Access',
      desc: 'Telemetry upload, manual readings & alert acknowledge permissions',
      color: '#10b981'
    },
    {
      role: 'viewer' as const,
      name: 'Siddharth Rao',
      email: 'viewer@jaaldrushti.org',
      password: 'Viewer@123',
      badge: 'Public Viewer',
      desc: 'Read-only access to lake maps, trends & published dossiers',
      color: '#38bdf8'
    }
  ];

  const handleQuickLogin = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedRole(acc.role);
    // Directly navigate to dashboard for seamless hackathon review
    navigate('/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email or choose a demo account below.');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-3">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
            JAAL DRUSHTI
          </h1>
          <p className="text-xs text-cyan-400 font-mono uppercase tracking-wider font-semibold">
            Environmental Intelligence Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-[#0b1426]/95 border border-cyan-500/20 p-6 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@jaaldrushti.org"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>Sign In to Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant 1-Click Demo Accounts */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                1-Click Hackathon Evaluator Access
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Instant Auth</span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {acc.name}
                      </span>
                      <span 
                        className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                        style={{ 
                          backgroundColor: `${acc.color}15`, 
                          color: acc.color,
                          borderColor: `${acc.color}35`
                        }}
                      >
                        {acc.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{acc.desc}</p>
                  </div>
                  <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
