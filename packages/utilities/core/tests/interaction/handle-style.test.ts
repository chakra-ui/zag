import { describe, expect, test } from "vitest"
import { handleStyle } from "../../src/interaction"

describe("handleStyle", () => {
  test("centers handles on the box's edges", () => {
    const style = (handle: Parameters<typeof handleStyle>[0]) =>
      handleStyle(handle, { align: "center", edgeLength: "96%" })

    expect(style("n")).toEqual({
      position: "absolute",
      cursor: "ns-resize",
      top: 0,
      left: "50%",
      width: "96%",
      translate: "-50% -50%",
    })
    expect(style("e")).toMatchObject({ right: 0, top: "50%", height: "96%", translate: "50% -50%" })
    expect(style("s")).toMatchObject({ bottom: 0, left: "50%", translate: "-50% 50%" })
    expect(style("w")).toMatchObject({ left: 0, top: "50%", translate: "-50% -50%" })
    expect(style("se")).toEqual({
      position: "absolute",
      cursor: "nwse-resize",
      bottom: 0,
      right: 0,
      translate: "50% 50%",
    })
    expect(style("ne")).toMatchObject({ top: 0, right: 0, translate: "50% -50%" })
    expect(style("sw")).toMatchObject({ bottom: 0, left: 0, translate: "-50% 50%" })
    expect(style("nw")).toMatchObject({ top: 0, left: 0, translate: "-50% -50%" })
  })

  test("keeps handles inside the box's edges", () => {
    expect(handleStyle("n")).toEqual({
      position: "absolute",
      cursor: "ns-resize",
      top: 0,
      left: "50%",
      width: "100%",
      translate: "-50% 0",
    })
    expect(handleStyle("e")).toMatchObject({ right: 0, top: "50%", height: "100%", translate: "0 -50%" })
    expect(handleStyle("sw")).toEqual({ position: "absolute", cursor: "nesw-resize", bottom: 0, left: 0 })
  })
})
