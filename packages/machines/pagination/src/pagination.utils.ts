import type { MachineContext as Ctx, PaginationRange } from "./pagination.types"

export const utils = {
  range: (start: number, end: number) => {
    let length = end - start + 1
    return Array.from({ length }, (_, idx) => idx + start)
  },
  transform: (items: (string | number)[]): PaginationRange => {
    return items.map((value) => {
      if (typeof value === "number") return { type: "page", value }
      return { type: "ellipsis" }
    })
  },
  getRange: (ctx: Omit<Ctx, "items">) => {
    const totalPageNumbers = ctx.siblingCount + 5
    if (totalPageNumbers >= ctx.totalPages) return utils.transform(utils.range(1, ctx.totalPages))

    const ELLIPSIS = "ellipsis"

    const leftSiblingIndex = Math.max(ctx.page - ctx.siblingCount, 1)
    const rightSiblingIndex = Math.min(ctx.page + ctx.siblingCount, ctx.totalPages)

    const showLeftEllipsis = leftSiblingIndex > 2
    const showRightEllipsis = rightSiblingIndex < ctx.totalPages - 2

    const firstPageIndex = 1
    const lastPageIndex = ctx.totalPages

    if (!showLeftEllipsis && showRightEllipsis) {
      let leftItemCount = 3 + 2 * ctx.siblingCount
      let leftRange = utils.range(1, leftItemCount)

      return utils.transform([...leftRange, ELLIPSIS, ctx.totalPages])
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      let rightItemCount = 3 + 2 * ctx.siblingCount
      let rightRange = utils.range(ctx.totalPages - rightItemCount + 1, ctx.totalPages)
      return utils.transform([firstPageIndex, ELLIPSIS, ...rightRange])
    }

    if (showLeftEllipsis && showRightEllipsis) {
      let middleRange = utils.range(leftSiblingIndex, rightSiblingIndex)
      return utils.transform([firstPageIndex, ELLIPSIS, ...middleRange, ELLIPSIS, lastPageIndex])
    }

    return []
  },
}
