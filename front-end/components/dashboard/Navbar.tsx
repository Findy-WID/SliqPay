"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";
import { IoNotifications } from "react-icons/io5";



export default function Navbar() {
    const pathName = usePathname();

    const dashboard = pathName == "/dashboard";
    const history = pathName.startsWith("/dashboard/history");


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
        </div>

        
      </div>
    </header>
  );
} 