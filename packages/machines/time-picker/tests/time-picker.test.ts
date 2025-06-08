import { getTimeRange } from "../src/time-picker.utils"

const range = (options: { from: string; to: string; interval: string }) => {
  return getTimeRange(options).map((t) => t.toString())
}

describe("time-picker", () => {
  it("generates correct time range for hours interval", () => {
    expect(range({ from: "00:00:00", to: "02:00:00", interval: "01:00:00" })).toEqual([
      "00:00:00",
      "01:00:00",
      "02:00:00",
    ])
  })

  it("generates correct time range for minutes interval", () => {
    expect(range({ from: "00:00:00", to: "00:10:00", interval: "00:05:00" })).toEqual([
      "00:00:00",
      "00:05:00",
      "00:10:00",
    ])
  })

  it("generates correct time range for seconds interval", () => {
    expect(range({ from: "00:00:00", to: "00:00:10", interval: "00:00:05" })).toEqual([
      "00:00:00",
      "00:00:05",
      "00:00:10",
    ])
  })

  it("generates correct time range for mixed interval", () => {
    expect(range({ from: "00:00:00", to: "02:00:00", interval: "00:30:00" })).toEqual([
      "00:00:00",
      "00:30:00",
      "01:00:00",
      "01:30:00",
      "02:00:00",
    ])
  })
})
