import type { ComponentChildren } from 'preact';
import { cn } from '../../lib/utils';

export function Panel({ children, className }: { children: ComponentChildren; className?: string }) {
  return (
    <div className={cn("relative border border-stroke p-6 bg-surface/50", className)}>
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-stroke-3 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-stroke-3 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-stroke-3 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-stroke-3 translate-x-[1px] translate-y-[1px]" />
      {children}
    </div>
  );
}
