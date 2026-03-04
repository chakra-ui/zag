import { isNumber } from "@zag-js/utils"
import type { Pages } from "./pagination.types"

export const range = (start: number, end: number) => {
  let length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const transform = (items: (string | number)[]): Pages => {
  return items.map((value) => {
    if (isNumber(value)) return { type: "page", value }
    return { type: "ellipsis" }
  })
}

const ELLIPSIS = "ellipsis"

export type PageContext = {
  page: number
  totalPages: number
  siblingCount: number
  boundaryCount: number
}

export const getRange = (ctx: PageContext) => {
  const { page, totalPages, siblingCount, boundaryCount = 1 } = ctx

  if (totalPages <= 0) return []
  if (totalPages === 1) return [1]

  const firstPageIndex = 1
  const lastPageIndex = totalPages

  const leftSiblingIndex = Math.max(page - siblingCount, firstPageIndex)
  const rightSiblingIndex = Math.min(page + siblingCount, lastPageIndex)

  // Calculate max displayable pages for consistent UI
  const totalPageNumbers = Math.min(siblingCount * 2 + 3 + boundaryCount * 2, totalPages)

  if (totalPages <= totalPageNumbers) {
    return range(firstPageIndex, lastPageIndex)
  }

  const itemCount = totalPageNumbers - 1 - boundaryCount

  const showLeftEllipsis =
    leftSiblingIndex > firstPageIndex + boundaryCount + 1 &&
    Math.abs(leftSiblingIndex - firstPageIndex) > boundaryCount + 1

  const showRightEllipsis =
    rightSiblingIndex < lastPageIndex - boundaryCount - 1 &&
    Math.abs(lastPageIndex - rightSiblingIndex) > boundaryCount + 1

  let pages: (number | string)[] = []

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, itemCount)
    pages.push(...leftRange, ELLIPSIS)
    pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex))
  } else if (showLeftEllipsis && !showRightEllipsis) {
    pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1))
    pages.push(ELLIPSIS)
    const rightRange = range(lastPageIndex - itemCount + 1, lastPageIndex)
    pages.push(...rightRange)
  } else if (showLeftEllipsis && showRightEllipsis) {
    pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1))
    pages.push(ELLIPSIS)
    const middleRange = range(leftSiblingIndex, rightSiblingIndex)
    pages.push(...middleRange)
    pages.push(ELLIPSIS)
    pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex))
  } else {
    pages.push(...range(firstPageIndex, lastPageIndex))
  }

  // Replace ellipsis that would only hide 1 page
  for (let i = 0; i < pages.length; i++) {
    if (pages[i] === ELLIPSIS) {
      const prevPage = isNumber(pages[i - 1]) ? (pages[i - 1] as number) : 0
      const nextPage = isNumber(pages[i + 1]) ? (pages[i + 1] as number) : totalPages + 1

      if (nextPage - prevPage === 2) {
        pages[i] = prevPage + 1
      }
    }
  }

  return pages
}

export const getTransformedRange = (ctx: PageContext) => transform(getRange(ctx))
