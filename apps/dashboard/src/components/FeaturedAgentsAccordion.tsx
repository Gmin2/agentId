import { useState } from 'preact/hooks';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AgentAvatar } from './ui/AgentAvatar';

const FEATURED_AGENTS = [
  { id: '1', name: 'CodeReviewer', staked: '12,450', stakers: 342, tier: 'ELITE', desc: 'Smart contract auditing' },
  { id: '2', name: 'DataAnalyzer', staked: '8,210', stakers: 215, tier: 'HIGH', desc: 'On-chain data analysis' },
  { id: '3', name: 'SecurityBot', staked: '6,100', stakers: 189, tier: 'HIGH', desc: 'Threat monitoring' },
  { id: '4', name: 'DeFiTrader', staked: '4,500', stakers: 120, tier: 'MEDIUM', desc: 'DeFi strategy execution' },
  { id: '5', name: 'InfraWatch', staked: '7,300', stakers: 201, tier: 'HIGH', desc: 'Infrastructure monitoring' },
];

export function FeaturedAgentsAccordion() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);

  return (
    <div className="flex h-[400px] w-full gap-2 overflow-hidden">
      {FEATURED_AGENTS.map((agent, index) => {
        const isHovered = hoveredIndex === index;

        return (
          <motion.div
            key={agent.id}
            className="relative h-full overflow-hidden cursor-pointer border border-stroke-2 hover:border-accent/40 transition-colors"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            animate={{ flex: isHovered ? 4 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Link to={`/agents/${agent.id}`} className="block w-full h-full relative">
              {/* Background — pure dark with grid + gradient */}
              <div className="absolute inset-0 bg-base" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-accent/10 via-accent/5 to-transparent"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Top accent line */}
              <motion.div
                className="absolute top-0 left-0 w-full h-[2px] bg-accent"
                animate={{ scaleX: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformOrigin: 'left' }}
              />

              {/* Large decorative number */}
              <div className="absolute -right-2 -bottom-6 text-[140px] font-mono font-bold text-accent/[0.03] leading-none select-none pointer-events-none">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Top */}
                <div className="flex justify-between items-start">
                  <AgentAvatar name={agent.name} size="md" />

                  <motion.div
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="text-[8px] tracking-[0.2em] px-2 py-1 border border-accent/50 text-accent bg-accent/10 whitespace-nowrap"
                  >
                    {agent.tier}
                  </motion.div>
                </div>

                {/* Bottom */}
                <div className="relative z-10">
                  <motion.div
                    animate={{
                      rotate: isHovered ? 0 : -90,
                      y: isHovered ? 0 : -20,
                      x: isHovered ? 0 : 20,
                      transformOrigin: "left bottom"
                    }}
                    className="whitespace-nowrap"
                  >
                    <h3 className="text-2xl md:text-3xl font-light tracking-tight text-fg mb-1">
                      {agent.name}
                    </h3>
                  </motion.div>

                  <motion.div
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      height: isHovered ? 'auto' : 0,
                      marginTop: isHovered ? 16 : 0
                    }}
                    className="overflow-hidden"
                  >
                    <p className="text-fg-muted text-xs mb-4">{agent.desc}</p>
                    <div className="flex gap-6">
                      <div>
                        <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Total Staked</div>
                        <div className="text-accent text-lg font-light">{agent.staked} <span className="text-fg-dim text-xs">tTRUST</span></div>
                      </div>
                      <div>
                        <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase mb-1">Stakers</div>
                        <div className="text-fg-soft text-lg font-light">{agent.stakers}</div>
                      </div>
                    </div>

                    {/* Mini trust bar */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="text-fg-dim text-[8px] tracking-[0.2em] uppercase">TRUST</div>
                      <div className="flex-1 h-1 bg-stroke relative overflow-hidden rounded-full">
                        <div
                          className="h-full bg-accent shadow-[0_0_8px_rgba(249,115,22,0.5)] rounded-full"
                          style={{ width: `${agent.tier === 'ELITE' ? 92 : agent.tier === 'HIGH' ? 75 : 55}%` }}
                        />
                      </div>
                      <div className="text-accent text-[10px] font-mono">
                        {agent.tier === 'ELITE' ? '92' : agent.tier === 'HIGH' ? '75' : '55'}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
