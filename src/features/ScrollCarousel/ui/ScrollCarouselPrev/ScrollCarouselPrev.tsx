import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { useCarousel } from '@/shared/ui/Carousel'

export const ScrollCarouselPrev = () => {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button variant="outline" onClick={scrollPrev} disabled={!canScrollPrev}>
      <ArrowLeft />
    </Button>
  )
}
