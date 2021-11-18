import { add, point, round } from "../src"
import { closest, distance } from "../src/distance"

describe("Point", () => {
  test("should create a point", () => {
    const v = point(4, 0)
    expect(v.x).toEqual(4)
    expect(v.y).toEqual(0)
  })

  test("should get distance between points", () => {
    expect(distance(point(10, 0), point(20, 0))).toEqual(10)
  })

  test("should get the closest points", () => {
    const fn = closest(point(20, 0), point(30, 0))
    expect(fn(point(12, 0))).toEqual(point(20, 0))
    expect(fn(point(28, 0))).toEqual(point(30, 0))
  })

  test("should align point pixels", () => {
    const v = point(10.56, 60)
    expect(round(v, 0)).toMatchObject({ x: 11, y: 60 })
  })

  test("should add points", () => {
    expect(add(point(10, 0), point(20, 0))).toMatchObject({
      x: 30,
      y: 0,
    })
  })
})
