import { useState } from 'preact/hooks';
import { useParams, Link } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { AgentAvatar } from '../components/ui/AgentAvatar';
import { cn } from '../lib/utils';
import { useAgentDetail } from '../lib/hooks/useAgentDetail';
import { useStake } from '../lib/hooks/useStake';
import { useWallet } from '../lib/wallet';
import { formatTrust, truncAddress } from '../lib/format';
import { TRUST_WEIGHTS } from '@agentid/schema';

function ProgressBar({ label, score, weight }: { label: string; score: number; weight: string }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex justify-between text-[10px] tracking-[0.2em] uppercase">
        <span className="text-fg-muted">{label} <span className="text-fg-dim">({weight})</span></span>
        <span className="text-fg">{Math.round(score)}/100</span>
      </div>
      <div className="h-1 w-full bg-stroke relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_10px_rgba(249,115,22,0.8)] transition-all duration-700"
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const t = tier.toUpperCase();
  const colors: Record<string, string> = {
    ELITE: 'border-accent/50 text-accent bg-accent/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
    HIGH: 'border-emerald-400/50 text-emerald-400 bg-emerald-400/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    MEDIUM: 'border-blue-400/50 text-blue-400 bg-blue-400/10 shadow-[0_0_10px_rgba(96,165,250,0.2)]',
    LOW: 'border-stroke-3 text-fg-muted bg-stroke',
  };
  return (
    <span className={cn("text-[10px] tracking-[0.2em] px-3 py-1 border", colors[t] || colors.LOW)}>
      {t}
    </span>
  );
}

function SkeletonDetail() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-6">
        <Panel className="p-8 animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-raised rounded" />
            <div><div className="h-6 bg-raised rounded w-48 mb-2" /><div className="h-4 bg-raised rounded w-32" /></div>
          </div>
          <div className="h-4 bg-raised rounded w-full mb-2" />
          <div className="h-4 bg-raised rounded w-3/4" />
        </Panel>
      </div>
      <div className="w-full lg:w-96">
        <Panel className="p-8 animate-pulse">
          <div className="h-20 bg-raised rounded mb-4" />
          <div className="h-10 bg-raised rounded" />
        </Panel>
      </div>
    </div>
  );
}

export function AgentDetail() {
  const { atomId } = useParams();
  const { agent, loading, error } = useAgentDetail(atomId);
  const { address, connect } = useWallet();
  const { stakeFor, status: stakeStatus, error: stakeError } = useStake();
  const [stakeAmount, setStakeAmount] = useState('');

  if (loading) return <SkeletonDetail />;
  if (error || !agent) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="text-fg-dim text-sm tracking-widest uppercase">{error || 'Agent not found'}</div>
        <Link to="/agents" className="text-accent text-[10px] tracking-[0.2em] uppercase hover:underline">Back to Explorer</Link>
      </div>
    );
  }

  const ts = agent.trustScore;
  const ipfs = agent.ipfsData;
  const endpoint = ipfs?.endpoints?.[0];

  const handleStakeFor = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return;
    try {
      await stakeFor(agent.atomId, stakeAmount);
      setStakeAmount('');
    } catch {}
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-6">
        {/* Agent Info */}
        <Panel className="p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <AgentAvatar name={agent.name} size="xl" />
                <div>
                  <h1 className="text-3xl font-light tracking-tight text-fg mb-2">{agent.name}</h1>
                  <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase">
                    <span className="text-fg-dim font-mono">{truncAddress(agent.atomId, 6)}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(agent.atomId)}
                      className="text-accent hover:text-accent-hover transition-colors"
                    >
                      COPY
                    </button>
                    <span className="px-2 py-1 border border-emerald-500/50 text-emerald-500 bg-emerald-500/10">ACTIVE</span>
                  </div>
                </div>
              </div>
              {agent.createdAt && (
                <div className="text-right">
                  <div className="text-fg-dim text-[10px] tracking-[0.2em] uppercase mb-1">CREATED</div>
                  <div className="text-fg-soft text-sm">{new Date(agent.createdAt).toLocaleDateString()}</div>
                </div>
              )}
            </div>

            {/* Description */}
            {agent.description && (
              <div className="mb-8">
                <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent" /> DESCRIPTION
                </h3>
                <p className="text-fg-muted text-sm leading-relaxed border-l border-stroke-2 pl-4">
                  {agent.description}
                </p>
              </div>
            )}

            {/* Capabilities */}
            {agent.capabilities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent" /> CAPABILITIES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map(cap => (
                    <span key={cap.tripleId} className="text-[10px] tracking-[0.1em] px-3 py-1 border border-stroke-2 text-fg-soft bg-raised hover:border-accent hover:text-accent transition-colors cursor-default">
                      {cap.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Endpoint */}
            {endpoint && (
              <div>
                <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent" /> ENDPOINT INFO
                </h3>
                <div className="grid grid-cols-2 gap-4 border border-stroke p-4 bg-surface">
                  <div>
                    <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">TYPE</div>
                    <div className="text-fg-soft text-sm">{endpoint.type || 'Unknown'}</div>
                  </div>
                  {endpoint.version && (
                    <div>
                      <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">VERSION</div>
                      <div className="text-fg-soft text-sm">{endpoint.version}</div>
                    </div>
                  )}
                  <div className="col-span-2">
                    <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">URL</div>
                    <div className="text-accent text-sm break-all font-mono">{endpoint.url}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Panel>

        {/* Trust Score Breakdown */}
        {ts && (
          <Panel className="p-8">
            <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
              <div className="w-1 h-1 bg-accent" /> TRUST SCORE BREAKDOWN
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              <ProgressBar label="Staking" score={ts.components.stakingScore} weight={`${TRUST_WEIGHTS.staking * 100}%`} />
              <ProgressBar label="Diversity" score={ts.components.diversityScore} weight={`${TRUST_WEIGHTS.diversity * 100}%`} />
              <ProgressBar label="Sentiment" score={ts.components.sentimentScore} weight={`${TRUST_WEIGHTS.sentiment * 100}%`} />
              <ProgressBar label="Operator Commitment" score={ts.components.operatorCommitment} weight={`${TRUST_WEIGHTS.operatorCommitment * 100}%`} />
              <ProgressBar label="Longevity" score={ts.components.longevityScore} weight={`${TRUST_WEIGHTS.longevity * 100}%`} />
              <ProgressBar label="Feedback" score={ts.components.feedbackScore} weight={`${TRUST_WEIGHTS.feedback * 100}%`} />
            </div>
          </Panel>
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        {/* Trust Score */}
        <Panel className="p-8 flex flex-col items-center text-center border-accent/30 shadow-[0_0_30px_rgba(249,115,22,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 w-full text-left">TRUST SCORE</h3>
          <div className="text-7xl font-light tracking-tighter text-fg mb-2">{ts ? ts.normalized : 'N/A'}</div>
          {ts && <TierBadge tier={ts.tier} />}
          <div className="w-full flex justify-between text-[10px] tracking-[0.2em] uppercase border-t border-stroke pt-4 mt-6 mb-4">
            <span className="text-fg-dim">CONFIDENCE</span>
            <span className="text-fg-soft">{ts ? ts.confidence.toFixed(2) : '—'}</span>
          </div>
          <p className="text-fg-muted text-xs italic">
            "{agent.recommendation}"
          </p>
        </Panel>

        {/* Stake Panel */}
        <Panel className="p-8 bg-surface">
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> STAKE POSITION
          </h3>
          <div className="flex flex-col gap-4">
            {address ? (
              <>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount((e.target as HTMLInputElement).value)}
                    disabled={stakeStatus === 'signing' || stakeStatus === 'confirming'}
                    className="w-full bg-base border border-stroke-2 text-fg px-4 py-3 text-lg font-light focus:outline-none focus:border-accent focus:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all disabled:opacity-50"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-dim text-xs tracking-widest">tTRUST</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleStakeFor}
                    disabled={stakeStatus === 'signing' || stakeStatus === 'confirming' || !stakeAmount}
                    className="text-[10px] tracking-[0.2em] uppercase py-3 border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-30"
                  >
                    {stakeStatus === 'signing' ? 'SIGNING...' : stakeStatus === 'confirming' ? 'CONFIRMING...' : 'STAKE FOR'}
                  </button>
                  <button
                    disabled
                    className="text-[10px] tracking-[0.2em] uppercase py-3 border border-red-500/50 text-red-500 opacity-30 cursor-not-allowed"
                    title="Counter-staking requires a triple ID"
                  >
                    STAKE AGAINST
                  </button>
                </div>
                {stakeStatus === 'success' && (
                  <div className="text-emerald-400 text-[10px] tracking-widest text-center py-2 border border-emerald-500/30 bg-emerald-500/10">
                    Staked successfully!
                  </div>
                )}
                {stakeError && (
                  <div className="text-red-400 text-[10px] tracking-widest text-center py-2 border border-red-500/30 bg-red-500/10">
                    {stakeError}
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={connect}
                className="text-[10px] tracking-[0.2em] uppercase py-3 border border-accent/50 text-accent hover:bg-accent/10 transition-all w-full"
              >
                Connect wallet to stake
              </button>
            )}
          </div>
        </Panel>

        {/* Vault Stats */}
        <Panel className="p-8">
          <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
            <div className="w-1 h-1 bg-accent" /> VAULT STATS
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-stroke pb-2">
              <span className="text-fg-muted text-xs tracking-widest uppercase">Total Staked</span>
              <span className="text-fg text-sm font-medium">{formatTrust(agent.totalStaked)} tTRUST</span>
            </div>
            <div className="flex justify-between items-center border-b border-stroke pb-2">
              <span className="text-fg-muted text-xs tracking-widest uppercase">Stakers</span>
              <span className="text-fg text-sm font-medium">{agent.stakersCount}</span>
            </div>
            <div className="flex justify-between items-center border-b border-stroke pb-2">
              <span className="text-fg-muted text-xs tracking-widest uppercase">Share Price</span>
              <span className="text-fg text-sm font-medium">{formatTrust(agent.sharePrice)} tTRUST</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-fg-muted text-xs tracking-widest uppercase">Market Cap</span>
              <span className="text-fg text-sm font-medium">{formatTrust(agent.marketCap)} tTRUST</span>
            </div>
          </div>
        </Panel>

        {/* Operator */}
        {agent.creatorAddress && (
          <Panel className="p-8">
            <h3 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
              <div className="w-1 h-1 bg-accent" /> OPERATOR INFO
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">ADDRESS</div>
                <div className="text-accent text-xs break-all font-mono hover:underline cursor-pointer">
                  {agent.creatorAddress}
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
