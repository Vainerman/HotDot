import { Button } from "@/components/ui/button";
import DrawableCanvas from "@/components/drawable-canvas";

export default function SoloPlayPage() {
  return (
    <div className="flex flex-col h-screen bg-[#F4F1E9]">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          className="w-[800px] h-[600px] rounded-lg shadow-lg"
          style={{ 
            backgroundImage: "url('/assets/Card_1.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center' 
          }}
        >
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
