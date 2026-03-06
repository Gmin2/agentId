import { motion } from 'motion/react';
import { ShieldCheck, Cpu } from 'lucide-react';

export function VerifyAnimation({ isActive, isComplete }: { isActive?: boolean; isComplete?: boolean }) {
  const state = isActive ? "active" : isComplete ? "complete" : "initial";

  return (
    <div className="w-full h-48 relative flex items-center justify-center bg-surface rounded-xl border border-stroke overflow-hidden mb-6 z-10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="relative z-10 flex items-center justify-between w-3/4">
        <div className="w-12 h-12 rounded-lg border border-stroke-3 bg-raised flex items-center justify-center relative">
          <Cpu className="w-6 h-6 text-fg-muted" />
          <motion.div
            className="absolute inset-0 rounded-lg border border-fg-muted"
            variants={{
              initial: { scale: 1, opacity: 0 },
              active: { scale: [1, 1.5], opacity: [1, 0], transition: { duration: 2, repeat: 1 } },
              complete: { opacity: 0 }
            }}
            initial="initial"
            animate={state}
          />
        </div>

        <div className="absolute left-12 right-12 h-[1px] bg-stroke-2 top-1/2 -translate-y-1/2 z-0" />

        <motion.div
          className="absolute left-12 h-[2px] bg-emerald-500 top-1/2 -translate-y-1/2 z-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          variants={{
            initial: { right: '100%', opacity: 0 },
            active: { right: ['100%', '50%', '50%', '12%'], opacity: 1, transition: { duration: 4, times: [0, 0.2, 0.8, 1] } },
            complete: { right: '12%', opacity: 1 }
          }}
          initial="initial"
          animate={state}
        />

        <div className="relative z-20 w-10 h-10 bg-surface rounded-full flex items-center justify-center">
          <motion.div
            variants={{
              initial: { scale: 0.8, color: '#555' },
              active: {
                scale: [0.8, 1.2, 1],
                color: ['#555', '#f97316', '#10b981'],
                transition: { duration: 4, times: [0, 0.4, 0.6] }
              },
              complete: { scale: 1, color: '#10b981' }
            }}
            initial="initial"
            animate={state}
          >
            <ShieldCheck className="w-6 h-6" />
          </motion.div>

          <motion.div
            className="absolute -top-8 bg-raised border border-stroke-2 px-2 py-1 rounded text-[8px] font-mono text-emerald-400 whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            variants={{
              initial: { opacity: 0, y: 5 },
              active: { opacity: [0, 0, 1, 0], y: [5, 5, 0, -5], transition: { duration: 4, times: [0, 0.4, 0.5, 0.9] } },
              complete: { opacity: 0 }
            }}
            initial="initial"
            animate={state}
          />
        </div>

        <div className="w-12 h-12 rounded-lg border border-accent bg-raised flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.2)] relative">
          <div className="text-accent font-mono text-[10px]">0xA1</div>
          <motion.div
            className="absolute inset-0 rounded-lg border border-emerald-500"
            variants={{
              initial: { opacity: 0, scale: 1 },
              active: { opacity: [0, 0, 1, 0], scale: [1, 1, 1.2, 1.2], transition: { duration: 4, times: [0, 0.8, 0.9, 1] } },
              complete: { opacity: 0 }
            }}
            initial="initial"
            animate={state}
          />
        </div>
      </div>
    </div>
  );
}
