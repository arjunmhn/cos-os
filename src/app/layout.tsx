import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CompanyProfileProvider } from "@/components/providers/company-profile-provider";
import { ShellFrame } from "@/components/shell/shell-frame";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chief of Staff OS",
  description:
    "An opinionated operating system for the Chief of Staff at an early-stage, VC-backed tech company.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <CompanyProfileProvider>
          <ShellFrame>{children}</ShellFrame>
        </CompanyProfileProvider>
      </body>
    </html>
  );
}
