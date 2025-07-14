"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SaveChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  onPlayAgain: () => void
  drawingData: string | null
}

export default function SaveChallengeModal({
  isOpen,
  onClose,
  onPlayAgain,
  drawingData,
}: SaveChallengeModalProps) {
  const handleChallengeIt = () => {
    // We'll add logic to create a challenge later
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NICE DRAWING!</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center p-4">
          {drawingData && (
            <img src={drawingData} alt="Your drawing" className="max-w-full h-auto" />
          )}
        </div>
        <DialogFooter className="flex justify-around">
          <Button onClick={handleChallengeIt} variant="default">
            CHALLENGE IT
          </Button>
          <Button onClick={onPlayAgain} variant="secondary">
            PLAY AGAIN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 