import { MachineContext } from "../carousel.types"

export function getSlidesToScroll(
  containerSize: number,
  slideSizesWithGaps: number[],
  slidesToScroll: MachineContext["slidesToScroll"],
) {
  const groupByNumber = typeof slidesToScroll === "number"

  function byNumber<T>(array: T[], groupSize: number): T[][] {
    return Array.from(array.keys())
      .filter((i) => i % groupSize === 0)
      .map((i) => array.slice(i, i + groupSize))
  }

  function bySize<T>(array: T[]): T[][] {
    return Array.from(array.keys())
      .reduce((groups: number[], i) => {
        const chunk = slideSizesWithGaps.slice(groups.at(-1), i + 1)
        const chunkSize = chunk.reduce((a, s) => a + s, 0)
        return !i || chunkSize > containerSize ? groups.concat(i) : groups
      }, [])
      .map((start, i, groups) => array.slice(start, groups[i + 1]))
  }

  return function groupSlides<T>(array: T[]): T[][] {
    return groupByNumber ? byNumber(array, slidesToScroll) : bySize(array)
  }
}
