import type { ReactNode } from "react";

interface ResponsivePageProps {
    children: ReactNode;
    className?: string;
}

export default function ResponsivePage({
    children,
    className = "",
}: ResponsivePageProps) {
    return (
        <div
            className={`mx-auto w-full min-w-0 max-w-[2200px] space-y-5 p-3 min-[520px]:p-4 min-[1024px]:space-y-6 min-[1024px]:p-6 min-[1536px]:space-y-8 min-[1536px]:p-8 min-[1920px]:p-10 ${className}`}
        >
            {children}
        </div>
    );
}