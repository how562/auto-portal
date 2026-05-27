export interface ValueYourTradePageContent {
  hero: {
    title: string;
    tagline: string[];
    imageUrl: string;
  };
  iframe: {
    src: string;
    height: number;
    title: string;
  };
}

export const VALUE_YOUR_TRADE_PAGE_CONTENT: ValueYourTradePageContent = {
  hero: {
    title: "Value Your Trade",
    tagline: [
      "Get a real offer for your vehicle.",
      "Fast, easy, and backed by Cavender Auto Group.",
    ],
    imageUrl: "/images/hero/vehicle.jpg",
  },
  iframe: {
    src: "https://sellmycar.cavenderautogroup.com/",
    height: 2000,
    title: "Value your trade — Cavender sell my car",
  },
};
