import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Panel } from '../components/ui/Panel';
import { StatItem } from '../components/ui/StatItem';
import { AgentAvatar } from '../components/ui/AgentAvatar';
import { cn } from '../lib/utils';

const MY_AGENTS = [
  { id: '1', name: 'CodeReviewer', staked: '12,450', stakers: 342, tier: 'ELITE' },
  { id: '2', name: 'DataAnalyzer', staked: '8,210', stakers: 215, tier: 'HIGH' },
];

const MY_POSITIONS = [
  { id: '1', agentName: 'CodeReviewer', shares: '150.5', value: '1.25', type: 'FOR' },
  { id: '3', agentName: 'SecurityBot', shares: '45.2', value: '0.38', type: 'FOR' },
  { id: '6', agentName: 'CreativeWriter', shares: '12.0', value: '0.05', type: 'AGAINST' },
];

const portfolioData = [
  { date: '2024-01', value: 0.5 },
  { date: '2024-02', value: 0.8 },
  { date: '2024-03', value: 1.1 },
  { date: '2024-04', value: 1.0 },
  { date: '2024-05', value: 1.4 },
  { date: '2024-06', value: 1.68 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base border border-accent p-3 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
        <p className="text-fg-dim text-[10px] tracking-widest uppercase mb-1">{label}</p>
        <p className="text-accent text-lg font-light">{payload[0].value} ETH</p>
      </div>
    );
  }
  return null;
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

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="flex flex-col justify-center gap-8 py-8 px-12 col-span-1 border-accent/30 shadow-[0_0_30px_rgba(249,115,22,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          <StatItem label="PORTFOLIO VALUE" value="1.68 ETH" />
          <div className="flex flex-col gap-4 border-t border-stroke pt-6">
            <div className="flex justify-between items-center">
              <span className="text-fg-dim text-[10px] tracking-[0.3em] uppercase">MY AGENTS</span>
              <span className="text-fg text-xl font-light">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-fg-dim text-[10px] tracking-[0.3em] uppercase">ACTIVE POSITIONS</span>
              <span className="text-fg text-xl font-light">3</span>
            </div>
          </div>
        </Panel>

        <Panel className="col-span-1 lg:col-span-2 p-8">
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> PORTFOLIO PERFORMANCE
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#333" tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#333" tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> MY REGISTERED AGENTS
          </h2>
          <Link to="/register" className="text-accent text-[10px] tracking-[0.2em] uppercase hover:text-accent-hover transition-colors border border-accent/30 px-4 py-2 hover:bg-accent/10">+ Register New</Link>
        </div>

        <div className="flex flex-col gap-4">
          {MY_AGENTS.map(agent => (
            <Link key={agent.id} to={`/agents/${agent.id}`}>
              <div className="relative overflow-hidden flex items-center justify-between p-4 border border-stroke bg-surface hover:border-accent/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-transparent to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-500 z-0 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-4 w-1/3">
                  <AgentAvatar name={agent.name} size="md" />
                  <div>
                    <div className="text-fg font-medium group-hover:text-accent transition-colors">{agent.name}</div>
                    <div className="text-fg-dim text-[10px] tracking-widest font-mono">0x{agent.id.repeat(4)}...</div>
                  </div>
                </div>
                <div className="relative z-10 w-1/4 flex justify-center">
                  <TierBadge tier={agent.tier} />
                </div>
                <div className="relative z-10 w-1/4 text-right">
                  <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Total Staked</div>
                  <div className="text-fg-soft text-sm font-medium group-hover:text-white transition-colors">{agent.staked} tTRUST</div>
                </div>
                <div className="relative z-10 w-1/4 text-right">
                  <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Stakers</div>
                  <div className="text-fg-soft text-sm font-medium">{agent.stakers}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> MY STAKING POSITIONS
          </h2>
          <Link to="/agents" className="text-accent text-[10px] tracking-[0.2em] uppercase hover:text-accent-hover transition-colors">Explore Agents →</Link>
        </div>

        <div className="flex flex-col gap-4">
          {MY_POSITIONS.map(pos => (
            <div key={pos.id} className="relative overflow-hidden flex items-center justify-between p-4 border border-stroke bg-surface hover:border-stroke-2 transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-r from-stroke-3/0 via-transparent to-stroke-3/0 group-hover:from-stroke-3/5 group-hover:to-transparent transition-all duration-500 z-0 pointer-events-none" />

              <div className="relative z-10 w-1/4">
                <Link to={`/agents/${pos.id}`} className="text-fg font-medium hover:text-accent transition-colors">
                  {pos.agentName}
                </Link>
              </div>
              <div className="relative z-10 w-1/4 text-center">
                <span className={cn(
                  "text-[8px] tracking-[0.2em] px-2 py-1 border",
                  pos.type === 'FOR'
                    ? "text-emerald-400 border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "text-red-400 border-red-400/50 bg-red-400/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                )}>
                  {pos.type}
                </span>
              </div>
              <div className="relative z-10 w-1/4 text-right">
                <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Shares</div>
                <div className="text-fg-soft text-sm font-medium group-hover:text-white transition-colors">{pos.shares}</div>
              </div>
              <div className="relative z-10 w-1/4 text-right">
                <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Value</div>
                <div className="text-fg-soft text-sm font-medium group-hover:text-white transition-colors">{pos.value} ETH</div>
              </div>
              <div className="relative z-10 w-auto pl-8">
                <button className="text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-stroke-3 text-fg-soft hover:border-accent hover:text-accent hover:bg-accent/10 transition-all">
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
