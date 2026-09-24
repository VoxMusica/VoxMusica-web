import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"

interface FavProps {
  isFav: boolean
  onToggle: () => void,
  size?: number
}

export const Fav = ({isFav, onToggle, size = 6}: FavProps) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="cursor-pointer p-5"
      onClick={onToggle}
    >
      <Heart
        className={`
          size-${size} 
          ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}
        `}
      />
    </Button>
  )
}