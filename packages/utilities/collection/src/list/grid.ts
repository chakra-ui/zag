import { chunk, nextIndex } from "@zag-js/utils/array"
import { ListCollection } from "./collection"
import type { CollectionItem, CollectionOptions } from "../types"

export interface GridCollectionOptions<T> extends CollectionOptions<T> {
  columnCount: number
}

export class GridCollection<T extends CollectionItem = CollectionItem> extends ListCollection<T, GridCollection<T>> {
  columnCount: number
  private rows: T[][] | null = null
  private rowsSource: T[] | null = null
  private rowsColumnCount = 0

  constructor(options: GridCollectionOptions<T>) {
    const { columnCount } = options
    super(options)
    this.columnCount = columnCount
  }

  protected override createCollection(items: T[]): GridCollection<T> {
    return new GridCollection({ ...this.options, items, columnCount: this.columnCount })
  }

  /** Returns the row data in the grid */
  getRows(): T[][] {
    if (!this.rows || this.rowsSource !== this.items || this.rowsColumnCount !== this.columnCount) {
      this.rowsSource = this.items
      this.rowsColumnCount = this.columnCount
      this.rows = chunk(this.getOrderedItems(), this.columnCount)
    }
    return this.rows
  }

  /** Returns the number of rows in the grid */
  getRowCount(): number {
    return Math.ceil(this.items.length / this.columnCount)
  }

  /** Returns the index of the specified row and column in the grid */
  getCellIndex(row: number, column: number): number {
    return row * this.columnCount + column
  }

  /** Returns the item at the specified row and column in the grid */
  getCell(row: number, column: number): T | null {
    return this.at(this.getCellIndex(row, column))
  }

  /** Returns the row and column index for a given value */
  getValueCell(value: string): { row: number; column: number } | null {
    const index = this.indexOf(value)
    if (index === -1) return null
    const row = Math.floor(index / this.columnCount)
    const column = index % this.columnCount
    return { row, column }
  }

  /** Returns the value of the last enabled column in a row */
  getLastEnabledColumnIndex(row: number): number | null {
    for (let col = this.columnCount - 1; col >= 0; col--) {
      const cell = this.getCell(row, col)
      if (cell && !this.getItemDisabled(cell)) {
        return col
      }
    }
    return null
  }

  /** Returns the index of the first enabled column in a row */
  getFirstEnabledColumnIndex(row: number): number | null {
    for (let col = 0; col < this.columnCount; col++) {
      const cell = this.getCell(row, col)
      if (cell && !this.getItemDisabled(cell)) {
        return col
      }
    }
    return null
  }

  /** Returns the value of the previous row in the grid, based on the current value */
  getPreviousRowValue(value: string, loop = false): string | null {
    return this.getRowValue(value, loop, -1)
  }

  /** Returns the value of the next row in the grid, based on the current value */
  getNextRowValue(value: string, loop = false): string | null {
    return this.getRowValue(value, loop, 1)
  }

  private getRowValue(value: string, loop: boolean, step: 1 | -1): string | null {
    const cell = this.getValueCell(value)
    if (cell === null) return null

    const rows = this.getRows()
    let { row, column } = cell

    for (let i = 1; i <= rows.length; i++) {
      row = nextIndex(rows, row, { loop, step })
      if (!rows[row]) continue

      // A shorter row has no cell in this column; use its last enabled one
      if (!rows[row][column]) column = this.getLastEnabledColumnIndex(row) ?? column

      const item = this.getCell(row, column)
      if (!this.getItemDisabled(item)) return this.getItemValue(item)
    }

    return step === 1 ? this.lastValue : this.firstValue
  }
}

export function createGridCollection<T extends CollectionItem = CollectionItem>(
  options: GridCollectionOptions<T>,
): GridCollection<T> {
  return new GridCollection(options)
}

export function isGridCollection(v: any): v is GridCollection<any> {
  return v instanceof GridCollection
}
