import { useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Panel } from '../components/ui/Panel';
import { AgentAvatar } from '../components/ui/AgentAvatar';

const historyData = [
  { date: '2024-01', score: 45 },
  { date: '2024-02', score: 52 },
  { date: '2024-03', score: 58 },
  { date: '2024-04', score: 65 },
  { date: '2024-05', score: 72 },
  { date: '2024-06', score: 78 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base border border-accent p-3 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
        <p className="text-fg-dim text-[10px] tracking-widest uppercase mb-1">{label}</p>
        <p className="text-accent text-lg font-light">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}

function ProgressBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex justify-between text-[10px] tracking-[0.2em] uppercase">
        <span className="text-fg-muted">{label} <span className="text-fg-dim">({weight})</span></span>
        <span className="text-fg">{score}/100</span>
      </div>
      <div className="h-1 w-full bg-stroke relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_10px_rgba(249,115,22,0.8)]"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function AgentDetail() {
  const { atomId } = useParams();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-6">
        <Panel className="p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <AgentAvatar name="CodeReviewer" size="xl" />
                <div>
                  <h1 className="text-3xl font-light tracking-tight text-fg mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">CodeReviewer</h1>
                  <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase">
                    <span className="text-fg-dim">{atomId || '0x1234...5678'}</span>
                    <button className="text-accent hover:text-accent-hover transition-colors">COPY</button>
                    <span className="px-2 py-1 border border-emerald-500/50 text-emerald-500 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]">ACTIVE</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-fg-dim text-[10px] tracking-[0.2em] uppercase mb-1">CREATED</div>
                <div className="text-fg-soft text-sm">2024-03-15</div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                <div className="w-1 h-1 bg-accent" /> DESCRIPTION
              </h3>
              <p className="text-fg-muted text-sm leading-relaxed border-l border-stroke-2 pl-4">
                An autonomous agent specialized in reviewing smart contracts and identifying potential vulnerabilities.
                Trained on a comprehensive dataset of known exploits and best practices.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                <div className="w-1 h-1 bg-accent" /> CAPABILITIES
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] tracking-[0.1em] px-3 py-1 border border-stroke-2 text-fg-soft bg-raised hover:border-accent hover:text-accent transition-colors cursor-default">code-generation</span>
                <span className="text-[10px] tracking-[0.1em] px-3 py-1 border border-stroke-2 text-fg-soft bg-raised hover:border-accent hover:text-accent transition-colors cursor-default">security</span>
                <span className="text-[10px] tracking-[0.1em] px-3 py-1 border border-stroke-2 text-fg-soft bg-raised hover:border-accent hover:text-accent transition-colors cursor-default">analysis</span>
              </div>
            </div>

            <div>
              <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                <div className="w-1 h-1 bg-accent" /> ENDPOINT INFO
              </h3>
              <div className="grid grid-cols-2 gap-4 border border-stroke p-4 bg-surface relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                <div>
                  <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">TYPE</div>
                  <div className="text-fg-soft text-sm">MCP</div>
                </div>
                <div>
                  <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">VERSION</div>
                  <div className="text-fg-soft text-sm">1.2.0</div>
                </div>
                <div className="col-span-2">
                  <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">URL</div>
                  <div className="text-accent text-sm break-all font-mono">https://api.codereviewer.agent/v1/mcp</div>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="p-8">
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> TRUST SCORE HISTORY
          </h3>
          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#333" tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#333" tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-8">
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> TRUST SCORE BREAKDOWN
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            <ProgressBar label="Staking" score={85} weight="25%" />
            <ProgressBar label="Diversity" score={70} weight="15%" />
            <ProgressBar label="Sentiment" score={92} weight="20%" />
            <ProgressBar label="Operator Commitment" score={60} weight="15%" />
            <ProgressBar label="Longevity" score={45} weight="10%" />
            <ProgressBar label="Feedback" score={88} weight="15%" />
          </div>
        </Panel>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-6">
        <Panel className="p-8 flex flex-col items-center text-center border-accent/30 shadow-[0_0_30px_rgba(249,115,22,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 w-full text-left">TRUST SCORE</h3>
          <div className="text-7xl font-light tracking-tighter text-fg mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">78</div>
          <span className="text-[10px] tracking-[0.2em] px-3 py-1 border border-emerald-400/50 text-emerald-400 bg-emerald-400/10 mb-6 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            HIGH
          </span>
          <div className="w-full flex justify-between text-[10px] tracking-[0.2em] uppercase border-t border-stroke pt-4 mb-4">
            <span className="text-fg-dim">CONFIDENCE</span>
            <span className="text-fg-soft">0.85</span>
          </div>
          <p className="text-fg-muted text-xs italic">
            "Trusted agent. Safe for most tasks."
          </p>
        </Panel>

        <Panel className="p-8 bg-surface">
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> STAKE POSITION
          </h3>
          <div className="flex flex-col gap-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="0.00"
                className="w-full bg-base border border-stroke-2 text-fg px-4 py-3 text-lg font-light focus:outline-none focus:border-accent focus:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-dim text-xs tracking-widest group-focus-within:text-accent transition-colors">tTRUST</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="text-[10px] tracking-[0.2em] uppercase py-3 border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                STAKE FOR
              </button>
              <button className="text-[10px] tracking-[0.2em] uppercase py-3 border border-red-500/50 text-red-500 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                STAKE AGAINST
              </button>
            </div>
            <div className="text-center mt-4 text-fg-dim text-[10px] tracking-widest">
              Connect wallet to stake
            </div>
          </div>
        </Panel>

        <Panel className="p-8">
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> VAULT STATS
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-stroke pb-2">
              <span className="text-fg-muted text-xs tracking-widest uppercase">Total Staked</span>
              <span className="text-fg text-sm font-medium">12,450 tTRUST</span>
            </div>
            <div className="flex justify-between items-center border-b border-stroke pb-2">
              <span className="text-fg-muted text-xs tracking-widest uppercase">Stakers</span>
              <span className="text-fg text-sm font-medium">342</span>
            </div>
            <div className="flex justify-between items-center border-b border-stroke pb-2">
              <span className="text-fg-muted text-xs tracking-widest uppercase">Share Price</span>
              <span className="text-fg text-sm font-medium">1.05 ETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-fg-muted text-xs tracking-widest uppercase">Market Cap</span>
              <span className="text-fg text-sm font-medium">13,072 ETH</span>
            </div>
          </div>
        </Panel>

        <Panel className="p-8">
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> OPERATOR INFO
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">ADDRESS</div>
              <div className="text-accent text-xs break-all font-mono hover:underline cursor-pointer">0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B</div>
            </div>
            <div>
              <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">OPERATOR STAKE</div>
              <div className="text-fg-soft text-sm font-medium">500 tTRUST</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
