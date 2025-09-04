"use client";

import { Products } from "@/lib/products";

interface Props {
  params: { category: string; provider: string };
}

export default function ProductPage({ params }: Props) {
  const { category, provider } = params;

  const section = Products[category as keyof typeof Products];
  if (!section) return <div>Invalid category</div>;

  const prov = section.providers.find((p) => p.name.toLowerCase() === provider.toLowerCase());
  if (!prov) return <div>Invalid provider</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <img src={prov.logo} alt={prov.name} className="h-12 w-12" />
        <h1 className="text-2xl font-bold">{prov.name} {section.label}</h1>
      </div>

      {/* Product Card */}
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md">
        {category === "airtime" && (
          <>
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <input
              type="tel"
              placeholder="Phone number"
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <button className="w-full bg-[#00A86B] text-white py-2 rounded">
              Buy {prov.name} Airtime
            </button>
          </>
        )}

        {category === "data" && (
          <>
            <label className="block text-gray-700 text-sm mb-2">Select Bundle</label>
            <select className="w-full border rounded px-3 py-2 mb-4">
              {prov.bundles?.map((bundle, idx) => (
                <option key={idx} value={bundle}>{bundle}</option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone number"
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <button className="w-full bg-[#00A86B] text-white py-2 rounded">
              Buy {prov.name} Data
            </button>
          </>
        )}

        {/* Placeholder for TV & Electricity */}
        {(category === "tv" || category === "electricity") && (
          <p className="text-gray-600">Payment form for {prov.name} coming soon.</p>
        )}
      </div>
    </div>
  );
}
