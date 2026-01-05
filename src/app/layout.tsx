import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nygosaki.dev",
  description: "Nygosaki | Developer & Security Researcher. Building tools for web automation, reverse engineering, digital reconnaissance, and more.",
  keywords: ["Nygosaki", "MeLikeFish", "Developer", "Security Researcher", "Web Automation", "Reverse Engineering", "Digital Reconnaissance"],
  authors: [{ name: "Nygosaki", url: "https://nygosaki.dev" }],
  creator: "Nygosaki",
  publisher: "Nygosaki",
  // opengraph: {
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
