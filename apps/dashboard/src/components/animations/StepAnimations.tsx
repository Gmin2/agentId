import { motion } from 'motion/react';

// Step 1: Identity — An atom/identity forming from scattered particles
export function IdentityAnimation() {
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Orbiting ring */}
      <motion.div
        className="absolute w-32 h-32 border border-accent/20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-48 h-48 border border-stroke-2 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Scattered particles converging to center */}
      {[
        { x: -80, y: -60, delay: 0 },
        { x: 70, y: -40, delay: 0.3 },
        { x: -50, y: 50, delay: 0.6 },
        { x: 60, y: 70, delay: 0.9 },
        { x: -90, y: 10, delay: 1.2 },
        { x: 40, y: -80, delay: 0.4 },
        { x: -20, y: 80, delay: 0.7 },
        { x: 80, y: 20, delay: 1.0 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-accent rounded-full"
          animate={{
            x: [p.x, p.x * 0.3, 0, p.x * 0.5, p.x],
            y: [p.y, p.y * 0.3, 0, p.y * 0.5, p.y],
            opacity: [0.3, 0.8, 1, 0.8, 0.3],
            scale: [0.5, 1, 1.5, 1, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Central atom forming */}
      <motion.div
        className="relative z-10 w-16 h-16 border-2 border-accent/60 flex items-center justify-center bg-base"
        animate={{
          borderColor: ['rgba(249,115,22,0.3)', 'rgba(249,115,22,0.8)', 'rgba(249,115,22,0.3)'],
          boxShadow: ['0 0 0px rgba(249,115,22,0)', '0 0 25px rgba(249,115,22,0.4)', '0 0 0px rgba(249,115,22,0)'],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </motion.svg>
      </motion.div>

      {/* Floating label */}
      <motion.div
        className="absolute bottom-8 text-[9px] tracking-[0.3em] text-fg-dim uppercase font-mono"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Creating Identity Atom
      </motion.div>

      {/* Corner hash lines */}
      <motion.div
        className="absolute top-6 left-6 text-[8px] font-mono text-accent/30"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      >
        0xA1B2...
      </motion.div>
      <motion.div
        className="absolute top-6 right-6 text-[8px] font-mono text-accent/30"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
      >
        ...C3D4
      </motion.div>
    </div>
  );
}

// Step 2: Endpoint — Network connection / signal pulses
export function EndpointAnimation() {
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400">
        {/* Connection lines from left node to right node */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <motion.path
              d={`M 60 ${160 + i * 40} Q 150 ${140 + i * 40} 240 ${160 + i * 40}`}
              stroke="#f97316"
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 4"
              animate={{ strokeDashoffset: [0, -16], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
            {/* Traveling dot */}
            <motion.circle
              r="3"
              fill="#f97316"
              animate={{
                cx: [60, 150, 240],
                cy: [160 + i * 40, 140 + i * 40, 160 + i * 40],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
            />
          </g>
        ))}
      </svg>

      {/* Left node — Agent */}
      <motion.div
        className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 border border-accent/50 bg-base flex items-center justify-center"
        animate={{
          boxShadow: ['0 0 0px rgba(249,115,22,0)', '0 0 20px rgba(249,115,22,0.3)', '0 0 0px rgba(249,115,22,0)'],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </motion.div>

      {/* Right node — Network */}
      <motion.div
        className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 border border-emerald-500/50 bg-base flex items-center justify-center"
        animate={{
          boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 20px rgba(16,185,129,0.3)', '0 0 0px rgba(16,185,129,0)'],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </motion.div>

      {/* Status indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-emerald-500"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-[9px] tracking-[0.3em] text-emerald-500/80 uppercase font-mono">Verifying Endpoint</span>
      </motion.div>

      {/* Ping indicators */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-accent/20 rounded-full"
          animate={{
            width: [0, 80 + i * 40],
            height: [0, 80 + i * 40],
            opacity: [0.5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
    </div>
  );
}

// Step 3: Capabilities — Hexagonal nodes lighting up
export function CapabilitiesAnimation() {
  const nodes = [
    { x: 150, y: 80, label: 'CODE' },
    { x: 80, y: 140, label: 'DATA' },
    { x: 220, y: 140, label: 'SEC' },
    { x: 110, y: 220, label: 'TASK' },
    { x: 190, y: 220, label: 'AI' },
    { x: 150, y: 290, label: 'NET' },
  ];

  const edges = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [1, 2], [3, 4],
  ];

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400">
        {/* Edges */}
        {edges.map(([a, b], i) => (
          <motion.line
            key={`edge-${i}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="#f97316"
            strokeWidth="1"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}

        {/* Traveling signals along edges */}
        {edges.map(([a, b], i) => (
          <motion.circle
            key={`signal-${i}`}
            r="2"
            fill="#f97316"
            animate={{
              cx: [nodes[a].x, nodes[b].x],
              cy: [nodes[a].y, nodes[b].y],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 + 0.5, ease: 'easeInOut' }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`}>
            {/* Glow */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="22"
              fill="none"
              stroke="#f97316"
              strokeWidth="1"
              animate={{ opacity: [0, 0.3, 0], r: [18, 26, 18] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
            />
            {/* Node bg */}
            <motion.rect
              x={node.x - 18}
              y={node.y - 18}
              width="36"
              height="36"
              fill="#0a0a0a"
              stroke="#f97316"
              strokeWidth="1"
              animate={{
                strokeOpacity: [0.3, 0.8, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
            {/* Label */}
            <text
              x={node.x}
              y={node.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[8px] tracking-[0.15em] font-mono"
              fill="#f97316"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <motion.div
        className="absolute bottom-8 text-[9px] tracking-[0.3em] text-fg-dim uppercase font-mono"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Mapping Capabilities
      </motion.div>
    </div>
  );
}

// Step 4: Confirm — On-chain transaction / block being mined
export function ConfirmAnimation() {
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Chain of blocks */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400">
        {/* Chain links */}
        {[0, 1, 2].map(i => (
          <motion.line
            key={`chain-${i}`}
            x1={150}
            y1={90 + i * 80}
            x2={150}
            y2={130 + i * 80}
            stroke="#333"
            strokeWidth="2"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -8] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ))}
      </svg>

      {/* Existing blocks */}
      {[0, 1].map(i => (
        <motion.div
          key={i}
          className="absolute w-24 h-16 border border-stroke-2 bg-surface flex flex-col items-center justify-center"
          style={{ top: `${60 + i * 80}px`, left: '50%', transform: 'translateX(-50%)' }}
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
        >
          <div className="text-fg-dim text-[7px] font-mono tracking-wider">BLOCK</div>
          <div className="text-fg-dim text-[9px] font-mono">#{1042 + i}</div>
        </motion.div>
      ))}

      {/* NEW block being created — the registration tx */}
      <motion.div
        className="absolute w-28 h-20 border-2 border-accent bg-base flex flex-col items-center justify-center"
        style={{ top: '220px', left: '50%', transform: 'translateX(-50%)' }}
        animate={{
          borderColor: ['rgba(249,115,22,0.5)', 'rgba(249,115,22,1)', 'rgba(249,115,22,0.5)'],
          boxShadow: ['0 0 0px rgba(249,115,22,0)', '0 0 30px rgba(249,115,22,0.4)', '0 0 0px rgba(249,115,22,0)'],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-accent text-[7px] font-mono tracking-wider mb-0.5">YOUR TX</div>
        <div className="text-accent text-[10px] font-mono font-bold">#1044</div>
        <motion.div
          className="mt-1 flex gap-1"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-1 h-1 bg-accent rounded-full" />
          <div className="w-1 h-1 bg-accent rounded-full" />
          <div className="w-1 h-1 bg-accent rounded-full" />
        </motion.div>
      </motion.div>

      {/* Radiating confirmation rings */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={`ring-${i}`}
          className="absolute border border-accent/20 rounded-full"
          style={{ top: '230px', left: '50%', transform: 'translate(-50%, -50%)' }}
          animate={{
            width: [0, 120 + i * 60],
            height: [0, 120 + i * 60],
            opacity: [0.4, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
        />
      ))}

      {/* Hash scrolling */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <motion.div
          className="text-[8px] font-mono text-accent/50"
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          0xa1b2c3d4e5f6...
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 text-[9px] tracking-[0.3em] text-fg-dim uppercase font-mono"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Awaiting Confirmation
      </motion.div>
    </div>
  );
}
