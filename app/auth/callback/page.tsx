'use client';

export default function AuthCallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F1E9] text-center p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Successfully Authenticated!</h1>
      <p className="mb-4">You can now close this tab and return to the original sign-in page.</p>
    </div>
  );
} 