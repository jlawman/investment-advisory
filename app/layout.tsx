import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investment Advisory - AI-Powered Investment Recommendations",
  description: "Get personalized investment advice from legendary investors like Warren Buffett, Cathie Wood, Bill Ackman, and Bill Gross.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}