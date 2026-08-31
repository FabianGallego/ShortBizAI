import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://shortbizai.com"),

  title: {
    default: "ShortBizAI | AI Growth Platform for Small Businesses",
    template: "%s | ShortBizAI",
  },

  description:
    "ShortBizAI helps small businesses attract more customers, create content, and grow with practical AI-powered marketing tools.",

  keywords: [
    "ShortBizAI",
    "AI for small businesses",
    "AI marketing",
    "small business AI",
    "AI marketing tools",
    "business growth",
    "restaurant marketing",
    "local business marketing",
  ],

  openGraph: {
    title: "ShortBizAI | AI Growth Platform for Small Businesses",
    description:
      "Practical AI-powered marketing tools to help small businesses attract customers and grow.",
    url: "https://shortbizai.com",
    siteName: "ShortBizAI",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ShortBizAI | AI Growth Platform for Small Businesses",
    description:
      "Practical AI-powered marketing tools to help small businesses attract customers and grow.",
  },

  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-US"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
