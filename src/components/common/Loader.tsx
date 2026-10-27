
import type { ReactNode } from "react";

interface LoaderProps {
    message?: string;
    fullPage?: boolean;
    className?: string;
    children?: ReactNode;
}

export default function Loader({
    message = "Loading...",
    fullPage = false,
    className = "",
}: LoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-label={message}
            className={[
                "flex flex-col items-center justify-center gap-4",
                fullPage ? "min-h-[60vh] w-full" : "min-h-48 w-full",
                className,
            ].join(" ")}
        >
            {/* Animated loader */}
            <div className="relative flex h-16 w-16 items-center justify-center">
                {/* Soft outer pulse */}
                <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse" />

                {/* Outer rotating ring */}
                <div className="absolute inset-1 rounded-full border-[3px] border-blue-100" />

                <div className="absolute inset-1 rounded-full border-[3px] border-transparent border-t-blue-700 border-r-blue-500 animate-spin" />

                {/* Inner rotating ring */}
                <div
                    className="absolute inset-[13px] rounded-full border-2 border-transparent border-b-sky-400 animate-spin"
                    style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
                />

                {/* Center indicator */}
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.45)]" />
            </div>

            {/* Loading text */}
            <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-semibold tracking-wide text-slate-700">
                    {message}
                </p>

                <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse" />
                    <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"
                        style={{ animationDelay: "150ms" }}
                    />
                    <span
                        className="h-1.5 w-1.5 rounded-full bg-blue-700 animate-pulse"
                        style={{ animationDelay: "300ms" }}
                    />
                </div>
            </div>

            <span className="sr-only">Please wait while the data loads.</span>
        </div>
    );
}
