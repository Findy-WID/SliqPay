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
        
        // In production, use the API route
        const isProduction = process.env.NODE_ENV === 'production';
        const apiPath = isProduction ? '/api/v1/auth/logout' : 'http://localhost:4000/api/v1/auth/logout';
        
        console.log(`Logging out using: ${apiPath}`);
        
        await fetch(apiPath, { 
          method: 'POST', 
          credentials: 'include' 
        });
        
        console.log('Logout successful, redirecting to login page');
      } catch (e) {
        console.error('Logout error:', e);
        // continue with logout even if API call fails
      } finally {
        setLoading(false);
        // Use a small delay before redirecting to ensure the cookie is cleared
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
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