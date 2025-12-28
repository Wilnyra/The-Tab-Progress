import { useEffect, useState } from 'react'
import { PhotoData, PhotosEmptyState, selectAllPhotos } from '@/entities/photos'
import { AddPhotoDialog } from '@/features/photos/AddPhoto'
import {
  ScrollCarouselNext,
  ScrollCarouselPrev,
} from '@/features/ScrollCarousel'
import { Card, CardContent } from '@/shared/ui/Card'
import { Carousel, CarouselContent, CarouselItem } from '@/shared/ui/Carousel'
import { formatDate } from '@/shared/lib/formatDate'

export const PhotosCarousel = () => {
  const [data, setData] = useState<PhotoData[]>([])
  const [reload, setReload] = useState(false)

  useEffect(() => {
    selectAllPhotos({ limit: 30 }).then(({ data }) => {
      setData(data)
    })
  }, [reload])

  if (data.length === 0) {
    return (
      <PhotosEmptyState
        rightSlot={
          <AddPhotoDialog onComplete={() => setReload((prev) => !prev)} />
        }
      />
    )
  }

  return (
    <Carousel>
      <div className="flex justify-between items-center px-2">
        <div className="space-y-1.5">
          <h3 className="font-semibold leading-none tracking-tight">Photos</h3>
          <p className="text-sm text-muted-foreground">
            Visualize your progress
          </p>
        </div>
        <div className="space-x-2">
          <ScrollCarouselPrev />
          <ScrollCarouselNext />
          <AddPhotoDialog onComplete={() => setReload((prev) => !prev)} />
        </div>
      </div>

      <CarouselContent className="-ml-1">
        {data.map((photo) => (
          <CarouselItem
            key={photo.id}
            className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
            <div className="p-1">
              <Card className="overflow-hidden">
                <CardContent className="flex aspect-square items-center justify-center p-0">
                  <img
                    src={photo.url}
                    alt={`Progress photo from ${formatDate(photo.created_at)}`}
                    className="w-full h-full object-cover"
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
