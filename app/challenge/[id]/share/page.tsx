"use client";
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRef } from 'react';

export default function SharePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.location.origin) {
      setShareUrl(`${window.location.origin}/challenge/${id}`);
    }
  }, [id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Copied to clipboard!',
      description: 'The challenge link is ready to be shared.',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-900 dark:text-white">Share Your Challenge</h1>
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={shareUrl}
            className="w-full px-3 py-2 text-gray-700 bg-gray-200 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
          <Button onClick={copyToClipboard} variant="primaryCta">Copy</Button>
        </div>
        <div className="mt-4">
          <Button asChild className="w-full" variant="primaryCta">
            <Link href={shareUrl}>
              Start Challenge
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
