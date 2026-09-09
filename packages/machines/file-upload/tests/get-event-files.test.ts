import { describe, expect, test } from "vitest"
import { getFileKey, isFileEqual } from "@zag-js/file-utils"
import { getEventFiles } from "../src/file-upload.utils"

const file = (name: string, size = 10, type = "text/plain") => ({ name, size, type }) as File

const ctx = (props: Record<string, any> = {}) =>
  ({
    prop: (key: string) => ({ minFileSize: 0, maxFileSize: Infinity, maxFiles: Infinity, ...props })[key],
    computed: (key: string) => ({ acceptAttr: undefined, multiple: true, ...props })[key],
  }) as any

describe("getEventFiles", () => {
  test("accepts distinct files", () => {
    const { acceptedFiles, rejectedFiles } = getEventFiles(ctx(), [file("a.txt"), file("b.txt")])

    expect(acceptedFiles.map((f) => f.name)).toEqual(["a.txt", "b.txt"])
    expect(rejectedFiles).toEqual([])
  })

  test("rejects a file already accepted in the same batch", () => {
    const { acceptedFiles, rejectedFiles } = getEventFiles(ctx(), [file("a.txt"), file("a.txt")])

    expect(acceptedFiles).toHaveLength(1)
    expect(rejectedFiles).toHaveLength(1)
    expect(rejectedFiles[0].errors).toContain("FILE_EXISTS")
  })

  test("rejects a file already accepted in an earlier batch", () => {
    const { acceptedFiles, rejectedFiles } = getEventFiles(ctx(), [file("a.txt")], [file("a.txt")])

    expect(acceptedFiles).toEqual([])
    expect(rejectedFiles[0].errors).toContain("FILE_EXISTS")
  })

  test("treats name, size and type as the identity", () => {
    const { acceptedFiles } = getEventFiles(ctx(), [
      file("a.txt", 10, "text/plain"),
      file("a.txt", 11, "text/plain"),
      file("a.txt", 10, "text/html"),
    ])

    expect(acceptedFiles).toHaveLength(3)
  })

  test("a rejected file does not shadow a later valid one", () => {
    const { acceptedFiles } = getEventFiles(ctx({ maxFileSize: 5 }), [file("a.txt", 100), file("b.txt", 1)])

    expect(acceptedFiles.map((f) => f.name)).toEqual(["b.txt"])
  })

  test("ingests a large directory without quadratic slowdown", () => {
    // the O(n^2) dedup this replaced took ~36s for this input
    const files = Array.from({ length: 50_000 }, (_, i) => file(`file-${i}.txt`))

    const start = performance.now()
    const { acceptedFiles } = getEventFiles(ctx(), files)
    const elapsed = performance.now() - start

    expect(acceptedFiles).toHaveLength(50_000)
    expect(elapsed).toBeLessThan(1000)
  })
})

describe("getFileKey", () => {
  test("agrees with isFileEqual", () => {
    const variants = [
      file("a.txt", 10, "text/plain"),
      file("a.txt", 10, "text/html"),
      file("a.txt", 11, "text/plain"),
      file("b.txt", 10, "text/plain"),
    ]

    for (const a of variants) {
      for (const b of variants) {
        expect(getFileKey(a) === getFileKey(b)).toBe(isFileEqual(a, b))
      }
    }
  })
})
