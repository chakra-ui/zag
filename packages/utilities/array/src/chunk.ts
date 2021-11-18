import { last } from "./index"

export const chunk = <T>(v: T[], size: number): T[][] => {
  const res: T[][] = []
  return v.reduce((rows, value, index) => {
    if (index % size === 0) rows.push([value])
    else last(rows)?.push(value)
    return rows
  }, res)
}
