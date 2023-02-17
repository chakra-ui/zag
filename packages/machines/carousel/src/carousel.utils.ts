export const getAlignment = (containerSize: number) => ({
  start: () => 0,
  center: (slideSize: number) => (containerSize - slideSize) / 2,
  end: (slideSize: number) => containerSize - slideSize,
})

export const getViewPercent = (containerSize: number, slideSize: number) => (slideSize / containerSize) * 100

export const getScrollSnaps = () => {}
