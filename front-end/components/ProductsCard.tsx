"use client";

import { useState } from "react";

export default function ProductCard({ products }: { products: any[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div>
      {products.map((pro) => (
        <div
          key={pro.id}
          onClick={() => setSelected(pro.id)}
          style={{
            display: "flex", gap: "8px", flexWrap: "wrap",
            border: selected === pro.id ? "2px solid blue" : "1px solid gray",
            padding: "8px",
            margin: "4px",
            cursor: "pointer",
          }}
        >
          {pro.description}
        </div>
      ))}

      {selected && (
        <button style={{ marginTop: "12px", padding: "8px 16px" }}>
          Send {products.find((p) => p.id === selected)?.description}
        </button>
      )}
    </div>
  );
}
