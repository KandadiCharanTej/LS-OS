import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadScorpio CRM — B2B Outbound Operations Platform",
  description:
    "Production-grade B2B CRM and LinkedIn Outbound Operations Management Operating System for LeadScorpio and its clients.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#FAF9F6] text-[#071525] antialiased">
        {children}
      </body>
    </html>
  );
}

