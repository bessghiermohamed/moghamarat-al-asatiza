import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "مغامرة الأساتذة - RPG",
  description: "لعبة مغامرة أسطورية عربية - مملكة نور الحكمة",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
