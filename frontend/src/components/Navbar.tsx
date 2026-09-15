import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Waves, Eye, Activity, MapPin, TrendingUp, Sparkles, 
  AlertTriangle, FileText, Database, Info, Menu, X, ShieldCheck, Satellite
} from 'lucide-react';

interface NavbarProps {
  currentLakeId?: number;
  onSelectLake?: (id: number) => void;
  isDemoMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isDemoMode = true }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'Lakes', path: '/lakes', icon: MapPin },
    { label: 'Water Quality', path: '/dashboard#water-quality', icon: Waves },
    { label: 'Satellite Monitor', path: '/dashboard#satellite', icon: Eye },
    { label: 'Prithvi AI', path: '/prithvi', icon: Satellite },
    { label: 'Trends', path: '/trends', icon: TrendingUp },
    { label: 'Predictions', path: '/predictions', icon: Sparkles },
    { label: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Data Management', path: '/data-management', icon: Database },
    { label: 'About', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-[#070d1a]/90 backdrop-blur-md">
      {/* Top Notification Bar / Demo Indicator */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-950/80 border-b border-cyan-500/20 px-4 py-1 text-xs flex items-center justify-between text-cyan-300">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-semibold uppercase tracking-wider">DEMO MODE ACTIVE</span>
            <span className="text-slate-400">— PS 4.2 Lake Water Quality Intelligence System</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span>Model: <strong className="text-cyan-300">RF-TS v1.0</strong></span>
            <span>•</span>
            <span>Methodology: <strong className="text-cyan-300">WAWQI Standard</strong></span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all">
              {/* Composite Logo: Water Droplet + Eye + Signal */}
              <Waves className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#070d1a] flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-['Outfit']">JAAL DRUSHTI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">AI</span>
              </div>
              <p className="text-[11px] font-medium text-cyan-400/80 tracking-wider uppercase -mt-0.5">
                See. Analyze. Predict. Protect.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path.includes('#') && location.pathname === '/dashboard');
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Status */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">Sensors Online</span>
            </div>
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              Command Center
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#070d1a] px-4 pt-2 pb-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
