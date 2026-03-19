import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CVProvider } from '@/context/CVContext';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CV Curator — Smart CV Generator',
  description: 'Generate tailored CVs based on job descriptions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CVProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
              {children}
            </main>
            <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-400">
              CV Curator — Smart CV Generator
            </footer>
          </div>
        </CVProvider>
      </body>
    </html>
  );
}
