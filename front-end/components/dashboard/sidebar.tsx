"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
    className?: string;
    variant?: "desktop" | "mobile";
};

export default function Sidebar({ className, variant = "desktop" }: SidebarProps) {
    const pathname = usePathname();

    const wrapperClasses =
        variant === "desktop"
            ? "w-64 bg-white border-r border-gray-200 min-h-screen p-4"
            : "w-full h-full bg-white p-4 overflow-y-auto";

    const linkBase = "block px-3 py-2 rounded-md text-sm transition-colors";

    return (
        <aside className={cn(wrapperClasses, className)}>
            {/* Logo */}
            <div className="mb-6">
                <Link href="/">
                    <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-8" />
                </Link>
            </div>

            {/* Minimal navigation (VTU removed) */}
            <nav className="space-y-1">
                <Link
                    href="/dashboard"
                    className={cn(
                        linkBase,
                        pathname === "/dashboard"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-100"
                    )}
                >
                    Dashboard
                </Link>
                <Link
                    href="/dashboard/history"
                    className={cn(
                        linkBase,
                        pathname.startsWith("/dashboard/history")
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-100"
                    )}
                >
                    History
                </Link>
            </nav>
        </aside>
    );
}