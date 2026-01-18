import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";

// Configure Amplify only if outputs exist
try {
  const outputs = require("@/amplify_outputs.json");
  if (outputs.version) {
    Amplify.configure(outputs);
  }
} catch (e) {
  // amplify_outputs.json not found - backend not yet deployed
  console.warn("Amplify backend not configured. Run 'npm run amplify:sandbox' to set up the backend.");
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Photo Sharing App",
  description: "Share and comment on photos with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
