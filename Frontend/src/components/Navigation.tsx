'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/',          label: 'Dashboard'  },
  { href: '/editor',    label: 'CV Editor'  },
  { href: '/generate',  label: 'Generate'   },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-blue-600 text-lg tracking-tight">
          CV Curator
        </Link>
        <nav className="flex gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
