"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";
import { IoNotifications } from "react-icons/io5";
import { useState } from 'react';
import Sidebar from "@/components/dashboard/sidebar";
import { X } from "lucide-react";
import { HiOutlineMenu } from "react-icons/hi";
import { useUser } from "@/contexts/UserContext";

export default function Navbar() {
    const pathName = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { user, clearUser } = useUser();
    const dashboard = pathName == "/dashboard";
    const history = pathName.startsWith("/dashboard/history");

    async function logout() {
      try {
        setLoading(true);
        
        // In production, use the API route
        const isProduction = process.env.NODE_ENV === 'production';
        const apiPath = isProduction ? '/api/v1/auth/logout' : 'http://localhost:4000/api/v1/auth/logout';
        
       
        
        await fetch(apiPath, { 
          method: 'POST', 
          credentials: 'include' 
        });
        
        // Clear user context data
        clearUser();
       
      } catch (e) {
        console.error('Logout error:', e);
        // Clear user data even if API call fails
        clearUser();
      } finally {
        setLoading(false);
        // Use a small delay before redirecting to ensure the cookie is cleared
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
      }
    }

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white border-b">
      <div className="h-14 flex items-center justify-between px-4">
        {/* Left: mobile hamburger + logo */}
        <div className="flex items-center gap-2">
          {/* Hamburger visible on small screens */}
          <button
            aria-label="Open menu"
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
          >
            <HiOutlineMenu className="h-6 w-6" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-5" />
          </Link>
        </div>

        {/* Center: nav, hidden on small screens */}
        <nav className="hidden md:flex items-center gap-1">
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
                {/* Sliq ID Display */}
                {user?.sliqId && (
                  <span className="hidden sm:inline-block px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full">
                    {user.sliqId}
                  </span>
                )}
                <IoSettingsSharp className="cursor-pointer hover:text-gray-800 transition-colors" />
                <IoNotifications className="cursor-pointer hover:text-gray-800 transition-colors" />
                <button onClick={logout} disabled={loading} className="text-sm text-red-600 hover:underline disabled:opacity-50">{loading ? '...' : 'Logout'}</button>
        </div>

        
      </div>

      {/* Mobile off-canvas sidebar */}
      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {/* Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-4/5 max-w-[280px] bg-white shadow-lg md:hidden transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="relative h-full">
          <button
            aria-label="Close menu"
            className="absolute right-3 top-3 p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar variant="mobile" className="h-full pt-10" />
        </div>
      </div>
    </header>
  );
}