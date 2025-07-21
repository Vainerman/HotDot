"use client";
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

export default function SharePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Challenge Created!</h1>
          <p className="text-gray-600">Share this link with your friends to challenge them.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input value={shareUrl} readOnly />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
        <Button asChild className="w-full">
          <a href="/solo-play">Play Again</a>
        </Button>
      </div>
    </div>
  );
}
