import { describe, expect, test } from "vitest"
import { FenwickTree } from "../src/utils/fenwick-tree"

describe("FenwickTree", () => {
  test("build from array and query prefix sums", () => {
    const tree = new FenwickTree(5)
    tree.build([10, 20, 30, 40, 50])

    expect(tree.prefixSum(0)).toBe(10)
    expect(tree.prefixSum(1)).toBe(30)
    expect(tree.prefixSum(2)).toBe(60)
    expect(tree.prefixSum(3)).toBe(100)
    expect(tree.prefixSum(4)).toBe(150)
  })

  test("point update modifies prefix sums correctly", () => {
    const tree = new FenwickTree(4)
    tree.build([10, 20, 30, 40])

    // Update index 1: 20 -> 25 (delta = 5)
    tree.add(1, 5)

    expect(tree.prefixSum(0)).toBe(10)
    expect(tree.prefixSum(1)).toBe(35) // 10 + 25
    expect(tree.prefixSum(2)).toBe(65) // 10 + 25 + 30
    expect(tree.prefixSum(3)).toBe(105) // 10 + 25 + 30 + 40
  })

  test("rangeSum returns sum of a subrange", () => {
    const tree = new FenwickTree(5)
    tree.build([10, 20, 30, 40, 50])

    expect(tree.rangeSum(1, 3)).toBe(90) // 20 + 30 + 40
    expect(tree.rangeSum(0, 0)).toBe(10)
    expect(tree.rangeSum(0, 4)).toBe(150)
    expect(tree.rangeSum(3, 1)).toBe(0) // invalid range
  })

  test("lowerBound finds correct index", () => {
    const tree = new FenwickTree(4)
    // Items: size 50, 50, 50, 50 -> prefix sums: 50, 100, 150, 200
    tree.build([50, 50, 50, 50])

    expect(tree.lowerBound(0)).toBe(0) // before first item
    expect(tree.lowerBound(1)).toBe(0) // within first item
    expect(tree.lowerBound(50)).toBe(0) // exactly at boundary
    expect(tree.lowerBound(51)).toBe(1) // just past first
    expect(tree.lowerBound(100)).toBe(1) // at second boundary
    expect(tree.lowerBound(150)).toBe(2)
    expect(tree.lowerBound(200)).toBe(3) // at last boundary
    expect(tree.lowerBound(250)).toBe(3) // beyond total
  })

  test("lowerBoundWithPadding subtracts padding", () => {
    const tree = new FenwickTree(3)
    tree.build([40, 40, 40]) // prefix: 40, 80, 120

    // With 20px padding, offset 30 -> target 10 -> index 0
    expect(tree.lowerBoundWithPadding(30, 20)).toBe(0)
    // offset 60 -> target 40 -> index 0 (prefix sum at 0 is 40)
    expect(tree.lowerBoundWithPadding(60, 20)).toBe(0)
    // offset 61 -> target 41 -> index 1
    expect(tree.lowerBoundWithPadding(61, 20)).toBe(1)
  })

  test("empty tree", () => {
    const tree = new FenwickTree(0)
    // Should not throw, returns -1 (size - 1 where size = 0)
    expect(tree.lowerBound(0)).toBe(-1)
  })

  test("single item", () => {
    const tree = new FenwickTree(1)
    tree.build([100])

    expect(tree.prefixSum(0)).toBe(100)
    expect(tree.lowerBound(50)).toBe(0)
    expect(tree.lowerBound(100)).toBe(0)
  })

  test("clear resets tree", () => {
    const tree = new FenwickTree(3)
    tree.build([10, 20, 30])
    expect(tree.prefixSum(2)).toBe(60)

    tree.clear()
    expect(tree.prefixSum(2)).toBe(0)
  })

  test("set updates via delta", () => {
    const tree = new FenwickTree(3)
    tree.build([10, 20, 30])

    tree.set(1, 50, 20) // change index 1 from 20 to 50
    expect(tree.prefixSum(1)).toBe(60) // 10 + 50
    expect(tree.prefixSum(2)).toBe(90) // 10 + 50 + 30
  })
})
