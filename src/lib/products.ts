// export const Products = {
//     airtime: {label: "Airtime", providers: ["MTN", "Glo", "Airtel", "9Mobile"]},
//     data: {label: "Airtime", providers: ["MTN", "Glo", "Airtel", "9Mobile"]},
//     tv: {label: "TV Subscription", providers: ["DSTV", "GOTV", "Startimes", "Showmax"]},
//     electricity: {label: "Electricity", providers: ["IKEDC", "EKEDC", "AEDC", "JED", "IBEDC", "PHED", "KED"]}
// } as const;

// export type Category = keyof typeof Products;


export type Category = "airtime" | "data" | "tv" | "electricity";

export const Products: Record<
  Category,
  {
    label: string;
    providers: { name: string; logo: string; bundles?: string[] }[];
  }
> = {
  airtime: {
    label: "Airtime",
    providers: [
      { name: "MTN", logo: "/logos/mtn.png" },
      { name: "Glo", logo: "/logos/glo.png" },
      { name: "Airtel", logo: "/logos/airtel.png" },
      { name: "9Mobile", logo: "/logos/9mobile.png" },
    ],
  },
  data: {
    label: "Data",
    providers: [
      { name: "MTN", logo: "/logos/mtn.png", bundles: ["500MB - ₦100", "1GB - ₦200", "2GB - ₦500"] },
      { name: "Glo", logo: "/logos/glo.png", bundles: ["1GB - ₦200", "3GB - ₦1000"] },
      { name: "Airtel", logo: "/logos/airtel.png", bundles: ["1.5GB - ₦500", "4GB - ₦1200"] },
      { name: "9Mobile", logo: "/logos/9mobile.png", bundles: ["2GB - ₦800", "5GB - ₦2000"] },
    ],
  },
  tv: {
    label: "TV Subscription",
    providers: [
      { name: "DSTV", logo: "/logos/dstv.png" },
      { name: "GOTV", logo: "/logos/gotv.png" },
      { name: "Startimes", logo: "/logos/startimes.png" },
    ],
  },
  electricity: {
    label: "Electricity",
    providers: [
      { name: "EEDC", logo: "/logos/eedc.png" },
      { name: "IKEDC", logo: "/logos/ikedc.png" },
      { name: "KEDCO", logo: "/logos/kedco.png" },
    ],
  },
};
