import { getRange } from "../src/pagination.utils"

interface GetRangeTestCase {
  siblingCount: number
  totalPages: number
  pages: number[]
  expected: ReturnType<typeof getRange>
}

const siblingCount1Tests = [
  // totalPages: 1, totalPageNumbers: 1
  {
    siblingCount: 1,
    pages: [1],
    totalPages: 1,
    expected: [1],
  },
  // totalPages: 2, totalPageNumbers: 2
  {
    siblingCount: 1,
    pages: [1, 2],
    totalPages: 2,
    expected: [1, 2],
  },
  // totalPages: 3, totalPageNumbers: 3
  {
    siblingCount: 1,
    pages: [1, 2, 3],
    totalPages: 3,
    expected: [1, 2, 3],
  },
  // totalPages: 4, totalPageNumbers: 4
  {
    siblingCount: 1,
    pages: [1],
    totalPages: 4,
    expected: [1, 2, "ellipsis", 4],
  },
  {
    siblingCount: 1,
    pages: [2, 3],
    totalPages: 4,
    expected: [1, 2, 3, 4],
  },
  {
    siblingCount: 1,
    pages: [4],
    totalPages: 4,
    expected: [1, "ellipsis", 3, 4],
  },
  // totalPages: 5, totalPageNumbers: 5
  {
    siblingCount: 1,
    pages: [1, 2],
    totalPages: 5,
    expected: [1, 2, 3, "ellipsis", 5],
  },
  {
    siblingCount: 1,
    pages: [3],
    totalPages: 5,
    expected: [1, 2, 3, 4, 5],
  },
  {
    siblingCount: 1,
    pages: [4, 5],
    totalPages: 5,
    expected: [1, "ellipsis", 3, 4, 5],
  },
  // totalPages: 6, totalPageNumbers: 6
  {
    siblingCount: 1,
    pages: [1, 2, 3],
    totalPages: 6,
    expected: [1, 2, 3, 4, "ellipsis", 6],
  },
  {
    siblingCount: 1,
    pages: [4, 5, 6],
    totalPages: 6,
    expected: [1, "ellipsis", 3, 4, 5, 6],
  },
  // totalPages: 7, totalPageNumbers: 7
  {
    siblingCount: 1,
    pages: [1, 2, 3],
    totalPages: 7,
    expected: [1, 2, 3, 4, 5, "ellipsis", 7],
  },
  {
    siblingCount: 1,
    pages: [4],
    totalPages: 7,
    expected: [1, "ellipsis", 3, 4, 5, "ellipsis", 7],
  },
  {
    siblingCount: 1,
    pages: [5, 6, 7],
    totalPages: 7,
    expected: [1, "ellipsis", 3, 4, 5, 6, 7],
  },
  // // totalPages: 8, totalPageNumbers: 7
  {
    siblingCount: 1,
    pages: [1, 2, 3],
    totalPages: 8,
    expected: [1, 2, 3, 4, 5, "ellipsis", 8],
  },
  {
    siblingCount: 1,
    pages: [4],
    totalPages: 8,
    expected: [1, "ellipsis", 3, 4, 5, "ellipsis", 8],
  },
  {
    siblingCount: 1,
    pages: [5],
    totalPages: 8,
    expected: [1, "ellipsis", 4, 5, 6, "ellipsis", 8],
  },
  {
    siblingCount: 1,
    pages: [6],
    totalPages: 8,
    expected: [1, "ellipsis", 4, 5, 6, 7, 8],
  },
  // totalPages: 9, totalPageNumbers: 7
  {
    siblingCount: 1,
    pages: [1, 2, 3],
    totalPages: 9,
    expected: [1, 2, 3, 4, 5, "ellipsis", 9],
  },
  {
    siblingCount: 1,
    pages: [4],
    totalPages: 9,
    expected: [1, "ellipsis", 3, 4, 5, "ellipsis", 9],
  },
  {
    siblingCount: 1,
    pages: [5],
    totalPages: 9,
    expected: [1, "ellipsis", 4, 5, 6, "ellipsis", 9],
  },
  {
    siblingCount: 1,
    pages: [6],
    totalPages: 9,
    expected: [1, "ellipsis", 5, 6, 7, "ellipsis", 9],
  },
  {
    siblingCount: 1,
    pages: [7, 8, 9],
    totalPages: 9,
    expected: [1, "ellipsis", 5, 6, 7, 8, 9],
  },
]

const siblingCount2Tests = [
  // totalPages: 1, totalPageNumbers: 1
  {
    siblingCount: 2,
    pages: [1],
    totalPages: 1,
    expected: [1],
  },
  // totalPages: 2, totalPageNumbers: 2
  {
    siblingCount: 2,
    pages: [1, 2],
    totalPages: 2,
    expected: [1, 2],
  },
  // totalPages: 3, totalPageNumbers: 3
  {
    siblingCount: 2,
    pages: [1, 2, 3],
    totalPages: 3,
    expected: [1, 2, 3],
  },
  // totalPages: 4, totalPageNumbers: 4
  {
    siblingCount: 2,
    pages: [1, 2, 3, 4],
    totalPages: 4,
    expected: [1, 2, 3, 4],
  },
  // totalPages: 5, totalPageNumbers: 5
  {
    siblingCount: 2,
    pages: [1],
    totalPages: 5,
    expected: [1, 2, 3, "ellipsis", 5],
  },
  {
    siblingCount: 2,
    pages: [2, 3, 4],
    totalPages: 5,
    expected: [1, 2, 3, 4, 5],
  },
  {
    siblingCount: 2,
    pages: [5],
    totalPages: 5,
    expected: [1, "ellipsis", 3, 4, 5],
  },
  // totalPages: 6, totalPageNumbers: 6
  {
    siblingCount: 2,
    pages: [1],
    totalPages: 6,
    expected: [1, 2, 3, 4, "ellipsis", 6],
  },
  {
    siblingCount: 2,
    pages: [3, 4],
    totalPages: 6,
    expected: [1, 2, 3, 4, 5, 6],
  },
  {
    siblingCount: 2,
    pages: [5, 6],
    totalPages: 6,
    expected: [1, "ellipsis", 3, 4, 5, 6],
  },
  // totalPages: 7, totalPageNumbers: 7
  {
    siblingCount: 2,
    pages: [1, 2, 3],
    totalPages: 7,
    expected: [1, 2, 3, 4, 5, "ellipsis", 7],
  },
  {
    siblingCount: 2,
    pages: [4],
    totalPages: 7,
    expected: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    siblingCount: 2,
    pages: [5, 6, 7],
    totalPages: 7,
    expected: [1, "ellipsis", 3, 4, 5, 6, 7],
  },
  // totalPages: 8, totalPageNumbers: 8
  {
    siblingCount: 2,
    pages: [1, 2, 3, 4],
    totalPages: 8,
    expected: [1, 2, 3, 4, 5, 6, "ellipsis", 8],
  },
  {
    siblingCount: 2,
    pages: [5, 6, 7, 8],
    totalPages: 8,
    expected: [1, "ellipsis", 3, 4, 5, 6, 7, 8],
  },
  // totalPages: 9, totalPageNumbers: 9
  {
    siblingCount: 2,
    pages: [1, 2, 3, 4],
    totalPages: 9,
    expected: [1, 2, 3, 4, 5, 6, 7, "ellipsis", 9],
  },
  {
    siblingCount: 2,
    pages: [5],
    totalPages: 9,
    expected: [1, "ellipsis", 3, 4, 5, 6, 7, "ellipsis", 9],
  },
  {
    siblingCount: 2,
    pages: [6, 7, 8, 9],
    totalPages: 9,
    expected: [1, "ellipsis", 3, 4, 5, 6, 7, 8, 9],
  },
  // totalPages: 10, totalPageNumbers: 9
  {
    siblingCount: 2,
    pages: [1, 2, 3, 4],
    totalPages: 10,
    expected: [1, 2, 3, 4, 5, 6, 7, "ellipsis", 10],
  },
  {
    siblingCount: 2,
    pages: [5],
    totalPages: 10,
    expected: [1, "ellipsis", 3, 4, 5, 6, 7, "ellipsis", 10],
  },
  {
    siblingCount: 2,
    pages: [6],
    totalPages: 10,
    expected: [1, "ellipsis", 4, 5, 6, 7, 8, "ellipsis", 10],
  },
  {
    siblingCount: 2,
    pages: [7, 8, 9, 10],
    totalPages: 10,
    expected: [1, "ellipsis", 4, 5, 6, 7, 8, 9, 10],
  },
  // totalPages: 11, totalPageNumbers: 9
  {
    siblingCount: 2,
    pages: [1, 2, 3, 4],
    totalPages: 11,
    expected: [1, 2, 3, 4, 5, 6, 7, "ellipsis", 11],
  },
  {
    siblingCount: 2,
    pages: [5],
    totalPages: 11,
    expected: [1, "ellipsis", 3, 4, 5, 6, 7, "ellipsis", 11],
  },
  {
    siblingCount: 2,
    pages: [6],
    totalPages: 11,
    expected: [1, "ellipsis", 4, 5, 6, 7, 8, "ellipsis", 11],
  },
  {
    siblingCount: 2,
    pages: [7],
    totalPages: 11,
    expected: [1, "ellipsis", 5, 6, 7, 8, 9, "ellipsis", 11],
  },
  {
    siblingCount: 2,
    pages: [8, 9, 10, 11],
    totalPages: 11,
    expected: [1, "ellipsis", 5, 6, 7, 8, 9, 10, 11],
  },
]

export const getRangeTestCases: GetRangeTestCase[] = [
  {
    siblingCount: 1,
    pages: [0],
    totalPages: 0,
    expected: [],
  },
  ...siblingCount1Tests,
  ...siblingCount2Tests,
]
