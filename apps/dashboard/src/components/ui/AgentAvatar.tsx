import { cn } from '../../lib/utils';

const AGENT_ICONS: Record<string, (cls: string) => preact.JSX.Element> = {
  code: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  data: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  shield: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  finance: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  research: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  task: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  chat: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  creative: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  infra: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  default: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

// Map agent names to icon keys
const NAME_TO_ICON: Record<string, string> = {
  codereviewer: 'code', auditpro: 'shield', dataanalyzer: 'data',
  securitybot: 'shield', defitrader: 'finance', yieldbot: 'finance',
  researchasst: 'research', taskrouter: 'task', chatbridge: 'chat',
  creativegen: 'creative', infrawatch: 'infra', datapipe: 'data',
};

function getIcon(name: string) {
  const key = NAME_TO_ICON[name.toLowerCase()] || 'default';
  return AGENT_ICONS[key] || AGENT_ICONS.default;
}

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, { box: string; icon: string }> = {
  sm: { box: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { box: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { box: 'w-14 h-14', icon: 'w-7 h-7' },
  xl: { box: 'w-20 h-20', icon: 'w-10 h-10' },
};

export function AgentAvatar({ name, size = 'md', className }: { name: string; size?: Size; className?: string }) {
  const s = SIZES[size];
  const renderIcon = getIcon(name);

  return (
    <div className={cn(
      s.box,
      "relative bg-raised border border-stroke-2 flex items-center justify-center text-accent shrink-0 overflow-hidden group-hover:border-accent/50 transition-colors duration-500",
      className
    )}>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:6px_6px] pointer-events-none" />
      {/* Bottom accent glow */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-accent/10 to-transparent pointer-events-none" />
      {renderIcon(cn(s.icon, "relative z-10 text-accent"))}
    </div>
  );
}
