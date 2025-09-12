import ProductCard from "@/components/ProductsCard";

const mockProducts = [
  { id: 1, amount: 100, description: "₦100 Airtime" },
  { id: 2, amount: 200, description: "₦200 Airtime" },
  { id: 3, amount: 500, description: "₦500 Airtime" },
];

export default function ProductPage({
  params,
}: {
  params: { category: string; provider: string };
}) {
  const { category, provider } = params;

  return (
    <div>
      <img
        src={`/product-logos/${provider.toLowerCase()}.jpg`}
        alt={provider}
        style={{
            width: "80px",
            height: "80px",
            borderRadius: "28px",
          }}
      />
      <h1>
        {provider} {category}
      </h1>
      <p>Product details for {provider} {category}</p>

      {/* Pass products to a client component */}
      <ProductCard products={mockProducts} />
    </div>
  );
}


export function generateStaticParams() {
  return [
    { category: 'airtime', provider: 'MTN' },
    { category: 'airtime', provider: 'Glo' },
    { category: 'airtime', provider: 'Airtel' },
    { category: 'airtime', provider: '9Mobile' },
    { category: 'data', provider: 'MTN' },
    { category: 'data', provider: 'Glo' },
    { category: 'data', provider: 'Airtel' },
    { category: 'data', provider: '9Mobile' },
    { category: 'tv', provider: 'DSTV' },
    { category: 'tv', provider: 'GOTV' },
    { category: 'tv', provider: 'Startimes' },
    { category: 'tv', provider: 'Showmax' },
    { category: 'electricity', provider: 'IKEDC' },
    { category: 'electricity', provider: 'EKEDC' },
    { category: 'electricity', provider: 'AEDC' },
    { category: 'electricity', provider: 'JED' },
    { category: 'electricity', provider: 'IBEDC' },
    { category: 'electricity', provider: 'PHED' },
    { category: 'electricity', provider: 'KED' }
  ];
}
