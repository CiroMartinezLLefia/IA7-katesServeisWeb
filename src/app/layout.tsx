import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { UserNav } from "@/components/UserNav";
import Link from "next/link";
import { Trophy, Shield, Calendar } from "lucide-react";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Champions SaaS - Plataforma de Partits i Equips",
  description: "IA7 M0613 - Plataforma Champions de partits, equips i classificació amb Next.js, Supabase i Prisma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca" className="h-full scroll-smooth">
      <body className={`${outfit.className} min-h-full flex flex-col bg-background text-foreground antialiased`}>
        <SessionProvider>
          {/* Header */}
          <header className="sticky top-0 z-50 w-full glass border-b border-white/5 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Logo / Brand */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all border border-primary/20">
                  <Trophy className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <span className="font-extrabold text-lg tracking-wider text-slate-100 uppercase glow-text-gold">
                  Champions<span className="text-primary font-light text-sm lowercase ml-0.5">saas</span>
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/teams"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-primary transition-all hover:scale-105"
                >
                  <Shield className="w-4 h-4" />
                  <span>Equips</span>
                </Link>
                <Link
                  href="/matches"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-primary transition-all hover:scale-105"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Partits</span>
                </Link>
              </nav>

              {/* Authentication Status / User Actions */}
              <UserNav />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="w-full glass border-t border-white/5 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} Champions SaaS. Tots els drets reservats.</p>
              <p className="flex items-center gap-2">
                <span>IA7 - Kates Serveis web</span>
                <span className="text-slate-700">•</span>
                <span className="text-primary/70">M0613 (DAW2)</span>
              </p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
