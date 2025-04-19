
import './globals.css';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LeezieBite - Food Reimagined",
  description: "Order delicious meals effortlessly with our chatbot 🍽️",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="no-tailwind">
        <div className="page-wrapper no-scroll">
          {/* Header */}
          <header className="top-header">
            <div className="brand">LeezieBite 🍴</div>
          </header>

          {/* Background */}
          <div className="hero-only" />

          <main className="content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
