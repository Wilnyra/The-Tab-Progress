import { Card, CardContent } from '@/shared/ui/Card'
import { Carousel, CarouselContent, CarouselItem } from '@/shared/ui/Carousel'
import { Skeleton } from '@/shared/ui/Skeleton'

const SKELETON_ITEMS_COUNT = 4

export const PhotosCarouselSkeleton = () => {
  return (
    <div className="min-h-[280px]">
      <Carousel>
        <div className="flex justify-between items-center px-2">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-x-2 flex">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>

        <CarouselContent className="-ml-1">
          {Array.from({ length: SKELETON_ITEMS_COUNT }).map((_, index) => (
            <CarouselItem
              key={index}
              className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="p-1">
                <Card className="overflow-hidden">
                  <CardContent className="flex aspect-square items-center justify-center p-0">
                    <Skeleton className="w-full h-full" />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
