import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ weight: "500", subsets: ["latin"], variable: "--font-ui" });

export const metadata: Metadata = {
  title: "Our Services",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
