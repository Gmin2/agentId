import { useState, useEffect } from 'preact/hooks';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SEARCH_AGENTS_BY_NAME, type SearchAgentsByNameResponse } from '@agentids/graphql';
import { calculateTrustScore, type TrustScoreInput } from '@agentids/schema';
import { graphqlClient } from '../lib/graphql';

interface FeaturedAgent {
  atomId: string
  name: string
  desc: string
  staked: string
  stakers: number
  tier: string
  trust: number
}

// SVG backgrounds — one per slot, reused regardless of which agent fills it
const BACKGROUNDS = [
  // Slot 0: concentric circles
  (label: string) => (
    <>
      <div className="absolute inset-0 bg-base" />
      <div className="absolute top-0 left-0 w-full h-[45%] bg-accent/85" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <circle cx="200" cy="180" r="140" stroke="#050505" strokeWidth="1.5" fill="none" opacity="0.15" />
        <circle cx="200" cy="180" r="100" stroke="#050505" strokeWidth="0.5" fill="none" opacity="0.1" />
        <circle cx="200" cy="180" r="60" stroke="#050505" strokeWidth="0.5" fill="none" opacity="0.08" />
      </svg>
      <div className="absolute top-5 left-5 text-[72px] font-mono font-black text-base/20 leading-none select-none">
        {label.slice(0, 4).toUpperCase()}
      </div>
    </>
  ),
  // Slot 1: grid lines + dots
  (label: string) => (
    <>
      <div className="absolute inset-0 bg-base" />
      <div className="absolute top-0 left-0 w-full h-[45%] bg-accent/80" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={-50 + i * 40} y1="0" x2={-50 + i * 40 + 200} y2="500" stroke="#050505" strokeWidth="0.5" opacity={0.12 + (i % 3) * 0.04} />
        ))}
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <circle key={`${row}-${col}`} cx={60 + col * 55} cy={80 + row * 55} r={(row + col) % 3 === 0 ? 3 : 1.5} fill="#050505" opacity={0.1 + ((row * col) % 5) * 0.04} />
          ))
        )}
      </svg>
      <div className="absolute top-4 left-5 text-[72px] font-mono font-black text-base/20 leading-none select-none">
        {label.slice(0, 4).toUpperCase()}
      </div>
    </>
  ),
  // Slot 2: shield
  (label: string) => (
    <>
      <div className="absolute inset-0 bg-base" />
      <div className="absolute top-0 left-0 w-full h-[45%] bg-accent/75" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <path d="M200 80 L320 150 L320 300 Q320 400 200 460 Q80 400 80 300 L80 150 Z" stroke="#050505" strokeWidth="1.5" fill="none" opacity="0.15" />
        <path d="M200 120 L290 175 L290 290 Q290 370 200 420 Q110 370 110 290 L110 175 Z" stroke="#050505" strokeWidth="0.5" fill="none" opacity="0.08" />
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={i} x1="0" y1={i * 25} x2="400" y2={i * 25} stroke="#050505" strokeWidth="0.3" opacity={0.05} />
        ))}
      </svg>
      <div className="absolute top-4 left-5 text-[72px] font-mono font-black text-base/20 leading-none select-none">
        {label.slice(0, 3).toUpperCase()}
      </div>
    </>
  ),
  // Slot 3: wave curves
  (label: string) => (
    <>
      <div className="absolute inset-0 bg-base" />
      <div className="absolute top-0 left-0 w-full h-[45%] bg-accent/90" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        <path d="M0 225 Q100 180 200 225 T400 225" stroke="#050505" strokeWidth="3" fill="none" />
        <path d="M0 240 Q150 200 250 260 T400 240" stroke="#050505" strokeWidth="1" fill="none" opacity="0.3" />
        <path d="M0 350 Q80 300 160 340 Q240 380 320 320 L400 340" stroke="#f97316" strokeWidth="0.5" fill="none" opacity="0.2" />
      </svg>
      <div className="absolute top-6 left-5 text-[80px] font-mono font-black text-base/20 leading-none select-none">
        {label.slice(0, 4).toUpperCase()}
      </div>
    </>
  ),
  // Slot 4: nested rectangles
  (label: string) => (
    <>
      <div className="absolute inset-0 bg-base" />
      <div className="absolute top-0 left-0 w-full h-[45%] bg-accent/70" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        {[0, 1, 2, 3, 4].map(i => (
          <rect key={i} x={40 + i * 30} y={60 + i * 35} width={320 - i * 60} height={380 - i * 70} stroke="#050505" strokeWidth={i === 0 ? 1.5 : 0.5} fill="none" opacity={0.1 + i * 0.03} />
        ))}
        <g stroke="#050505" strokeWidth="1" opacity="0.2">
          <line x1="30" y1="50" x2="60" y2="50" /><line x1="40" y1="40" x2="40" y2="70" />
          <line x1="340" y1="50" x2="370" y2="50" /><line x1="360" y1="40" x2="360" y2="70" />
        </g>
      </svg>
      <div className="absolute top-4 left-5 text-[72px] font-mono font-black text-base/20 leading-none select-none">
        {label.slice(0, 5).toUpperCase()}
      </div>
    </>
  ),
];

function formatStaked(wei: string): string {
  const num = Number(wei) / 1e18;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  if (num >= 1) return num.toFixed(1);
  return num.toFixed(4);
}

export function FeaturedAgentsAccordion() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
  const [agents, setAgents] = useState<FeaturedAgent[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await graphqlClient.request<SearchAgentsByNameResponse>(
          SEARCH_AGENTS_BY_NAME,
          { name: '%', limit: 10 }
        );
        const filtered = res.atoms
          .filter(a => a.label && a.label !== 'json object')
          .slice(0, 5);

        const mapped: FeaturedAgent[] = filtered.map(atom => {
          const vault = atom.term?.vaults?.[0];
          const totalAssets = vault?.total_assets || '0';
          const positionCount = vault?.position_count || 0;
          const sharePrice = vault?.current_share_price || '1000000000000000000';

          const input: TrustScoreInput = {
            totalStaked: BigInt(totalAssets),
            stakerCount: positionCount,
            sharePrice: BigInt(sharePrice),
            forStake: BigInt(totalAssets),
            againstStake: 0n,
            operatorStake: 0n,
            ageInDays: atom.created_at
              ? Math.floor((Date.now() - new Date(atom.created_at).getTime()) / (1000 * 60 * 60 * 24))
              : 0,
            feedbackCount: 0,
            averageFeedbackScore: 0,
          };
          const score = calculateTrustScore(input);

          return {
            atomId: atom.term_id,
            name: atom.label || 'Unknown',
            desc: atom.data?.startsWith('ipfs://') ? `Agent on Intuition Protocol` : (atom.data || ''),
            staked: formatStaked(totalAssets),
            stakers: positionCount,
            tier: score.tier.toUpperCase(),
            trust: score.normalized,
          };
        });

        setAgents(mapped);
      } catch (err) {
        console.error('Failed to fetch featured agents:', err);
      }
    }

    fetchFeatured();
  }, []);

  if (agents.length === 0) {
    return (
      <div className="flex h-[440px] w-full items-center justify-center border border-stroke">
        <span className="text-fg-dim text-[10px] tracking-[0.2em] uppercase">Loading featured agents...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[440px] w-full gap-1.5 overflow-hidden">
      {agents.map((agent, index) => {
        const isHovered = hoveredIndex === index;
        const bgFn = BACKGROUNDS[index % BACKGROUNDS.length];

        return (
          <motion.div
            key={agent.atomId}
            className="relative h-full overflow-hidden cursor-pointer border border-stroke hover:border-accent/30 transition-colors"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            animate={{ flex: isHovered ? 5 : 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <Link to={`/agents/${agent.atomId}`} className="block w-full h-full relative">
              {bgFn(agent.name)}

              {/* Collapsed state — vertical name */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-end pb-8 gap-3 z-10"
                animate={{ opacity: isHovered ? 0 : 1 }}
                transition={{ duration: 0.15 }}
              >
                <div className="text-accent/40 text-[10px] font-mono tracking-widest">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div
                  className="text-fg/60 text-[11px] tracking-[0.2em] uppercase font-medium whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  {agent.name}
                </div>
              </motion.div>

              {/* Expanded content overlay */}
              <motion.div
                className="absolute inset-0 z-20 flex flex-col justify-between p-6"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.25, delay: isHovered ? 0.12 : 0 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    <span className="text-[8px] tracking-[0.25em] text-accent uppercase font-mono">{agent.tier}</span>
                  </div>
                  <div className="text-fg/40 text-[10px] font-mono">#{String(index + 1).padStart(2, '0')}</div>
                </div>

                <div>
                  <h3 className="text-3xl font-light tracking-tight text-fg mb-1.5">
                    {agent.name}
                  </h3>
                  <p className="text-fg-muted text-[11px] mb-5 max-w-[280px]">{agent.desc}</p>

                  <div className="flex gap-8 mb-4">
                    <div>
                      <div className="text-fg-dim text-[7px] tracking-[0.25em] uppercase mb-1">Staked</div>
                      <div className="text-accent text-lg font-light tabular-nums">{agent.staked}</div>
                    </div>
                    <div>
                      <div className="text-fg-dim text-[7px] tracking-[0.25em] uppercase mb-1">Stakers</div>
                      <div className="text-fg-soft text-lg font-light tabular-nums">{agent.stakers}</div>
                    </div>
                    <div>
                      <div className="text-fg-dim text-[7px] tracking-[0.25em] uppercase mb-1">Trust</div>
                      <div className="text-accent text-lg font-light tabular-nums">{agent.trust}<span className="text-fg-dim text-[9px]">%</span></div>
                    </div>
                  </div>

                  <div className="h-[3px] bg-stroke/50 relative overflow-hidden w-full">
                    <motion.div
                      className="h-full bg-accent"
                      animate={{ width: isHovered ? `${agent.trust}%` : '0%' }}
                      transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
