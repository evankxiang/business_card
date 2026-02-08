import { cn } from "@/app/lib/utils";
import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    active?: boolean;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
    ({ className, children, active, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative overflow-hidden rounded-2xl border transition-all duration-300",
                    "bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(0,0,0,0.2)]", // Glass Surface
                    "border-[rgba(255,255,255,0.4)] dark:border-[rgba(255,255,255,0.1)]", // Glass Border
                    "backdrop-blur-xl shadow-lg",
                    active && "ring-2 ring-[rgba(255,255,255,0.5)] scale-[1.01]",
                    className
                )}
                {...props}
            >
                {/* Shine effect overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[rgba(255,255,255,0.2)] to-transparent opacity-50 dark:from-[rgba(255,255,255,0.05)]" />

                <div className="relative z-10">
                    {children}
                </div>
            </div>
        );
    }
);

GlassPanel.displayName = "GlassPanel";
