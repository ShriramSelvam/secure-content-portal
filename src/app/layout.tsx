import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Secure Content Portal",
  description: "Internal training and reference content, streamed - never downloaded.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
