import type { Metadata } from "next";
import { IBM_Plex_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-serif",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Resume Analyzer — AI Resume Feedback",
  description: "Paste or upload a resume and get an AI-generated score and feedback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${plexSerif.variable} ${plexSans.variable} ${plexMono.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}