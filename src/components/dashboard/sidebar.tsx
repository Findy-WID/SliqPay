"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Products, Category } from "@/lib/products";

export default function Sidebar() {
    const pathname = usePathname();

    const [open, setIsOpen] = useState<Category | null>(null);

    const toggle = (toggled: Category) => {
        setIsOpen((curr) => (curr === toggled ? null : toggled));
    };

    const isActiveProvider = (cat: string, prov: string) =>
        pathname.startsWith(`/dashboard/${cat}/${prov}`);

    const isActiveCategory = (cat: string) =>
        pathname.startsWith(`/dashboard/${cat}`);

    return (
        <aside>
            {/* Logo */}
            {/* <div>
                <Link href="/">
                    <img src="/Sliqpayvisual12.png" alt="SliqPay" />
                </Link>
            </div> */}

            {/* Navigation */}
            <nav>
                {(Object.keys(Products) as Category[]).map((cat) => {
                    const section = Products[cat];
                    const openNow = open === cat;
                    const active = isActiveCategory(cat);

                    return (
                        <div key={cat}>
                            {/* Category button */}
                            <button
                                onClick={() => toggle(cat)}
                                className={active ? "active" : ""}
                            >
                                {cat}
                            </button>

                            {/* Providers (shown only if open) */}
                            {openNow && (
                                <div>
                                    {section.providers.map((prov: string) => (
                                    <Link
                                        key={prov}
                                        href={`/dashboard/${cat}/${prov}`}
                                        className={isActiveProvider(cat, prov) ? "active" : ""}
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
