import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { ServiceWorkerRegistration } from "./ServiceWorkerRegistration";

// Gleiche Schriftart wie auf via-nuova.de, für den Wiedererkennungswert im Dashboard.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "500", "600"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Pizzeria KI-Marketing",
  description: "Content-Automation für lokale Pizzeria",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Via Nuova",
  },
  icons: {
    icon: "/icons/icon-512.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={cormorant.variable}>
      <body className="bg-brand-bg text-brand-cream">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
