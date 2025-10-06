"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Products, Category } from "@/lib/products";
import { cn } from "@/lib/utils";

type SidebarProps = {
    className?: string;
    variant?: "desktop" | "mobile";
};

export default function Sidebar({ className, variant = "desktop" }: SidebarProps) {
    const pathname = usePathname();

    const [open, setIsOpen] = useState<Category | null>(null);

    const toggle = (toggled: Category) => {
        setIsOpen((curr) => (curr === toggled ? null : toggled));
    };

    const isActiveProvider = (cat: string, prov: string) =>
        pathname.startsWith(`/dashboard/${cat}/${prov}`);

    const isActiveCategory = (cat: string) =>
        pathname.startsWith(`/dashboard/${cat}`);

    const wrapperClasses =
        variant === "desktop"
            ? "w-64 bg-white border-r border-gray-200 min-h-screen p-4"
            : "w-full h-full bg-white p-4 overflow-y-auto";

    return (
        <aside className={cn(wrapperClasses, className)}>
            {/* Logo */}
            <div className="mb-6">
                <Link href="/">
                    <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-8" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
                {(Object.keys(Products) as Category[]).map((cat) => {
                    const section = Products[cat];
                    const openNow = open === cat;
                    const active = isActiveCategory(cat);

                    return (
                        <div key={cat} className="space-y-1">
                            {/* Category button */}
                            <button
                                onClick={() => toggle(cat)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    active 
                                        ? "bg-blue-100 text-blue-700 border border-blue-200" 
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>

                            {/* Providers (shown only if open) */}
                            {openNow && (
                                <div className="ml-4 space-y-1">
                                    {section.providers.map((prov: string) => (
                                    <Link
                                        key={prov}
                                        href={`/dashboard/products/${cat}/${prov}`}
                                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                                            isActiveProvider(cat, prov) 
                                                ? "bg-blue-50 text-blue-600 font-medium" 
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        {prov}
                                    </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
} 