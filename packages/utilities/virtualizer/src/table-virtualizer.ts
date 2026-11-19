import { resizeObserverBorderBox } from "@zag-js/dom-query"
import { ListVirtualizer } from "./list-virtualizer"
import type {
  CSSProperties,
  Range,
  ScrollToColumnOptions,
  TableColumn,
  TableVirtualizerOptions,
  VirtualItem,
} from "./types"
import { getScrollPositionFromEvent } from "./utils/scroll-helpers"

type ScrollEvent = Parameters<ListVirtualizer["handleScroll"]>[0]
type Edge = "start" | "end"
type Span = { start: number; end: number }
type ColumnBounds = { first: number; last: number }
type RowPadding = Pick<TableVirtualizerOptions, "headerSize" | "footerSize" | "scrollPaddingStart">

const COLUMN_KEYS = ["columnCount", "columnSize", "pinnedColumns", "columnOverscan"] as const
type ColumnOptions = { [K in (typeof COLUMN_KEYS)[number]]: TableVirtualizerOptions[K] | undefined }

const EMPTY_STYLE: CSSProperties = {}
const EMPTY_RANGE: Range = { startIndex: 0, endIndex: -1 }

const RETAINED_ROW_STYLE: CSSProperties = {
  position: "absolute",
  top: 0,
  transform: "translateX(-10000px)",
  pointerEvents: "none",
}

const px = (value: number) => `${value}px`

const isSameColumnOption = <K extends keyof ColumnOptions>(key: K, a: ColumnOptions[K], b: ColumnOptions[K]) => {
  if (key !== "pinnedColumns") return a === b
  const x = a as ColumnOptions["pinnedColumns"]
  const y = b as ColumnOptions["pinnedColumns"]
  return (x?.start ?? 0) === (y?.start ?? 0) && (x?.end ?? 0) === (y?.end ?? 0)
}

export class TableVirtualizer extends ListVirtualizer {
  private headerSize: number
  private footerSize: number
  private userScrollPaddingStart: number
  private headerCleanup: VoidFunction | undefined
  private tableScrollHandler: ((event: ScrollEvent) => void) | undefined

  // Cached so render never forces layout
  private clientWidth!: number
  private clientHeight!: number

  private columnOptions!: ColumnOptions
  private columnOffsets = new Float64Array(1)
  private pinnedStart = 0
  private pinnedEnd = 0
  private scrollLeft = 0
  private columnRange: Range = EMPTY_RANGE
  private virtualColumns: TableColumn[] | null = null
  private columnSpacerStyles: Record<Edge, CSSProperties> | null = null
  private pinnedCellStyles = new Map<number, CSSProperties>()

  constructor(options: TableVirtualizerOptions) {
    const { headerSize = 0, footerSize = 0, scrollPaddingStart = 0, ...rest } = options
    super({
      ...rest,
      paddingStart: headerSize,
      paddingEnd: footerSize,
      scrollPaddingStart: scrollPaddingStart + headerSize,
    })
    this.headerSize = headerSize
    this.footerSize = footerSize
    this.userScrollPaddingStart = scrollPaddingStart
    this.columnOptions = {
      columnCount: options.columnCount,
      columnSize: options.columnSize,
      pinnedColumns: options.pinnedColumns,
      columnOverscan: options.columnOverscan,
    }
    this.readClientSize()
    this.rebuildColumns()
  }

  // ============================================
  // Lifecycle
  // ============================================

  override init(scrollElement: HTMLElement): void {
    super.init(scrollElement)
    this.scrollLeft = Math.abs(scrollElement.scrollLeft)
    this.readClientSize()
    this.updateColumnRange()
  }

  override get handleScroll(): (event: ScrollEvent) => void {
    if (!this.tableScrollHandler) {
      const handleRowScroll = super.handleScroll
      this.tableScrollHandler = (event) => {
        this.readClientSize()
        handleRowScroll(event)
        this.scrollLeft = Math.abs(getScrollPositionFromEvent(event).scrollLeft)
        if (this.updateColumnRange()) this.notifyStore()
      }
    }
    return this.tableScrollHandler
  }

  override setViewportSize(size: number): void {
    this.clientHeight = this.scrollElement?.clientHeight || size
    super.setViewportSize(size)
  }

  protected override onCrossAxisSizeChange(size: number): void {
    // Runs from the base constructor, before column state exists.
    if (!this.columnOptions) return
    this.clientWidth = this.scrollElement?.clientWidth || size
    this.updateColumnRange()
  }

  override updateOptions(nextOptions: Partial<TableVirtualizerOptions>): void {
    if (this.destroyed) return
    const {
      headerSize,
      footerSize,
      scrollPaddingStart,
      columnCount,
      columnSize,
      pinnedColumns,
      columnOverscan,
      ...rest
    } = nextOptions

    const columnsChanged = this.updateColumnOptions(nextOptions)
    const paddingChanged = this.updateRowPadding(nextOptions)

    if (Object.keys(rest).length > 0) super.updateOptions(rest)
    if (columnsChanged || paddingChanged) this.notifyStore()
  }

  override destroy(): void {
    this.headerCleanup?.()
    this.headerCleanup = undefined
    super.destroy()
  }

  protected override getScrollportSize(): number {
    return this.clientHeight
  }

  private readClientSize(): void {
    const element = this.scrollElement
    this.clientWidth = element?.clientWidth || this.crossAxisSize
    this.clientHeight = element?.clientHeight || this.viewportSize
  }

  // ============================================
  // Rows
  // ============================================

  /** Ref for the `<thead>`; keeps `headerSize` in sync with its height. */
  measureHeaderElement = (element: HTMLElement | null): void => {
    this.headerCleanup?.()
    this.headerCleanup = undefined
    if (!element || this.destroyed) return
    this.setHeaderSize(element.getBoundingClientRect().height)
    this.headerCleanup = resizeObserverBorderBox.observe(element, (entry) => {
      this.setHeaderSize(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
    })
  }

  private setHeaderSize(size: number): void {
    if (this.destroyed || size === this.headerSize) return
    this.headerSize = size
    this.applyRowPadding()
    this.notifyStore()
  }

  private updateRowPadding(next: RowPadding): boolean {
    const headerSize = next.headerSize ?? this.headerSize
    const footerSize = next.footerSize ?? this.footerSize
    const scrollPaddingStart = next.scrollPaddingStart ?? this.userScrollPaddingStart
    if (
      headerSize === this.headerSize &&
      footerSize === this.footerSize &&
      scrollPaddingStart === this.userScrollPaddingStart
    ) {
      return false
    }
    this.headerSize = headerSize
    this.footerSize = footerSize
    this.userScrollPaddingStart = scrollPaddingStart
    this.applyRowPadding()
    return true
  }

  private applyRowPadding(): void {
    this.options.paddingStart = this.headerSize
    this.options.paddingEnd = this.footerSize
    this.options.scrollPaddingStart = this.userScrollPaddingStart + this.headerSize
    this.invalidateLayout()
  }

  private getRenderedSpan(): Span | null {
    this.calculateRange()
    const { startIndex, endIndex } = this.range
    if (endIndex < startIndex) return null
    return { start: this.getMeasurement(startIndex).start, end: this.getMeasurement(endIndex).end }
  }

  /** Height of the spacer row before (`"start"`) or after (`"end"`) the rendered rows. */
  getRowSpacerStyle(edge: Edge): CSSProperties {
    const rowsStart = this.headerSize
    const rowsEnd = this.getTotalSize() - this.footerSize
    const span = this.getRenderedSpan() ?? { start: rowsStart, end: rowsStart }
    const size = edge === "start" ? span.start - rowsStart : rowsEnd - span.end
    return { height: px(Math.max(0, size)) }
  }

  /** Sticky `<tbody>` that keeps rendered rows painted when scrolling outruns rendering. */
  getBodyStyle(): CSSProperties {
    const span = this.getRenderedSpan()
    if (!span) return EMPTY_STYLE
    const inset = Math.min(0, this.clientHeight - (span.end - span.start))
    return {
      position: "sticky",
      top: px(inset - this.footerSize),
      bottom: px(inset - this.headerSize),
    }
  }

  /** Keeps a retained row focusable but out of the table layout. */
  getRowStyle(virtualItem: VirtualItem): CSSProperties {
    return virtualItem.isRetained ? RETAINED_ROW_STYLE : EMPTY_STYLE
  }

  getTableStyle(): CSSProperties {
    if (!this.hasColumns) return { borderCollapse: "collapse" }
    return { borderCollapse: "collapse", tableLayout: "fixed", width: px(this.getTotalWidth()) }
  }

  // ============================================
  // Columns
  // ============================================

  private get hasColumns(): boolean {
    return this.columnOptions.columnCount !== undefined
  }

  private get columnCount(): number {
    return this.columnOptions.columnCount ?? 0
  }

  private get scrollableColumns(): ColumnBounds {
    return { first: this.pinnedStart, last: this.columnCount - this.pinnedEnd - 1 }
  }

  private updateColumnOptions(next: Partial<TableVirtualizerOptions>): boolean {
    const merged: ColumnOptions = { ...this.columnOptions }
    for (const key of COLUMN_KEYS) {
      if (key in next) Object.assign(merged, { [key]: next[key] })
    }
    const changed = COLUMN_KEYS.some((key) => !isSameColumnOption(key, merged[key], this.columnOptions[key]))
    if (!changed) return false
    this.columnOptions = merged
    this.rebuildColumns()
    return true
  }

  private rebuildColumns(): void {
    const count = this.columnCount
    const { columnSize, pinnedColumns } = this.columnOptions
    if (count > 0 && columnSize === undefined) {
      throw new Error("[@zag-js/virtualizer] `columnSize` is required with `columnCount`.")
    }

    const offsets = new Float64Array(count + 1)
    for (let i = 0; i < count; i++) {
      offsets[i + 1] = offsets[i] + (typeof columnSize === "number" ? columnSize : columnSize!(i))
    }
    this.columnOffsets = offsets
    this.pinnedStart = Math.min(count, pinnedColumns?.start ?? 0)
    this.pinnedEnd = Math.min(count - this.pinnedStart, pinnedColumns?.end ?? 0)
    this.pinnedCellStyles.clear()
    this.setColumnRange(this.computeColumnRange())
  }

  getTotalWidth(): number {
    return this.columnOffsets[this.columnCount]
  }

  private findColumn(offset: number, from: number, to: number): number {
    let lo = from
    let hi = to
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (this.columnOffsets[mid + 1] <= offset) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  private computeColumnRange(): Range {
    const { first, last } = this.scrollableColumns
    if (last < first) return EMPTY_RANGE

    const offsets = this.columnOffsets
    const pinnedStartWidth = offsets[first]
    const pinnedEndWidth = offsets[this.columnCount] - offsets[last + 1]
    const left = this.scrollLeft + pinnedStartWidth
    const right = this.scrollLeft + Math.max(this.clientWidth - pinnedEndWidth, pinnedStartWidth)
    const overscan = this.columnOptions.columnOverscan ?? 2

    const startIndex = this.findColumn(left, first, last)
    const endIndex = Math.max(startIndex, this.findColumn(right - 1, startIndex, last))
    return {
      startIndex: Math.max(first, startIndex - overscan),
      endIndex: Math.min(last, endIndex + overscan),
    }
  }

  private updateColumnRange(): boolean {
    if (!this.hasColumns) return false
    const next = this.computeColumnRange()
    const prev = this.columnRange
    if (next.startIndex === prev.startIndex && next.endIndex === prev.endIndex) return false
    this.setColumnRange(next)
    return true
  }

  private setColumnRange(range: Range): void {
    this.columnRange = range
    this.virtualColumns = null
    this.columnSpacerStyles = null
  }

  private setScrollLeft(offset: number): void {
    if (offset === this.scrollLeft) return
    this.scrollLeft = offset
    if (this.updateColumnRange()) this.notifyStore()
  }

  private createColumn(index: number, pinned: TableColumn["pinned"]): TableColumn {
    const start = this.columnOffsets[index]
    const end = this.columnOffsets[index + 1]
    return { index, start, end, size: end - start, pinned }
  }

  /** Columns to render: pinned columns plus the windowed range. Stable until the range changes. */
  getVirtualColumns(): TableColumn[] {
    if (!this.hasColumns) return []
    if (this.virtualColumns) return this.virtualColumns

    const count = this.columnCount
    const { startIndex, endIndex } = this.columnRange
    const columns: TableColumn[] = []
    for (let i = 0; i < this.pinnedStart; i++) columns.push(this.createColumn(i, "start"))
    for (let i = startIndex; i <= endIndex; i++) columns.push(this.createColumn(i, false))
    for (let i = count - this.pinnedEnd; i < count; i++) columns.push(this.createColumn(i, "end"))

    this.virtualColumns = columns
    return columns
  }

  /** Width of the spacer column before (`"start"`) or after (`"end"`) the windowed columns. */
  getColumnSpacerStyle(edge: Edge): CSSProperties {
    this.columnSpacerStyles ??= this.computeColumnSpacerStyles()
    return this.columnSpacerStyles[edge]
  }

  private computeColumnSpacerStyles(): Record<Edge, CSSProperties> {
    const { first, last } = this.scrollableColumns
    const offsets = this.columnOffsets
    const scrollableStart = offsets[first] ?? 0
    const scrollableEnd = offsets[last + 1] ?? scrollableStart
    const { startIndex, endIndex } = this.columnRange
    const isEmpty = endIndex < startIndex
    const startSize = isEmpty ? 0 : offsets[startIndex] - scrollableStart
    const endSize = isEmpty ? scrollableEnd - scrollableStart : scrollableEnd - offsets[endIndex + 1]
    const spacer = (size: number): CSSProperties => ({ width: px(Math.max(0, size)), padding: 0, border: "none" })
    return { start: spacer(startSize), end: spacer(endSize) }
  }

  /** Width for a column's `<col>`. */
  getColumnStyle(column: TableColumn): CSSProperties {
    return { width: px(column.size) }
  }

  /** Sticky offsets for pinned cells; empty for other columns. */
  getCellStyle(column: TableColumn): CSSProperties {
    if (!column.pinned) return EMPTY_STYLE
    let style = this.pinnedCellStyles.get(column.index)
    if (!style) {
      style =
        column.pinned === "start"
          ? { position: "sticky", insetInlineStart: px(column.start), zIndex: 1 }
          : { position: "sticky", insetInlineEnd: px(this.getTotalWidth() - column.end), zIndex: 1 }
      this.pinnedCellStyles.set(column.index, style)
    }
    return style
  }

  scrollToColumn(index: number, options: ScrollToColumnOptions = {}): void {
    const element = this.scrollElement
    const { first, last } = this.scrollableColumns
    if (!element || index < first || index > last) return

    const offsets = this.columnOffsets
    const pinnedStartWidth = offsets[first]
    const pinnedEndWidth = offsets[this.columnCount] - offsets[last + 1]
    const viewportWidth = element.clientWidth - pinnedStartWidth - pinnedEndWidth
    const start = offsets[index] - pinnedStartWidth
    const end = offsets[index + 1] - pinnedStartWidth
    const current = this.scrollLeft
    const { align = "auto" } = options

    let target = current
    if (align === "start") target = start
    else if (align === "end") target = end - viewportWidth
    else if (align === "center") target = start - (viewportWidth - (end - start)) / 2
    else if (start < current) target = start
    else if (end > current + viewportWidth) target = end - viewportWidth

    const max = Math.max(0, this.getTotalWidth() - element.clientWidth)
    target = Math.max(0, Math.min(max, target))
    const left = this.options.dir === "rtl" ? -target : target
    if (element.scrollTo) element.scrollTo({ left, behavior: options.smooth ? "smooth" : "auto" })
    else element.scrollLeft = left
    this.setScrollLeft(target)
  }
}
