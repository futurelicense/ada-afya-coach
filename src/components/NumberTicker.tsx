import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function NumberTicker({ value, duration = 1400, prefix = "", suffix = "", className, decimals = 0 }: Props) {
  const [display, setDisplay] = useState(0);
  const frameRef  = useRef<number>();
  const prevRef   = useRef(0);

  useEffect(() => {
    const start     = prevRef.current;
    const end       = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = start + (end - start) * eased;
      setDisplay(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
