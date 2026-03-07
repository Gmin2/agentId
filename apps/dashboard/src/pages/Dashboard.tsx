import { Link } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { StatItem } from '../components/ui/StatItem';
import { AgentAvatar } from '../components/ui/AgentAvatar';
import { cn } from '../lib/utils';
import { useWallet } from '../lib/wallet';
import { useUserPositions, type UserPosition, type UserAgent } from '../lib/hooks/useUserPositions';
import { formatTrust, truncAddress } from '../lib/format';

export function Dashboard() {
  const { address, connect } = useWallet();
  const { positions, myAgents, loading, error } = useUserPositions();

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="text-fg-dim text-[10px] tracking-[0.3em] uppercase">WALLET NOT CONNECTED</div>
        <p className="text-fg-muted text-xs text-center max-w-sm">
          Connect your wallet to view your registered agents and staking positions.
        </p>
        <button
          onClick={connect}
          className="text-[10px] tracking-[0.2em] uppercase px-8 py-3 border border-accent text-accent hover:bg-accent/10 transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const totalValue = positions.reduce((sum, pos) => sum + BigInt(pos.totalAssets || '0'), 0n);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="flex flex-col justify-center gap-8 py-8 px-12 col-span-1 border-accent/30 shadow-[0_0_30px_rgba(249,115,22,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          <StatItem label="PORTFOLIO VALUE" value={`${formatTrust(totalValue)} tTRUST`} />
          <div className="flex flex-col gap-4 border-t border-stroke pt-6">
            <div className="flex justify-between items-center">
              <span className="text-fg-dim text-[10px] tracking-[0.3em] uppercase">MY AGENTS</span>
              <span className="text-fg text-xl font-light">{myAgents.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-fg-dim text-[10px] tracking-[0.3em] uppercase">ACTIVE POSITIONS</span>
              <span className="text-fg text-xl font-light">{positions.length}</span>
            </div>
          </div>
        </Panel>

        <Panel className="col-span-1 lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase flex items-center gap-2">
              <div className="w-1 h-1 bg-accent" /> PORTFOLIO BREAKDOWN
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-accent font-mono text-[10px]">{truncAddress(address, 6)}</span>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <span className="text-fg-dim text-[10px] tracking-widest uppercase animate-pulse">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48">
              <span className="text-red-400 text-[10px]">{error}</span>
            </div>
          ) : (
            <PortfolioChart positions={positions} myAgents={myAgents} />
          )}
        </Panel>
      </div>

      {/* My Agents */}
      <Panel className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> MY REGISTERED AGENTS
          </h2>
          <Link to="/register" className="text-accent text-[10px] tracking-[0.2em] uppercase hover:text-accent-hover transition-colors border border-accent/30 px-4 py-2 hover:bg-accent/10">+ Register New</Link>
        </div>

        {myAgents.length > 0 ? (
          <div className="flex flex-col gap-4">
            {myAgents.map(agent => (
              <Link key={agent.atomId} to={`/agents/${agent.atomId}`}>
                <div className="relative overflow-hidden flex items-center justify-between p-4 border border-stroke bg-surface hover:border-accent/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all duration-500 group">
                  <div className="relative z-10 flex items-center gap-4 w-1/3">
                    <AgentAvatar name={agent.name} size="md" />
                    <div>
                      <div className="text-fg font-medium group-hover:text-accent transition-colors">{agent.name}</div>
                      <div className="text-fg-dim text-[10px] tracking-widest font-mono">{truncAddress(agent.atomId)}</div>
                    </div>
                  </div>
                  <div className="relative z-10 w-1/4 text-right">
                    <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Total Staked</div>
                    <div className="text-fg-soft text-sm font-medium group-hover:text-white transition-colors">{formatTrust(agent.totalStaked)} tTRUST</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-fg-dim text-[10px] tracking-widest uppercase">
            {loading ? 'Loading...' : 'No agents registered yet.'}
            {!loading && <Link to="/register" className="text-accent ml-2 hover:underline">Register one</Link>}
          </div>
        )}
      </Panel>

      {/* My Staking Positions */}
      <Panel className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> MY STAKING POSITIONS
          </h2>
          <Link to="/agents" className="text-accent text-[10px] tracking-[0.2em] uppercase hover:text-accent-hover transition-colors">Explore Agents</Link>
        </div>

        {positions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {positions.map(pos => (
              <div key={pos.id} className="relative overflow-hidden flex items-center justify-between p-4 border border-stroke bg-surface hover:border-stroke-2 transition-all duration-500 group">
                <div className="relative z-10 w-1/4">
                  {pos.agentAtomId ? (
                    <Link to={`/agents/${pos.agentAtomId}`} className="text-fg font-medium hover:text-accent transition-colors">
                      {pos.agentName}
                    </Link>
                  ) : (
                    <span className="text-fg font-medium">{pos.agentName}</span>
                  )}
                </div>
                <div className="relative z-10 w-1/4 text-center">
                  <span className={cn(
                    "text-[8px] tracking-[0.2em] px-2 py-1 border",
                    pos.vaultType === 'FOR'
                      ? "text-emerald-400 border-emerald-400/50 bg-emerald-400/10"
                      : "text-red-400 border-red-400/50 bg-red-400/10"
                  )}>
                    {pos.vaultType}
                  </span>
                </div>
                <div className="relative z-10 w-1/4 text-right">
                  <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Shares</div>
                  <div className="text-fg-soft text-sm font-medium">{formatTrust(pos.shares)}</div>
                </div>
                <div className="relative z-10 w-1/4 text-right">
                  <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Value</div>
                  <div className="text-fg-soft text-sm font-medium">{formatTrust(pos.totalAssets)} tTRUST</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-fg-dim text-[10px] tracking-widest uppercase">
            {loading ? 'Loading...' : 'No staking positions yet.'}
            {!loading && <Link to="/agents" className="text-accent ml-2 hover:underline">Explore agents</Link>}
          </div>
        )}
      </Panel>
    </div>
  );
}

// --- Portfolio visualization ---

const BAR_COLORS = [
  'bg-accent',
  'bg-emerald-400',
  'bg-sky-400',
  'bg-violet-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-teal-400',
  'bg-indigo-400',
  'bg-pink-400',
  'bg-lime-400',
];

const DOT_COLORS = [
  'bg-accent',
  'bg-emerald-400',
  'bg-sky-400',
  'bg-violet-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-teal-400',
  'bg-indigo-400',
  'bg-pink-400',
  'bg-lime-400',
];

function PortfolioChart({ positions, myAgents }: { positions: UserPosition[]; myAgents: UserAgent[] }) {
  if (positions.length === 0 && myAgents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1" className="text-stroke" />
          <path d="M14 28 L20 22 L26 26 L34 16" stroke="currentColor" strokeWidth="1.5" className="text-accent" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-fg-dim text-[10px] tracking-widest uppercase">No positions yet</span>
        <Link to="/agents" className="text-accent text-[10px] tracking-[0.2em] uppercase hover:underline">Start staking</Link>
      </div>
    );
  }

  // Aggregate positions by agent name
  const agentTotals = new Map<string, { name: string; total: bigint; atomId: string | null }>();
  for (const pos of positions) {
    const key = pos.agentName;
    const existing = agentTotals.get(key);
    const val = BigInt(pos.totalAssets || '0');
    if (existing) {
      existing.total += val;
    } else {
      agentTotals.set(key, { name: pos.agentName, total: val, atomId: pos.agentAtomId });
    }
  }

  const sorted = Array.from(agentTotals.values()).sort((a, b) => (b.total > a.total ? 1 : -1));
  const grandTotal = sorted.reduce((s, a) => s + a.total, 0n);
  const topAgents = sorted.slice(0, 8);

  return (
    <div className="flex flex-col gap-5">
      {/* Horizontal stacked bar */}
      <div className="flex h-8 w-full overflow-hidden border border-stroke">
        {topAgents.map((agent, i) => {
          const pct = grandTotal > 0n ? Number((agent.total * 10000n) / grandTotal) / 100 : 0;
          if (pct < 1) return null;
          return (
            <div
              key={agent.name}
              className={cn(BAR_COLORS[i % BAR_COLORS.length], 'h-full opacity-70 hover:opacity-100 transition-opacity relative group')}
              style={{ width: `${pct}%` }}
              title={`${agent.name}: ${pct.toFixed(1)}%`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-base border border-stroke px-2 py-0.5 text-[8px] text-fg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {agent.name} ({pct.toFixed(1)}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend + breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topAgents.map((agent, i) => {
          const pct = grandTotal > 0n ? Number((agent.total * 10000n) / grandTotal) / 100 : 0;
          return (
            <div key={agent.name} className="flex items-center gap-2 group">
              <div className={cn('w-2 h-2 flex-shrink-0', DOT_COLORS[i % DOT_COLORS.length])} />
              <div className="flex flex-col min-w-0">
                {agent.atomId ? (
                  <Link to={`/agents/${agent.atomId}`} className="text-fg text-[10px] truncate hover:text-accent transition-colors">
                    {agent.name}
                  </Link>
                ) : (
                  <span className="text-fg text-[10px] truncate">{agent.name}</span>
                )}
                <span className="text-fg-dim text-[9px] font-mono">{formatTrust(agent.total)} ({pct.toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between pt-3 border-t border-stroke">
        <div className="flex gap-6">
          <div>
            <div className="text-fg-dim text-[7px] tracking-[0.25em] uppercase mb-1">Positions</div>
            <div className="text-fg text-sm font-light">{positions.length}</div>
          </div>
          <div>
            <div className="text-fg-dim text-[7px] tracking-[0.25em] uppercase mb-1">Agents Staked</div>
            <div className="text-fg text-sm font-light">{agentTotals.size}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-fg-dim text-[7px] tracking-[0.25em] uppercase mb-1">Total Value</div>
          <div className="text-accent text-sm font-light">{formatTrust(grandTotal)} tTRUST</div>
        </div>
      </div>
    </div>
  );
}
