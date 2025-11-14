"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Smartphone, Globe, Receipt } from "lucide-react";

export default function UtilitiesLanding() {
  const router = useRouter();

  const items = [
    { id: "airtime", title: "Buy Airtime", icon: Smartphone, href: "/dashboard/utilities/airtime" },
    { id: "data", title: "Buy Data", icon: Globe, href: "/dashboard/utilities/data" },
    { id: "bills", title: "Pay Bills", icon: Receipt, href: "/dashboard/utilities/bills" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={22} className="text-gray-900" />
        </button>
      </div>

      <div className="px-4 mt-2 max-w-md mx-auto">
        <h1 className="text-base font-extrabold text-gray-900">Airtime & Utilities</h1>
        <p className="text-[13px] text-gray-500 mt-2">
          Select an option that best describes the transaction you want to make
        </p>

        <div className="mt-5 space-y-3.5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-green-500 text-white grid place-items-center">
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px] font-semibold text-gray-900">{item.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
