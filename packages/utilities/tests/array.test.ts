import { ArrayCollection } from "../src/array"

function collection<T>(values: T[]) {
  return new ArrayCollection(values)
}

const array = [1, 2, 3, 4, 5, 6, 7, 8]

describe("first or last item queries", () => {
  it("should get first item", () => {
    expect(collection(array).first).toEqual(1)
  })

  it("should get last item", () => {
    expect(collection(array).last).toEqual(8)
  })
})

describe("previous item/index queries", () => {
  it("should loop if at the end", () => {
    const index = 0
    const result = collection(array).prev(index)
    expect(result).toEqual(8)
  })

  it("should get previous item", () => {
    const index = 5
    const result = collection(array).prev(index)
    expect(result).toEqual(5)
  })

  it("should get previous index given current index", () => {
    const index = collection([1, 2, 3, 4, 5]).prevIndex(0)
    expect(index).toEqual(4)
  })
})

describe("remove and add operations", () => {
  it("should remove item at index", () => {
    const result = collection(array).removeAt(1).value
    expect(result).toEqual([1, 3, 4, 5, 6, 7, 8])
  })

  it("should add new item to end of array", () => {
    const result = collection(array).add(9).value
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it("should remove item from array", () => {
    const result = collection(array).remove(8).value
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
})

describe("next item or index queries", () => {
  it("should get the next index", () => {
    const result = collection(array).nextIndex(1)
    expect(result).toEqual(2)
  })

  it("should get the next item based on current index", () => {
    const result = collection(array).next(1)
    expect(result).toEqual(3)
  })

  it("should fallback to first item on invalid index", () => {
    const result = collection(array).next(-1)
    expect(result).toEqual(1)
  })

  it("should loop index back to the start", () => {
    const result = collection(array).nextIndex(7)
    expect(result).toEqual(0)
  })
})

describe("search items", () => {
  it("get next item based on search", () => {
    const array = [{ value: "React" }, { value: "Vue" }, { value: "Svelte" }]
    const item = { value: "React" }
    const result = collection(array).search("vu", ({ value }) => value, item)
    expect(result).toEqual({ value: "Vue" })
  })
})
