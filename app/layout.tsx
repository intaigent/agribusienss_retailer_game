import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kijani Centre | An Agribusiness Life Simulation",
  description:
    "Run a Better Life Farming Centre in Tanzania: manage stock, cash, farmer relationships, and delayed consequences across an uncertain vuli week.",
  icons: {
    icon: "/game-map.png",
    shortcut: "/game-map.png",
  },
  openGraph: {
    title: "Kijani Centre",
    description:
      "Run the shop for five days and discover how cash, stock, advice, and trust interact.",
    images: ["/game-map.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
