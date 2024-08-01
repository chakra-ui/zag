import { chunk } from "@zag-js/utils"
import { ListCollection } from "./list-collection"
import type { CollectionItem, CollectionOptions } from "./types"

export interface GridCollectionOptions<T> extends CollectionOptions<T> {
  columnCount: number
}

export class GridCollection<T extends CollectionItem = CollectionItem> extends ListCollection<T> {
  columnCount: number

  constructor(options: GridCollectionOptions<T>) {
    const { columnCount } = options
    super(options)
    this.columnCount = columnCount
  }

  /**
   * Returns the row data in the grid
   */
  getRows(): T[][] {
    return chunk([...this.items], this.columnCount)
  }

  /**
   * Returns the number of rows in the grid
   */
  getRowCount(): number {
    return this.getRows().length
  }

  /**
   * Returns the index of the specified row and column in the grid
   */
  getCellIndex(row: number, column: number): number {
    return row * this.columnCount + column
  }

  /**
   * Returns the item at the specified row and column in the grid
   */
  getCell(row: number, column: number): T | null {
    return this.at(this.getCellIndex(row, column))
  }

  /**
   * Returns the value of the previous row in the grid, based on the current value
   */
  getPreviousRowValue(value: string, clamp = false): string | null {
    return this.getPreviousValue(value, this.columnCount, clamp)
  }

  /**
   * Returns the value of the next row in the grid, based on the current value
   */
  getNextRowValue(value: string, clamp = false): string | null {
    return this.getNextValue(value, this.columnCount, clamp)
  }
}
