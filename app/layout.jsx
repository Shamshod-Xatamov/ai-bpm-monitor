import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "AI-BPM Monitor — Jarayonlardan aniq qarorlargacha",
  description:
    "AI-BPM Monitor — biznes jarayonlarini monitoring, prognoz va iqtisodiy tahlil orqali boshqaruv qaroriga aylantiruvchi intellektual platforma.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f1e8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={`${manrope.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
