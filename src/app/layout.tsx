import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Timetable",
  description: "Two-week study timetable",
  themeColor: "#18181b", // used by Android status bar / PWA theme
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* iOS app-like behavior when added to Home Screen */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Android manifest + theme color */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#18181b" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

