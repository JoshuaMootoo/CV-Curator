'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCVContext } from '@/context/CVContext';
import CVDisplay from '@/components/CVDisplay';

export default function OutputPage() {
  const { generatedCV } = useCVContext();
  const router = useRouter();

  // If user navigates directly without generating, redirect to generate page
  useEffect(() => {
    if (!generatedCV) router.replace('/generate');
  }, [generatedCV, router]);

  if (!generatedCV) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generated CV</h1>
          <p className="text-gray-500 mt-1">Tailored based on your job description</p>
        </div>
        <div className="flex gap-2">
          <Link href="/generate" className="btn-secondary">Generate another</Link>
        </div>
      </div>

      <CVDisplay cv={generatedCV} />
    </div>
  );
}
