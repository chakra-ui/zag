import { getRange } from "../src/pagination.utils"

interface GetRangeTestCase {
  siblingCount: number
  boundaryCount: number
  totalPages: number
  pages: number[]
  expected: ReturnType<typeof getRange>
}

const siblingCount1Tests = [
  // totalPages: 1, totalPageNumbers: 1
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [1],
    totalPages: 1,
    expected: [1],
  },
  // totalPages: 2, totalPageNumbers: 2
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [1, 2],
    totalPages: 2,
    expected: [1, 2],
  },
  // totalPages: 3, totalPageNumbers: 3
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [1, 2, 3],
    totalPages: 3,
    expected: [1, 2, 3],
  },
  // totalPages: 4, totalPageNumbers: 4
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [1],
    totalPages: 4,
    expected: [1, 2, 3, 4],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [2, 3],
    totalPages: 4,
    expected: [1, 2, 3, 4],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [4],
    totalPages: 4,
    expected: [1, 2, 3, 4],
  },
  // totalPages: 5, totalPageNumbers: 5
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [1, 2],
    totalPages: 5,
    expected: [1, 2, 3, 4, 5],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [3],
    totalPages: 5,
    expected: [1, 2, 3, 4, 5],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [4, 5],
    totalPages: 5,
    expected: [1, 2, 3, 4, 5],
  },
  // totalPages: 6, totalPageNumbers: 6
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [1, 2, 3],
    totalPages: 6,
    expected: [1, 2, 3, 4, 5, 6],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [4, 5, 6],
    totalPages: 6,
    expected: [1, 2, 3, 4, 5, 6],
  },
  // totalPages: 7, totalPageNumbers: 7
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [1, 2, 3],
    totalPages: 7,
    expected: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [4],
    totalPages: 7,
    expected: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [5, 6, 7],
    totalPages: 7,
    expected: [1, 2, 3, 4, 5, 6, 7],
  },
  // // totalPages: 8, totalPageNumbers: 7
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [1, 2, 3],
    totalPages: 8,
    expected: [1, 2, 3, 4, 5, "ellipsis", 8],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [4],
    totalPages: 8,
    expected: [1, 2, 3, 4, 5, "ellipsis", 8],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [5],
    totalPages: 8,
    expected: [1, "ellipsis", 4, 5, 6, 7, 8],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [6],
    totalPages: 8,
    expected: [1, "ellipsis", 4, 5, 6, 7, 8],
  },
  // totalPages: 9, totalPageNumbers: 7
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [1, 2, 3],
    totalPages: 9,
    expected: [1, 2, 3, 4, 5, "ellipsis", 9],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [4],
    totalPages: 9,
    expected: [1, 2, 3, 4, 5, "ellipsis", 9],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [5],
    totalPages: 9,
    expected: [1, "ellipsis", 4, 5, 6, "ellipsis", 9],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [6],
    totalPages: 9,
    expected: [1, "ellipsis", 5, 6, 7, 8, 9],
  },
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [7, 8, 9],
    totalPages: 9,
    expected: [1, "ellipsis", 5, 6, 7, 8, 9],
  },
]

const siblingCount2Tests = [
  // totalPages: 1, totalPageNumbers: 1
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1],
    totalPages: 1,
    expected: [1],
  },
  // totalPages: 2, totalPageNumbers: 2
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1, 2],
    totalPages: 2,
    expected: [1, 2],
  },
  // totalPages: 3, totalPageNumbers: 3
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1, 2, 3],
    totalPages: 3,
    expected: [1, 2, 3],
  },
  // totalPages: 4, totalPageNumbers: 4
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1, 2, 3, 4],
    totalPages: 4,
    expected: [1, 2, 3, 4],
  },
  // totalPages: 5, totalPageNumbers: 5
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1],
    totalPages: 5,
    expected: [1, 2, 3, 4, 5],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [2, 3, 4],
    totalPages: 5,
    expected: [1, 2, 3, 4, 5],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [5],
    totalPages: 5,
    expected: [1, 2, 3, 4, 5],
  },
  // totalPages: 6, totalPageNumbers: 6
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1],
    totalPages: 6,
    expected: [1, 2, 3, 4, 5, 6],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [3, 4],
    totalPages: 6,
    expected: [1, 2, 3, 4, 5, 6],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [5, 6],
    totalPages: 6,
    expected: [1, 2, 3, 4, 5, 6],
  },
  // totalPages: 7, totalPageNumbers: 7
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1, 2, 3],
    totalPages: 7,
    expected: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [4],
    totalPages: 7,
    expected: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [5, 6, 7],
    totalPages: 7,
    expected: [1, 2, 3, 4, 5, 6, 7],
  },
  // totalPages: 8, totalPageNumbers: 8
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1, 2, 3, 4],
    totalPages: 8,
    expected: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [5, 6, 7, 8],
    totalPages: 8,
    expected: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  // totalPages: 9, totalPageNumbers: 9
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1, 2, 3, 4],
    totalPages: 9,
    expected: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [5],
    totalPages: 9,
    expected: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [6, 7, 8, 9],
    totalPages: 9,
    expected: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // totalPages: 10, totalPageNumbers: 9
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1, 2, 3, 4],
    totalPages: 10,
    expected: [1, 2, 3, 4, 5, 6, 7, "ellipsis", 10],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [5],
    totalPages: 10,
    expected: [1, 2, 3, 4, 5, 6, 7, "ellipsis", 10],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [6],
    totalPages: 10,
    expected: [1, "ellipsis", 4, 5, 6, 7, 8, 9, 10],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [7, 8, 9, 10],
    totalPages: 10,
    expected: [1, "ellipsis", 4, 5, 6, 7, 8, 9, 10],
  },
  // totalPages: 11, totalPageNumbers: 9
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [1, 2, 3, 4],
    totalPages: 11,
    expected: [1, 2, 3, 4, 5, 6, 7, "ellipsis", 11],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [5],
    totalPages: 11,
    expected: [1, 2, 3, 4, 5, 6, 7, "ellipsis", 11],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [6],
    totalPages: 11,
    expected: [1, "ellipsis", 4, 5, 6, 7, 8, "ellipsis", 11],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [7],
    totalPages: 11,
    expected: [1, "ellipsis", 5, 6, 7, 8, 9, 10, 11],
  },
  {
    siblingCount: 2,
    boundaryCount: 1,
    pages: [8, 9, 10, 11],
    totalPages: 11,
    expected: [1, "ellipsis", 5, 6, 7, 8, 9, 10, 11],
  },
]

// Tests for boundaryCount=2 to ensure itemCount calculation is correct
// totalPageNumbers = siblingCount*2 + 3 + boundaryCount*2 = 1*2 + 3 + 2*2 = 9
const boundaryCount2Tests = [
  // Right ellipsis only (page near start)
  {
    siblingCount: 1,
    boundaryCount: 2,
    pages: [1, 2, 3],
    totalPages: 15,
    expected: [1, 2, 3, 4, 5, 6, "ellipsis", 14, 15],
  },
  // Left ellipsis only (page near end)
  {
    siblingCount: 1,
    boundaryCount: 2,
    pages: [13, 14, 15],
    totalPages: 15,
    expected: [1, 2, "ellipsis", 10, 11, 12, 13, 14, 15],
  },
  // Both ellipsis (page in middle)
  {
    siblingCount: 1,
    boundaryCount: 2,
    pages: [8],
    totalPages: 15,
    expected: [1, 2, "ellipsis", 7, 8, 9, "ellipsis", 14, 15],
  },
]

export const getRangeTestCases: GetRangeTestCase[] = [
  {
    siblingCount: 1,
    boundaryCount: 1,
    pages: [0],
    totalPages: 0,
    expected: [],
  },
  ...siblingCount1Tests,
  ...siblingCount2Tests,
  ...boundaryCount2Tests,
]
