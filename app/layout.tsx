import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kijani Quest | Better Life Farming Tanzania",
  description:
    "A short decision game for agribusiness retailers applying ALP lessons in a Better Life Farming Centre in Tanzania.",
  icons: {
    icon: "/game-map.png",
    shortcut: "/game-map.png",
  },
  openGraph: {
    title: "Kijani Quest",
    description:
      "Run a rural Better Life Farming Centre and put ALP training into practice.",
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
