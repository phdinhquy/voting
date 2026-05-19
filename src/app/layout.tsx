import type { Metadata } from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import { Toaster } from "sonner";

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
  title: {
    default:
      "TYD Portal",

    template:
      "%s | TYD Portal",
  },

  description:
    "Hệ thống cổng thông tin Trường Y Dược - Đại học Đà Nẵng.",

  keywords: [
    "TYD",

    "Trường Y Dược",

    "Đại học Đà Nẵng",

    "Poster Voting",

    "Nghiên cứu khoa học",

    "Sinh viên nghiên cứu khoa học",
  ],

  authors: [
    {
      name:
        "Trường Y Dược - Đại học Đà Nẵng",
    },
  ],

  creator:
    "Trường Y Dược - Đại học Đà Nẵng",

  openGraph: {
    title:
      "TYD Portal",

    description:
      "Hệ thống cổng thông tin Trường Y Dược - Đại học Đà Nẵng.",

    siteName:
      "TYD Portal",

    locale: "vi_VN",

    type: "website",
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
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-screen bg-slate-50 font-sans antialiased">

        {children}

        <Toaster
          richColors
          position="top-right"
          closeButton
        />
      </body>
    </html>
  );
}