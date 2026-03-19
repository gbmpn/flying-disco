"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "./LenisProvider";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


type LenisLike = {
  scrollTo: (target: number, options?: { immediate?: boolean }) => void;
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const router = useRouter();

  useEffect(() => {
    if (!document.startViewTransition) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;

      const url = link.getAttribute('href');
      if (!url) return;

      // internal links only
      if (!url.startsWith('/')) return;

      e.preventDefault();

      document.documentElement.classList.add('is-route-transition');
      const transition = document.startViewTransition(() => {
        const lenis = (globalThis as typeof globalThis & { __lenis?: LenisLike }).__lenis;
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
        router.push(url);
      });
      transition.finished.finally(() => {
        document.documentElement.classList.remove('is-route-transition');
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [router]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
