import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  style: ["normal", "italic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Bean There — Find your perfect cup.",
  description:
    "A highly personalised coffee discovery platform. Discover cafés based on your unique coffee taste, habits, and personality.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bean There",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FAF6F1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSerif.variable} ${GeistSans.variable}`}>
      <body className="min-h-screen" style={{ background: "var(--cream)", fontFamily: "var(--font-geist)" }}>
        <div className="mobile-viewport">
          {children}
        </div>
      </body>
    </html>
  );
}
