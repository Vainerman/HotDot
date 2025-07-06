import { Button } from "@/components/ui/button";
import DrawableCanvas from "@/components/drawable-canvas";
import DailyChallengeHeader from "@/components/daily-challenge-header";

export default function SoloPlayPage() {
  return (
    <div className="flex flex-col h-screen bg-[#F4F1E9]">
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <DailyChallengeHeader />
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
