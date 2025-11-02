import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./providers";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NightFair Hygiene - Privacy-Preserving Vendor Rating",
  description: "Encrypted citizen feedback for cleaner night markets powered by FHEVM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <Navigation />
          <main>{children}</main>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}

