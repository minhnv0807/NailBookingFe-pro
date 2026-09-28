import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import ContactBubble from "@/components/ContactBubble";

export const metadata: Metadata = {
  title: "The Nail Lounge @ Stokesley | Premium Nail & Beauty",
  description: "Your go-to destination for stunning nails and professional beauty care in Stokesley.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          {children}
          <ContactBubble />
        </LanguageProvider>
      </body>
    </html>
  );
}
