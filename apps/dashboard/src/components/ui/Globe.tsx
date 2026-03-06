import { useEffect, useRef } from 'preact/hooks';
import createGlobe from 'cobe';

const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [37.7749, -122.4194], size: 0.1 },   // San Francisco
  { location: [40.7128, -74.0060], size: 0.07 },    // New York
  { location: [51.5074, -0.1278], size: 0.07 },     // London
  { location: [35.6762, 139.6503], size: 0.07 },    // Tokyo
  { location: [1.3521, 103.8198], size: 0.06 },     // Singapore
  { location: [48.8566, 2.3522], size: 0.05 },      // Paris
  { location: [-33.8688, 151.2093], size: 0.05 },   // Sydney
  { location: [19.0760, 72.8777], size: 0.06 },     // Mumbai
  { location: [-23.5505, -46.6333], size: 0.05 },   // São Paulo
];

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 4.7;
    let width = 0;

    if (!canvasRef.current) return;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    onResize();
    window.addEventListener('resize', onResize);

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 800 * 2,
      height: 800 * 2,
      phi: 4.7,
      theta: 0.15,
      dark: 1,
      diffuse: 1.5,
      mapSamples: 24000,
      mapBrightness: 8,
      baseColor: [0.15, 0.07, 0.02],
      markerColor: [0.976, 0.451, 0.086],
      glowColor: [0.2, 0.1, 0.02],
      markers: MARKERS,
      onRender: (state) => {
        state.phi = phi;
        phi += 0.003;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {/* Orange radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1)_0%,rgba(249,115,22,0.03)_35%,transparent_65%)] pointer-events-none" />

      {/* Pulsing rings */}
      <div className="absolute w-[85%] aspect-square rounded-full border-2 border-accent/10 animate-pulse pointer-events-none" />
      <div className="absolute w-[95%] aspect-square rounded-full border border-accent/5 pointer-events-none" />

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: 500,
          aspectRatio: '1',
        }}
      />

      {/* Trust network arcs */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
        <defs>
          <linearGradient id="arcGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="arcGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
            <stop offset="40%" stopColor="#f97316" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#ff984d" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main arcs - thick, glowing */}
        <path d="M 100 230 Q 250 120 400 230" stroke="url(#arcGrad1)" strokeWidth="3" fill="none" filter="url(#glow)" opacity="0.6">
          <animate attributeName="stroke-dashoffset" from="400" to="0" dur="3.5s" repeatCount="indefinite" />
          <set attributeName="stroke-dasharray" to="180 220" />
        </path>

        <path d="M 150 340 Q 260 180 360 190" stroke="url(#arcGrad2)" strokeWidth="2.5" fill="none" filter="url(#glow)" opacity="0.5">
          <animate attributeName="stroke-dashoffset" from="320" to="0" dur="4.5s" repeatCount="indefinite" />
          <set attributeName="stroke-dasharray" to="140 180" />
        </path>

        <path d="M 80 280 Q 220 320 380 250" stroke="url(#arcGrad1)" strokeWidth="2" fill="none" filter="url(#glow)" opacity="0.4">
          <animate attributeName="stroke-dashoffset" from="380" to="0" dur="5.5s" repeatCount="indefinite" />
          <set attributeName="stroke-dasharray" to="160 220" />
        </path>

        <path d="M 200 140 Q 300 260 420 300" stroke="url(#arcGrad2)" strokeWidth="2" fill="none" filter="url(#glow)" opacity="0.35">
          <animate attributeName="stroke-dashoffset" from="350" to="0" dur="6s" repeatCount="indefinite" />
          <set attributeName="stroke-dasharray" to="120 230" />
        </path>

        {/* Traveling dots along arcs */}
        <circle r="3" fill="#f97316" filter="url(#glow)" opacity="0.8">
          {/* @ts-ignore: path is valid SVG but missing from Preact types */}
          <animateMotion dur="3.5s" repeatCount="indefinite" {...{ path: "M 100 230 Q 250 120 400 230" }} />
        </circle>
        <circle r="2.5" fill="#ff984d" filter="url(#glow)" opacity="0.7">
          {/* @ts-ignore */}
          <animateMotion dur="4.5s" repeatCount="indefinite" {...{ path: "M 150 340 Q 260 180 360 190" }} />
        </circle>
        <circle r="2" fill="#f97316" filter="url(#glow)" opacity="0.6">
          {/* @ts-ignore */}
          <animateMotion dur="5.5s" repeatCount="indefinite" {...{ path: "M 80 280 Q 220 320 380 250" }} />
        </circle>
      </svg>

      {/* Corner stats */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <div className="text-accent text-[8px] tracking-[0.3em] uppercase">AGENTS ONLINE</div>
        <div className="text-fg text-sm font-light">1,248</div>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-right">
        <div className="text-fg-dim text-[8px] tracking-[0.3em] uppercase">TRUST QUERIES</div>
        <div className="text-fg text-sm font-light">24.5k<span className="text-fg-dim text-[10px]">/hr</span></div>
      </div>
    </div>
  );
}
