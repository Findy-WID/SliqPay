"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";
import { IoNotifications } from "react-icons/io5";
import { useState } from 'react';

export default function Navbar() {
    const pathName = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const dashboard = pathName == "/dashboard";
    const history = pathName.startsWith("/dashboard/history");

    async function logout() {
      try {
        setLoading(true);
        const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1';
        await fetch(`${base}/auth/logout`, { method: 'POST', credentials: 'include' });
      } catch (e) {
        // swallow
      } finally {
        setLoading(false);
        router.push('/auth/login');
      }
    }

  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="h-14 flex items-center justify-between px-4">
        {/* Left: logo (small) */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-5" />
        </Link>

        {/* Center: nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-md text-sm ${
              dashboard ? "bg-[#00d0ff] text-white" : "hover:bg-gray-100"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/history"
            className={`px-3 py-1.5 rounded-md text-sm ${
              history ? "bg-[#00d0ff] text-white" : "hover:bg-gray-100"
            }`}
          >
            History
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-gray-600">
                <IoSettingsSharp />
                <IoNotifications />
                <button onClick={logout} disabled={loading} className="text-sm text-red-600 hover:underline disabled:opacity-50">{loading ? '...' : 'Logout'}</button>
        </div>

        
      </div>
    </header>
  );
}