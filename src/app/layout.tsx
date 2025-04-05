import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import { DarkModeProvider } from "./context/DarkModeContext";
import { AuthProvider } from "./utile/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <AuthProvider>
        <DarkModeProvider>
          <body className={`
          ${geistSans.variable} ${geistMono.variable} antialiased 
        `}>
            <Header />
            <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-6">{children}</main>
            <Footer />
          </body>
        </DarkModeProvider>
      </AuthProvider>
    </html>
  );
}
