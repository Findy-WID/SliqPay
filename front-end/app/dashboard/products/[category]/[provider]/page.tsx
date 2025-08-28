export default function ProductPage({ 
    params 
}: { 
    params: { category: string; provider: string } 
}) {
    return(
        <div>
            <h1>{params.provider} {params.category}</h1>
            <p>Product details for {params.provider} {params.category}</p>
        </div>
    )
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