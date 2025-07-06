import Link from "next/link";
import { Button } from "@/components/ui/button";
import DrawableCanvas from "@/components/drawable-canvas";

export default function SoloPlayPage() {
  return (
    <div className="flex flex-col h-screen bg-[#F4F1E9]">
      <header className="flex items-center justify-between p-4 border-b border-gray-300">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          (Hot/Dot)
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Daily Challenge: Day 5</span>
          <div className="w-40 h-2 bg-gray-200 rounded-full">
            <div className="w-1/2 h-full bg-green-500 rounded-full"></div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-[800px] h-[600px] rounded-lg shadow-lg">
          <DrawableCanvas />
        </div>
      </main>
      <footer className="flex items-center justify-between p-4 border-t border-gray-300">
        <div className="flex items-center gap-4">
          <Button variant="outline">Undo</Button>
          <Button variant="outline">Clear</Button>
        </div>
        <Button>Done</Button>
      </footer>
    </div>
  );
}
