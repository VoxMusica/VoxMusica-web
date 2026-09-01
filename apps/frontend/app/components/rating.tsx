import { Star } from "lucide-react"
import { useState } from "react"

import { Button } from "./ui/button"

export const Rating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const activeValue = hoverIndex ?? value
  return <div className="flex gap-0">
      {[1, 2, 3, 4, 5].map((star) => (
        <Button
          key={star}
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 cursor-pointer"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverIndex(star)}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <Star
            className={
              star <= activeValue
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }
          />
        </Button>
      ))}
    </div>
}

export default Rating
