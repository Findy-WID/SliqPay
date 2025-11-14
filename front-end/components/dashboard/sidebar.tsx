"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

type SidebarProps = {
    className?: string;
    variant?: "desktop" | "mobile";
};

export default function Sidebar({ className, variant = "desktop" }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useUser();

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

            {/* User Info - Only show on desktop variant */}
            {variant === "desktop" && user && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-bold">
                            {user.initials || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{user.name || "User"}</h3>
                        </div>
                    </div>
                    {user.sliqId && (
                        <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full">
                            {user.sliqId}
                        </span>
                    )}
                </div>
            )}

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
                    href="/dashboard/utilities"
                    className={cn(
                        linkBase,
                        pathname.startsWith("/dashboard/utilities")
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-100"
                    )}
                >
                    Utilities
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