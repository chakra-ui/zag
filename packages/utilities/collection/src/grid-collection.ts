import { chunk, hasProp, nextIndex, prevIndex } from "@zag-js/utils"
import { ListCollection } from "./list-collection"
import type { CollectionItem, CollectionOptions } from "./types"

export interface GridCollectionOptions<T> extends CollectionOptions<T> {
  columnCount: number
}

export class GridCollection<T extends CollectionItem = CollectionItem> extends ListCollection<T> {
  columnCount: number
  private rows: T[][] | null = null

  constructor(options: GridCollectionOptions<T>) {
    const { columnCount } = options
    super(options)
    this.columnCount = columnCount
  }

  /**
   * Returns the row data in the grid
   */
  getRows = (): T[][] => {
    if (!this.rows) {
      this.rows = chunk([...this.items], this.columnCount)
    }
    return this.rows
  }

  /**
   * Returns the number of rows in the grid
   */
  getRowCount = (): number => {
    return Math.ceil(this.items.length / this.columnCount)
  }

  /**
   * Returns the index of the specified row and column in the grid
   */
  getCellIndex = (row: number, column: number): number => {
    return row * this.columnCount + column
  }

  /**
   * Returns the item at the specified row and column in the grid
   */
  getCell = (row: number, column: number): T | null => {
    return this.at(this.getCellIndex(row, column))
  }

  /**
   * Returns the row and column index for a given value
   */
  getValueCell = (value: string): { row: number; column: number } | null => {
    const index = this.indexOf(value)
    if (index === -1) return null
    const row = Math.floor(index / this.columnCount)
    const column = index % this.columnCount
    return { row, column }
  }

  /**
   * Returns the value of the last enabled column in a row
   */
  getLastEnabledColumnIndex = (row: number): number | null => {
    for (let col = this.columnCount - 1; col >= 0; col--) {
      const cell = this.getCell(row, col)
      if (cell && !this.getItemDisabled(cell)) {
        return col
      }
    }
    return null
  }

  /**
   * Returns the index of the first enabled column in a row
   */
  getFirstEnabledColumnIndex = (row: number): number | null => {
    for (let col = 0; col < this.columnCount; col++) {
      const cell = this.getCell(row, col)
      if (cell && !this.getItemDisabled(cell)) {
        return col
      }
    }
    return null
  }

  /**
   * Returns the value of the previous row in the grid, based on the current value
   */
  getPreviousRowValue = (value: string, loop = false): string | null => {
    const currentCell = this.getValueCell(value)
    if (currentCell === null) return null

    const rows = this.getRows()
    const rowCount = rows.length

    let prevRowIndex = currentCell.row
    let prevColumnIndex = currentCell.column

    for (let i = 1; i <= rowCount; i++) {
      prevRowIndex = prevIndex(rows, prevRowIndex, { loop })

      const prevRow = rows[prevRowIndex]
      if (!prevRow) continue

      // the previous row has less columns than the current row
      const prevCell = prevRow[prevColumnIndex]
      if (!prevCell) {
        const lastColumnIndex = this.getLastEnabledColumnIndex(prevRowIndex)
        if (lastColumnIndex != null) {
          prevColumnIndex = lastColumnIndex
        }
      }

      // if the previous cell is enabled, return the value
      const cell = this.getCell(prevRowIndex, prevColumnIndex)
      if (!this.getItemDisabled(cell)) {
        return this.getItemValue(cell)
      }
    }

    return this.firstValue
  }

  /**
   * Returns the value of the next row in the grid, based on the current value
   */
  getNextRowValue = (value: string, loop = false): string | null => {
    const currentCell = this.getValueCell(value)
    if (currentCell === null) return null

    const rows = this.getRows()
    const rowCount = rows.length

    let nextRowIndex = currentCell.row
    let nextColumnIndex = currentCell.column

    for (let i = 1; i <= rowCount; i++) {
      nextRowIndex = nextIndex(rows, nextRowIndex, { loop })

      const nextRow = rows[nextRowIndex]
      if (!nextRow) continue

      // if the next cell is has less columns than the current row,
      const nextCell = nextRow[nextColumnIndex]
      if (!nextCell) {
        const lastColumnIndex = this.getLastEnabledColumnIndex(nextRowIndex)
        if (lastColumnIndex != null) {
          nextColumnIndex = lastColumnIndex
        }
      }

      // if the next cell is enabled, return the value
      const cell = this.getCell(nextRowIndex, nextColumnIndex)
      if (!this.getItemDisabled(cell)) {
        return this.getItemValue(cell)
      }
    }

    return this.lastValue
  }
}

export function isGridCollection(v: any): v is GridCollection<any> {
  return hasProp(v, "columnCount") && hasProp(v, "getRows")
}
