import { Range } from "../src/range"

describe("Range", () => {
  it("should return percent of value in a specific range", () => {
    const percent = new Range({ min: 0, max: 10, value: 5 }).toPercent()
    expect(percent).toStrictEqual(50)
  })

  it("should return value of percent in a specific range", () => {
    const value = new Range({ min: 0, max: 10 }).fromPercent(500)
    expect(+value).toStrictEqual(5000)
  })

  it("should clamp value to specified minimum", () => {
    const value = new Range({ min: 6, max: 10, value: 5 }).clamp()
    expect(+value).toStrictEqual(6)
  })

  describe("should get next value of value after specified step", () => {
    it("with both even from & step", () => {
      const snap = (next: number) =>
        new Range({ value: 0, step: 2 }).snapToStep(next).toString()

      expect(snap(4)).toStrictEqual("4")
      expect(snap(5)).toStrictEqual("6")
      expect(snap(6)).toStrictEqual("6")
    })
    it("with both odd from & step", () => {
      const snap = (next: number) =>
        new Range({ value: 3, step: 5 }).snapToStep(next).toString()

      expect(snap(3)).toStrictEqual("3")
      expect(snap(4)).toStrictEqual("3")
      expect(snap(5)).toStrictEqual("3")
      expect(snap(6)).toStrictEqual("8")
      expect(snap(7)).toStrictEqual("8")
      expect(snap(8)).toStrictEqual("8")
    })
    it("with odd from and even step", () => {
      const snap = (next: number) =>
        new Range({ value: 1, step: 2 }).snapToStep(next).toString()

      expect(snap(3)).toStrictEqual("3")
      expect(snap(4)).toStrictEqual("5")
      expect(snap(5)).toStrictEqual("5")
      expect(snap(6)).toStrictEqual("7")
    })
  })

  it("range should be iterable", () => {
    const range = new Range({ min: 0, max: 10 })
    expect([...range]).toHaveLength(11)
    expect([...range]).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it("clamps value", () => {
    const range = new Range({ min: 0, max: 10, value: 8, step: 4 })
    expect(+range.increment()).toEqual(12)
    expect(+range.increment().clamp()).toEqual(10)

    range.reset()

    range.setStep(0.5)
    expect(+range.decrement()).toEqual(7.5)
  })
})
