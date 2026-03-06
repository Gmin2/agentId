import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export function Navbar() {
  const location = useLocation();

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
        <button className="text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-accent/50 text-accent hover:bg-accent/10 transition-colors">
          Connect Wallet
        </button>
      </div>
    </nav>
  );
}
