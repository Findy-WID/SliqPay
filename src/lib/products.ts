export const Products = {
    airtime: {label: "Airtime", providers: ["MTN", "Glo", "Airtel", "9Mobile"]},
    data: {label: "Airtime", providers: ["MTN", "Glo", "Airtel", "9Mobile"]},
    tv: {label: "TV Subscription", providers: ["DSTV", "GOTV", "Startimes", "Showmax"]},
    electricity: {label: "Electricity", providers: ["IKEDC", "EKEDC", "AEDC", "JED", "IBEDC", "PHED", "KED"]}
} as const;

export type Category = keyof typeof Products;