import { motion } from 'motion/react';

export function RegisterAnimation({ isActive, isComplete }: { isActive?: boolean; isComplete?: boolean }) {
  const state = isActive ? "active" : isComplete ? "complete" : "initial";

  return (
    <div className="w-full h-48 relative flex items-center justify-center bg-surface rounded-xl border border-stroke overflow-hidden mb-6 z-10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="absolute top-4 left-0 w-full flex justify-center gap-8 opacity-30">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`node-${i}`}
            className="w-2 h-2 rounded-full bg-accent"
            variants={{
              initial: { opacity: 0.2 },
              active: { opacity: [0.2, 1, 0.2], transition: { duration: 2, repeat: Infinity, delay: i * 0.5 } },
              complete: { opacity: 0.2 }
            }}
            initial="initial"
            animate={state}
          />
        ))}
      </div>
      <svg className="absolute top-5 left-0 w-full h-10 opacity-20" preserveAspectRatio="none">
        <path d="M 50 0 Q 150 50 250 0" stroke="#f97316" strokeWidth="1" fill="none" />
      </svg>

      <motion.div
        className="relative z-10 bg-raised border border-stroke-2 rounded-lg p-4 flex flex-col gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden"
        variants={{
          initial: { width: 120, height: 140, y: 20, opacity: 1, borderColor: '#333', boxShadow: '0 0 0px rgba(249,115,22,0)' },
          active: {
            width: [120, 120, 60, 60],
            height: [140, 140, 60, 60],
            y: [20, 20, -20, -20],
            opacity: [1, 1, 1, 1],
            borderColor: ['#333', '#333', '#f97316', '#f97316'],
            boxShadow: ['0 0 0px rgba(249,115,22,0)', '0 0 0px rgba(249,115,22,0)', '0 0 20px rgba(249,115,22,0.4)', '0 0 20px rgba(249,115,22,0.4)'],
            transition: { duration: 4, times: [0, 0.4, 0.7, 1] }
          },
          complete: { width: 60, height: 60, y: -20, opacity: 1, borderColor: '#f97316', boxShadow: '0 0 20px rgba(249,115,22,0.4)' }
        }}
        initial="initial"
        animate={state}
      >
        <motion.div
          className="w-full h-2 bg-stroke-2 rounded shrink-0"
          variants={{
            initial: { opacity: 1 },
            active: { opacity: [1, 1, 0, 0], transition: { duration: 4, times: [0, 0.1, 0.6, 1] } },
            complete: { opacity: 0 }
          }}
          initial="initial"
          animate={state}
        />
        <motion.div
          className="w-3/4 h-2 bg-stroke-2 rounded shrink-0"
          variants={{
            initial: { opacity: 1 },
            active: { opacity: [1, 1, 0, 0], transition: { duration: 4, times: [0, 0.2, 0.6, 1] } },
            complete: { opacity: 0 }
          }}
          initial="initial"
          animate={state}
        />
        <motion.div
          className="w-5/6 h-2 bg-stroke-2 rounded shrink-0"
          variants={{
            initial: { opacity: 1 },
            active: { opacity: [1, 1, 0, 0], transition: { duration: 4, times: [0, 0.3, 0.6, 1] } },
            complete: { opacity: 0 }
          }}
          initial="initial"
          animate={state}
        />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          variants={{
            initial: { opacity: 0 },
            active: { opacity: [0, 0, 1, 1], transition: { duration: 4, times: [0, 0.6, 0.7, 1] } },
            complete: { opacity: 1 }
          }}
          initial="initial"
          animate={state}
        >
          <div className="text-accent font-mono text-[10px] tracking-tighter">
            0xA1...
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute w-1 bg-gradient-to-t from-transparent via-accent to-transparent"
        variants={{
          initial: { height: 0, bottom: '50%', opacity: 0 },
          active: {
            height: [0, 60, 0],
            bottom: ['50%', '60%', '80%'],
            opacity: [0, 1, 0],
            transition: { duration: 4, times: [0, 0.6, 0.8] }
          },
          complete: { opacity: 0 }
        }}
        initial="initial"
        animate={state}
      />
    </div>
  );
}
