import { useState } from 'preact/hooks';
import { Link } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { AgentAvatar } from '../components/ui/AgentAvatar';
import { cn } from '../lib/utils';
import { useAgents, type AgentListItem } from '../lib/hooks/useAgents';
import { formatTrust, truncAddress } from '../lib/format';
import { calculateTrustScore, type TrustScoreInput } from '@agentid/schema';

const CATEGORIES = [
  'data-processing', 'code-generation', 'task-automation', 'communication',
  'analysis', 'creative', 'financial', 'research', 'security', 'infrastructure'
];

function getAgentTier(agent: AgentListItem): string {
  const input: TrustScoreInput = {
    totalStaked: BigInt(agent.totalStaked || '0'),
    stakerCount: agent.stakersCount,
    sharePrice: BigInt(agent.sharePrice || '1000000000000000000'),
    forStake: BigInt(agent.totalStaked || '0'),
    againstStake: 0n,
    operatorStake: 0n,
    ageInDays: agent.createdAt
      ? Math.floor((Date.now() - new Date(agent.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    feedbackCount: 0,
    averageFeedbackScore: 0,
  };
  const score = calculateTrustScore(input);
  return score.tier.toUpperCase();
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

function SkeletonCard() {
  return (
    <Panel className="h-[220px] animate-pulse">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-raised rounded" />
          <div className="flex-1">
            <div className="h-4 bg-raised rounded w-24 mb-2" />
            <div className="h-3 bg-raised rounded w-16" />
          </div>
        </div>
        <div className="h-3 bg-raised rounded w-full" />
        <div className="h-3 bg-raised rounded w-3/4" />
        <div className="mt-auto flex justify-between">
          <div className="h-6 bg-raised rounded w-20" />
          <div className="h-6 bg-raised rounded w-12" />
        </div>
      </div>
    </Panel>
  );
}

export function Explorer() {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { agents, loading, error } = useAgents(search, activeFilters);

  const toggleFilter = (cat: string) => {
    setActiveFilters(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="flex flex-col gap-6">
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
          {CATEGORIES.map(cat => (
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
            </button>
          ))}
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
          <span>
            {loading ? 'Loading...' : `${agents.length} RESULTS`}
          </span>
          {error && <span className="text-red-400">{error}</span>}
        </div>
      </Panel>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Agent Cards - Grid View */}
      {!loading && view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.length > 0 ? (
            agents.map((agent) => {
              const tier = getAgentTier(agent);
              return (
                <Link key={agent.atomId} to={`/agents/${agent.atomId}`}>
                  <Panel className="relative overflow-hidden hover:border-accent/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-500 cursor-pointer group h-full flex flex-col justify-between bg-surface">
                    <div className="absolute -right-4 -bottom-8 text-[120px] font-serif italic text-raised group-hover:text-[#1a1a1a] transition-colors duration-500 select-none pointer-events-none z-0 leading-none">
                      {agent.name.charAt(0)}
                    </div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <AgentAvatar name={agent.name} size="md" />
                          <div>
                            <div className="text-fg font-medium group-hover:text-accent transition-colors">{agent.name}</div>
                            <div className="text-fg-dim text-[10px] tracking-widest font-mono">{truncAddress(agent.atomId)}</div>
                          </div>
                        </div>
                        <TierBadge tier={tier} />
                      </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-end border-t border-stroke group-hover:border-stroke-2 pt-4 mt-2 transition-colors duration-500">
                      <div>
                        <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Total Staked</div>
                        <div className="text-fg-soft text-lg font-light group-hover:text-white transition-colors">{formatTrust(agent.totalStaked)} <span className="text-fg-dim text-[10px]">tTRUST</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Stakers</div>
                        <div className="text-fg-muted text-sm">{agent.stakersCount}</div>
                      </div>
                    </div>
                  </Panel>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center text-fg-dim text-sm tracking-widest uppercase">
              {search ? `No agents found matching "${search}"` : 'No agents registered yet'}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {!loading && view === 'list' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center px-6 py-3 text-[8px] tracking-[0.2em] uppercase text-fg-dim">
            <div className="w-2/5">AGENT</div>
            <div className="w-1/5 text-center">TIER</div>
            <div className="w-1/5 text-right">STAKED</div>
            <div className="w-1/5 text-right">STAKERS</div>
          </div>

          {agents.length > 0 ? (
            agents.map((agent) => {
              const tier = getAgentTier(agent);
              return (
                <Link key={agent.atomId} to={`/agents/${agent.atomId}`}>
                  <div className="relative overflow-hidden flex items-center px-6 py-4 border border-stroke bg-surface hover:border-accent/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all duration-500 group">
                    <div className="relative z-10 flex items-center gap-4 w-2/5">
                      <AgentAvatar name={agent.name} size="sm" />
                      <div className="min-w-0">
                        <div className="text-fg font-medium group-hover:text-accent transition-colors truncate">{agent.name}</div>
                        <div className="text-fg-dim text-[10px] tracking-widest font-mono truncate">{truncAddress(agent.atomId)}</div>
                      </div>
                    </div>
                    <div className="relative z-10 w-1/5 flex justify-center">
                      <TierBadge tier={tier} />
                    </div>
                    <div className="relative z-10 w-1/5 text-right">
                      <div className="text-fg-soft text-sm font-medium group-hover:text-white transition-colors">{formatTrust(agent.totalStaked)}</div>
                      <div className="text-fg-dim text-[10px]">tTRUST</div>
                    </div>
                    <div className="relative z-10 w-1/5 text-right">
                      <div className="text-fg-muted text-sm">{agent.stakersCount}</div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-20 text-center text-fg-dim text-sm tracking-widest uppercase">
              {search ? `No agents found matching "${search}"` : 'No agents registered yet'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
