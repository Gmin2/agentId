import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Logo } from './Logo';
import { useWallet } from '../lib/wallet';
import { truncAddress } from '../lib/format';

export function Navbar() {
  const location = useLocation();
  const { address, isConnecting, connect, disconnect } = useWallet();

  const navItem = (path: string, label: string) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return (
      <Link
        to={path}
        className={cn(
          "text-[10px] tracking-[0.2em] uppercase px-4 py-2 border transition-colors",
          isActive
            ? "border-stroke-3 text-fg bg-stroke/30"
            : "border-transparent text-fg-muted hover:text-fg-soft hover:border-stroke-2"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex items-center justify-between py-6 border-b border-stroke mb-8">
      <Link to="/" className="flex items-center gap-3">
        <Logo className="w-8 h-8" />
        <span className="text-lg tracking-[0.3em] font-bold text-fg">AGENTID</span>
      </Link>
      <div className="hidden md:flex items-center gap-2">
        {navItem('/agents', 'Explore')}
        {navItem('/register', 'Register')}
        {navItem('/dashboard', 'Dashboard')}
      </div>
      <div>
        {address ? (
          <button
            onClick={disconnect}
            className="text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            {truncAddress(address)}
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-accent/50 text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}
