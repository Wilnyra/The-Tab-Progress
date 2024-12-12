import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { useCarousel } from '@/shared/ui/Carousel'

export const ScrollCarouselNext = () => {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <Button variant="outline" onClick={scrollNext} disabled={!canScrollNext}>
      <ArrowRight />
    </Button>
  )
}
