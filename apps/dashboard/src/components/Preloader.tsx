import { useState, useEffect, useRef } from 'preact/hooks';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Cat } from 'lucide-react';

export function Preloader() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const isFirstLoadRef = useRef(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Skip re-triggering on first load completion
    if (!isFirstLoadRef.current && !loading) {
      // Subsequent navigation
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // First load only - runs once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setIsFirstLoad(false);
      isFirstLoadRef.current = false;
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-base"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute z-0 rounded-full bg-accent"
            initial={{ width: 0, height: 0 }}
            animate={{
              width: isFirstLoad ? [0, 0, 3000] : [0, 3000],
              height: isFirstLoad ? [0, 0, 3000] : [0, 3000],
            }}
            transition={{
              duration: isFirstLoad ? 2.6 : 0.8,
              times: isFirstLoad ? [0, 0.75, 1] : [0, 1],
              ease: "easeInOut"
            }}
          />

          <div className="relative z-10 w-full max-w-md px-8 flex flex-col items-center">
            {isFirstLoad ? (
              <>
                <div className="relative w-full h-16 flex items-center mb-8">
                  <div className="absolute w-full h-[2px] border-t-2 border-dashed border-stroke-2" />

                  <motion.div
                    className="absolute h-[2px] bg-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "50%", "50%"] }}
                    transition={{ duration: 2.6, times: [0, 0.6, 1], ease: "easeInOut" }}
                  />

                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-stroke-2 z-0"
                    animate={{
                      backgroundColor: ["#333", "#333", "#f97316", "#ffffff"],
                      scale: [1, 1, 1.5, 0]
                    }}
                    transition={{ duration: 2.6, times: [0, 0.55, 0.65, 0.75] }}
                  />

                  <motion.div
                    className="absolute flex items-center justify-center w-12 h-12 bg-raised border-2 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] z-10"
                    initial={{ left: "0%", x: "-50%" }}
                    animate={{
                      left: ["0%", "50%", "50%"],
                      x: ["-50%", "-50%", "-50%"],
                      scale: [1, 1, 1.2],
                      rotate: [0, 0, 360],
                      borderColor: ["#f97316", "#f97316", "#ffffff"],
                      backgroundColor: ["#111", "#111", "#f97316"],
                      color: ["#f97316", "#f97316", "#ffffff"],
                      boxShadow: ["0 0 20px rgba(249,115,22,0.4)", "0 0 20px rgba(249,115,22,0.4)", "0 0 40px rgba(255,255,255,0.8)"]
                    }}
                    transition={{ duration: 2.6, times: [0, 0.6, 1], ease: "easeInOut" }}
                  >
                    <Cat className="w-6 h-6" />
                  </motion.div>
                </div>

                <motion.div
                  className="flex flex-col items-center gap-3"
                  animate={{ opacity: [1, 1, 0] }}
                  transition={{ duration: 2.6, times: [0, 0.7, 1] }}
                >
                  <div className="text-accent text-[11px] tracking-[0.4em] uppercase font-bold">
                    AGENT REGISTRATION
                  </div>
                  <motion.div
                    className="text-fg-muted text-xs font-mono"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: 3 }}
                  >
                    Establishing Trust Protocol...
                  </motion.div>
                </motion.div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <motion.div
                  animate={{ scale: [0.8, 1.2], rotate: [0, 180] }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="text-white"
                >
                  <Cat className="w-12 h-12" />
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
