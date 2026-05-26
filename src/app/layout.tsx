import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "مغامرة الأساتذة - RPG",
  description: "لعبة مغامرة أسطورية عربية - مملكة نور الحكمة",
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
