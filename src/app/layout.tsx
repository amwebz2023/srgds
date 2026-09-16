import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://srgds-sonthangal.example"),
  title: { default: "SRGDS Alumni | Connecting our community", template: "%s | SRGDS Alumni" },
  description: "A connected community platform for SRGDS Alumni members to register, grow, and celebrate one another.",
  openGraph: { title: "SRGDS Alumni | Connecting our community", description: "Connecting our community, building our future.", type: "website", locale: "en_IN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
