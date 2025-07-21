"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ShareChallengePage({ params }: { params: { id: string } }) {
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    setShareUrl(`${window.location.origin}/challenge/${params.id}`);
  }, [params.id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <h1 className="text-2xl font-bold">Challenge Created!</h1>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm">Share this link with a friend:</span>
        <input
          className="border px-2 py-1 rounded w-64 text-center"
          readOnly
          value={shareUrl}
          onFocus={(e) => e.currentTarget.select()}
        />
      </div>
      <Link href="/solo-play" className="mt-4">
        <Button>PLAY AGAIN</Button>
      </Link>
    </div>
  );
}
