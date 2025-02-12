import type { Pages, PaginationService } from "./pagination.types"

export const range = (start: number, end: number) => {
  let length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const transform = (items: (string | number)[]): Pages => {
  return items.map((value) => {
    if (typeof value === "number") return { type: "page", value }
    return { type: "ellipsis" }
  })
}

const ELLIPSIS = "ellipsis"

export const getRange = (params: PaginationService) => {
  const { context, prop, computed } = params
  /**
   * `2 * ctx.siblingCount + 5` explanation:
   * 2 * ctx.siblingCount for left/right siblings
   * 5 for 2x left/right ellipsis, 2x first/last page + 1x current page
   *
   * For some page counts (e.g. totalPages: 8, siblingCount: 2),
   * calculated max page is higher than total pages,
   * so we need to take the minimum of both.
   */
  const totalPageNumbers = Math.min(2 * prop("siblingCount") + 5, computed("totalPages"))

  const firstPageIndex = 1
  const lastPageIndex = computed("totalPages")

  const leftSiblingIndex = Math.max(context.get("page") - prop("siblingCount"), firstPageIndex)
  const rightSiblingIndex = Math.min(context.get("page") + prop("siblingCount"), lastPageIndex)

  const showLeftEllipsis = leftSiblingIndex > firstPageIndex + 1
  const showRightEllipsis = rightSiblingIndex < lastPageIndex - 1

  const itemCount = totalPageNumbers - 2 // 2 stands for one ellipsis and either first or last page

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, itemCount)
    return [...leftRange, ELLIPSIS, lastPageIndex]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(lastPageIndex - itemCount + 1, lastPageIndex)
    return [firstPageIndex, ELLIPSIS, ...rightRange]
  }

  if (showLeftEllipsis && showRightEllipsis) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex)
    return [firstPageIndex, ELLIPSIS, ...middleRange, ELLIPSIS, lastPageIndex]
  }

  const fullRange = range(firstPageIndex, lastPageIndex)
  return fullRange
}

export const getTransformedRange = (params: PaginationService) => transform(getRange(params))
