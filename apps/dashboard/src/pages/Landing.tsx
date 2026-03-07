import { useState, useEffect } from 'preact/hooks';
import { Link } from 'react-router-dom';
import { Panel } from '../components/ui/Panel';
import { StatItem, Divider } from '../components/ui/StatItem';
import { Globe } from '../components/ui/Globe';
import { FeaturedAgentsAccordion } from '../components/FeaturedAgentsAccordion';
import { HowItWorksFlow } from '../components/animations/HowItWorksFlow';
import { SEARCH_AGENTS_BY_NAME, type SearchAgentsByNameResponse } from '@agentids/graphql';
import { graphqlClient } from '../lib/graphql';

interface Stats {
  totalAgents: string
  totalStaked: string
  totalStakers: string
}

export function Landing() {
  const [stats, setStats] = useState<Stats>({ totalAgents: '...', totalStaked: '...', totalStakers: '...' });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await graphqlClient.request<SearchAgentsByNameResponse>(
          SEARCH_AGENTS_BY_NAME,
          { name: '%', limit: 100 }
        );
        // Filter out unlabeled atoms
        const agents = res.atoms.filter(a => a.label && a.label !== 'json object');
        let totalStaked = 0n;
        let totalStakers = 0;

        for (const atom of agents) {
          const vault = atom.term?.vaults?.[0];
          if (vault) {
            totalStaked += BigInt(vault.total_assets || '0');
            totalStakers += vault.position_count || 0;
          }
        }

        const stakedNum = Number(totalStaked) / 1e18;
        setStats({
          totalAgents: agents.length.toString(),
          totalStaked: stakedNum < 1000 ? stakedNum.toFixed(2) : `${(stakedNum / 1000).toFixed(1)}k`,
          totalStakers: totalStakers.toString(),
        });
      } catch {
        setStats({ totalAgents: '—', totalStaked: '—', totalStakers: '—' });
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
        <Panel className="flex flex-col justify-center p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent" />
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-fg mb-6 leading-tight relative z-10">
            DECENTRALIZED TRUST <br />
            <span className="text-accent">REGISTRY FOR AI AGENTS</span>
          </h1>
          <p className="text-fg-muted text-sm md:text-base max-w-md mb-12 leading-relaxed relative z-10">
            Discover, verify, and stake on autonomous agents. The AgentID protocol uses crypto-economic primitives to establish a verifiable trust layer for the AI economy.
          </p>
          <div className="flex items-center gap-4 relative z-10">
            <Link
              to="/agents"
              className="text-[10px] tracking-[0.2em] uppercase px-6 py-3 border border-accent bg-accent/10 text-accent hover:bg-accent/20 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.2)]"
            >
              Explore Agents
            </Link>
            <Link
              to="/register"
              className="text-[10px] tracking-[0.2em] uppercase px-6 py-3 border border-stroke-3 text-fg-soft hover:border-fg-muted hover:text-white transition-colors"
            >
              Register Agent
            </Link>
          </div>
        </Panel>
        <Panel className="relative p-0 overflow-hidden hidden lg:block border-stroke-2">
          <Globe />
        </Panel>
      </div>

      <Panel className="flex flex-col md:flex-row justify-between items-center py-8 px-12 border-stroke-2">
        <StatItem label="TOTAL AGENTS" value={stats.totalAgents} />
        <Divider />
        <StatItem label="TOTAL tTRUST STAKED" value={stats.totalStaked} />
        <Divider />
        <StatItem label="TOTAL STAKERS" value={stats.totalStakers} />
      </Panel>

      <div className="flex flex-col gap-4 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase flex items-center gap-2">
            <div className="w-2 h-2 bg-accent shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            FEATURED AGENTS
          </h2>
          <Link to="/agents" className="text-accent text-[10px] tracking-[0.2em] uppercase hover:underline">View All</Link>
        </div>
        <FeaturedAgentsAccordion />
      </div>

      <Panel className="mt-8 p-12 border-stroke-2">
        <h2 className="text-fg-dim text-[10px] tracking-[0.3em] uppercase mb-12 text-center">HOW IT WORKS</h2>
        <HowItWorksFlow />
      </Panel>
    </div>
  );
}
