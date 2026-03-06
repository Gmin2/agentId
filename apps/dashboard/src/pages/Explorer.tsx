import { useState } from 'preact/hooks';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Panel } from '../components/ui/Panel';
import { AgentAvatar } from '../components/ui/AgentAvatar';
import { cn } from '../lib/utils';

const CATEGORIES = [
  'data-processing', 'code-generation', 'task-automation', 'communication',
  'analysis', 'creative', 'financial', 'research', 'security', 'infrastructure'
];

const TIER_ORDER = { ELITE: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;

const MOCK_AGENTS = [
  { id: '0xa1b2c3d4', name: 'CodeReviewer', staked: '12,450', stakersCount: 342, tier: 'ELITE', category: 'code-generation', description: 'Smart contract auditing & vulnerability detection', sparkline: [65, 72, 68, 80, 85, 78, 90, 95, 88, 92] },
  { id: '0xd4e5f6a7', name: 'DataAnalyzer', staked: '8,210', stakersCount: 215, tier: 'HIGH', category: 'analysis', description: 'On-chain data analysis & pattern recognition', sparkline: [40, 45, 55, 60, 58, 65, 70, 68, 75, 72] },
  { id: '0xb8c9d0e1', name: 'SecurityBot', staked: '6,100', stakersCount: 189, tier: 'HIGH', category: 'security', description: 'Real-time threat monitoring & incident response', sparkline: [30, 35, 42, 38, 50, 55, 48, 60, 58, 65] },
  { id: '0xf2a3b4c5', name: 'DeFiTrader', staked: '4,500', stakersCount: 120, tier: 'MEDIUM', category: 'financial', description: 'Automated DeFi strategy execution', sparkline: [20, 35, 28, 45, 40, 55, 50, 42, 60, 48] },
  { id: '0xe6f7a8b9', name: 'ResearchAsst', staked: '3,200', stakersCount: 95, tier: 'MEDIUM', category: 'research', description: 'Academic paper analysis & knowledge synthesis', sparkline: [15, 20, 25, 30, 28, 35, 40, 38, 42, 45] },
  { id: '0xc0d1e2f3', name: 'TaskRouter', staked: '5,800', stakersCount: 178, tier: 'HIGH', category: 'task-automation', description: 'Intelligent task delegation & orchestration', sparkline: [50, 55, 48, 62, 58, 70, 65, 75, 72, 80] },
  { id: '0xa4b5c6d7', name: 'ChatBridge', staked: '2,900', stakersCount: 88, tier: 'MEDIUM', category: 'communication', description: 'Cross-platform communication & translation', sparkline: [25, 30, 28, 35, 40, 38, 45, 42, 50, 48] },
  { id: '0xd8e9f0a1', name: 'CreativeGen', staked: '1,800', stakersCount: 67, tier: 'LOW', category: 'creative', description: 'Generative art & content creation', sparkline: [10, 15, 12, 18, 20, 16, 22, 25, 20, 28] },
  { id: '0xb2c3d4e5', name: 'InfraWatch', staked: '7,300', stakersCount: 201, tier: 'HIGH', category: 'infrastructure', description: 'Infrastructure monitoring & auto-scaling', sparkline: [45, 50, 55, 52, 60, 65, 58, 70, 68, 75] },
  { id: '0xf6a7b8c9', name: 'DataPipe', staked: '3,600', stakersCount: 102, tier: 'MEDIUM', category: 'data-processing', description: 'Real-time data pipeline management', sparkline: [18, 22, 28, 25, 32, 35, 30, 40, 38, 42] },
  { id: '0xe0f1a2b3', name: 'AuditPro', staked: '9,100', stakersCount: 256, tier: 'ELITE', category: 'security', description: 'Comprehensive protocol audit automation', sparkline: [55, 60, 65, 70, 68, 75, 80, 78, 85, 88] },
  { id: '0xc4d5e6f7', name: 'YieldBot', staked: '2,100', stakersCount: 74, tier: 'LOW', category: 'financial', description: 'Yield farming optimization & rebalancing', sparkline: [8, 12, 10, 15, 18, 14, 20, 22, 18, 25] },
].map(a => ({ ...a, sparkline: a.sparkline.map(v => ({ value: v })) }));

const networkActivity = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  volume: Math.sin(i * 0.3) * 300 + 700 + Math.sin(i * 0.7) * 150
}));

function Sparkline({ data, color }: { data: { value: number }[], color: string }) {
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.1} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    ELITE: 'text-accent border-accent/50 bg-accent/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
    HIGH: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    MEDIUM: 'text-blue-400 border-blue-400/50 bg-blue-400/10 shadow-[0_0_10px_rgba(96,165,250,0.2)]',
    LOW: 'text-fg-muted border-stroke-3 bg-stroke',
  };

  return (
    <span className={cn("text-[8px] tracking-[0.2em] px-2 py-1 border", colors[tier] || colors.LOW)}>
      {tier}
    </span>
  );
}

function tierColor(tier: string) {
  return tier === 'ELITE' ? '#f97316' : tier === 'HIGH' ? '#10b981' : tier === 'MEDIUM' ? '#60a5fa' : '#555';
}

export function Explorer() {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const toggleFilter = (cat: string) => {
    setActiveFilters(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredAgents = MOCK_AGENTS
    .filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase()) || agent.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilters.length === 0 || activeFilters.includes(agent.category);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => (TIER_ORDER[a.tier as keyof typeof TIER_ORDER] ?? 3) - (TIER_ORDER[b.tier as keyof typeof TIER_ORDER] ?? 3));

  return (
    <div className="flex flex-col gap-6">
      {/* Network Activity Banner */}
      <Panel className="p-0 overflow-hidden h-32 relative flex items-center justify-between border-accent/30">
        <div className="absolute inset-0 bg-gradient-to-r from-base via-transparent to-base z-10 pointer-events-none" />
        <div className="absolute inset-0 opacity-30">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={networkActivity}>
              <Area type="monotone" dataKey="volume" stroke="#f97316" strokeWidth={1} fill="#f97316" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="relative z-20 px-8 flex flex-col gap-1">
          <span className="text-accent text-[10px] tracking-[0.3em] uppercase">NETWORK ACTIVITY</span>
          <span className="text-fg text-2xl font-light">24.5k <span className="text-fg-dim text-sm">TX/s</span></span>
        </div>
        <div className="relative z-20 px-8 text-right flex flex-col gap-1">
          <span className="text-fg-dim text-[10px] tracking-[0.3em] uppercase">GLOBAL STAKE</span>
          <span className="text-fg text-2xl font-light">1.2M <span className="text-fg-dim text-sm">tTRUST</span></span>
        </div>
      </Panel>

      {/* Search & Filters */}
      <Panel className="flex flex-col gap-6 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-light tracking-tight text-fg flex items-center gap-3">
            <div className="w-2 h-2 bg-accent shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            AGENT EXPLORER
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64 group">
              <input
                type="text"
                placeholder="SEARCH AGENTS..."
                value={search}
                onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
                className="w-full bg-surface border border-stroke-2 text-fg px-4 py-2 text-xs tracking-widest focus:outline-none focus:border-accent focus:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-dim text-xs group-focus-within:text-accent transition-colors">/</div>
            </div>
            {/* View Toggle */}
            <div className="flex border border-stroke-2">
              <button
                onClick={() => setView('grid')}
                className={cn("px-3 py-2 text-[10px] tracking-widest transition-colors", view === 'grid' ? 'bg-accent/10 text-accent' : 'text-fg-muted hover:text-fg-soft')}
              >
                GRID
              </button>
              <button
                onClick={() => setView('list')}
                className={cn("px-3 py-2 text-[10px] tracking-widest transition-colors border-l border-stroke-2", view === 'list' ? 'bg-accent/10 text-accent' : 'text-fg-muted hover:text-fg-soft')}
              >
                LIST
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-stroke">
          {CATEGORIES.map(cat => {
            const count = MOCK_AGENTS.filter(a => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => toggleFilter(cat)}
                className={cn(
                  "text-[10px] tracking-[0.1em] px-3 py-1 border transition-all flex items-center gap-2",
                  activeFilters.includes(cat)
                    ? "border-accent text-accent bg-accent/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                    : "border-stroke-2 text-fg-muted hover:border-stroke-3 hover:text-fg-soft bg-surface"
                )}
              >
                {cat}
                <span className={cn("text-[8px]", activeFilters.includes(cat) ? "text-accent/60" : "text-fg-dim")}>{count}</span>
              </button>
            );
          })}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="text-[10px] tracking-[0.1em] px-3 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
            >
              CLEAR ALL
            </button>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 text-[10px] tracking-[0.2em] uppercase text-fg-dim">
          <span>{filteredAgents.length} RESULTS</span>
          <select className="bg-transparent border-none outline-none text-fg-muted cursor-pointer hover:text-fg-soft transition-colors">
            <option>MOST STAKED</option>
            <option>MOST STAKERS</option>
            <option>NEWEST</option>
          </select>
        </div>
      </Panel>

      {/* Agent Cards - Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <Link key={agent.id} to={`/agents/${agent.id}`}>
                <Panel className="relative overflow-hidden hover:border-accent/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-500 cursor-pointer group h-full flex flex-col justify-between bg-surface">
                  {/* Decorative background letter */}
                  <div className="absolute -right-4 -bottom-8 text-[120px] font-serif italic text-raised group-hover:text-[#1a1a1a] transition-colors duration-500 select-none pointer-events-none z-0 leading-none">
                    {agent.name.charAt(0)}
                  </div>

                  {/* Top accent line on hover */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-transparent to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-500 z-0" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <AgentAvatar name={agent.name} size="md" />
                        <div>
                          <div className="text-fg font-medium group-hover:text-accent transition-colors">{agent.name}</div>
                          <div className="text-fg-dim text-[10px] tracking-widest font-mono">{agent.id}...</div>
                        </div>
                      </div>
                      <TierBadge tier={agent.tier} />
                    </div>

                    {/* Description */}
                    <p className="text-fg-muted text-xs leading-relaxed mb-4 line-clamp-2">{agent.description}</p>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[8px] tracking-[0.2em] px-2 py-1 border border-stroke-2 text-fg-muted bg-raised group-hover:border-stroke-3 transition-colors">
                        {agent.category}
                      </span>
                      <div className="opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                        <Sparkline data={agent.sparkline} color={tierColor(agent.tier)} />
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex justify-between items-end border-t border-stroke group-hover:border-stroke-2 pt-4 mt-2 transition-colors duration-500">
                    <div>
                      <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Total Staked</div>
                      <div className="text-fg-soft text-lg font-light group-hover:text-white transition-colors">{agent.staked} <span className="text-fg-dim text-[10px]">tTRUST</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Stakers</div>
                      <div className="text-fg-muted text-sm">{agent.stakersCount}</div>
                    </div>
                  </div>
                </Panel>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-fg-dim text-sm tracking-widest uppercase">
              No agents found matching "{search}"
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center px-6 py-3 text-[8px] tracking-[0.2em] uppercase text-fg-dim">
            <div className="w-2/5">AGENT</div>
            <div className="w-1/5 text-center">TIER</div>
            <div className="w-1/5 text-right">STAKED</div>
            <div className="w-1/5 text-right">TREND</div>
          </div>

          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <Link key={agent.id} to={`/agents/${agent.id}`}>
                <div className="relative overflow-hidden flex items-center px-6 py-4 border border-stroke bg-surface hover:border-accent/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all duration-500 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-transparent to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-500 z-0 pointer-events-none" />

                  <div className="relative z-10 flex items-center gap-4 w-2/5">
                    <AgentAvatar name={agent.name} size="sm" />
                    <div className="min-w-0">
                      <div className="text-fg font-medium group-hover:text-accent transition-colors truncate">{agent.name}</div>
                      <div className="text-fg-dim text-[10px] tracking-widest font-mono truncate">{agent.id} · {agent.category}</div>
                    </div>
                  </div>

                  <div className="relative z-10 w-1/5 flex justify-center">
                    <TierBadge tier={agent.tier} />
                  </div>

                  <div className="relative z-10 w-1/5 text-right">
                    <div className="text-fg-soft text-sm font-medium group-hover:text-white transition-colors">{agent.staked}</div>
                    <div className="text-fg-dim text-[10px]">{agent.stakersCount} stakers</div>
                  </div>

                  <div className="relative z-10 w-1/5 flex justify-end">
                    <Sparkline data={agent.sparkline} color={tierColor(agent.tier)} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-20 text-center text-fg-dim text-sm tracking-widest uppercase">
              No agents found matching "{search}"
            </div>
          )}
        </div>
      )}

      {filteredAgents.length > 0 && (
        <div className="flex justify-center mt-8">
          <button className="text-[10px] tracking-[0.2em] uppercase px-6 py-3 border border-stroke-2 text-fg-muted hover:border-accent hover:text-accent hover:bg-accent/10 transition-all">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
