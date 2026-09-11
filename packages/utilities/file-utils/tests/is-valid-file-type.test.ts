import { describe, expect, test } from "vitest"
import { createFileTypeValidator, isValidFileType } from "../src/is-valid-file-type"

const file = (name: string, type = "") => ({ name, size: 1, type }) as File

const accepts = (accept: string | string[] | undefined, f: File) => createFileTypeValidator(accept)(f)[0]

describe("isValidFileType", () => {
  test("accepts everything when accept is empty", () => {
    expect(accepts(undefined, file("a.png", "image/png"))).toBe(true)
    expect(accepts("", file("a.png", "image/png"))).toBe(true)
    expect(accepts([], file("a.png", "image/png"))).toBe(true)
  })

  test("matches an exact mime type", () => {
    expect(accepts("image/png", file("a.png", "image/png"))).toBe(true)
    expect(accepts("image/png", file("a.pdf", "application/pdf"))).toBe(false)
  })

  test("matches a wildcard mime type", () => {
    expect(accepts("image/*", file("a.png", "image/png"))).toBe(true)
    expect(accepts("image/*", file("a.pdf", "application/pdf"))).toBe(false)
  })

  test("matches an extension", () => {
    expect(accepts(".png", file("a.png", "image/png"))).toBe(true)
    expect(accepts(".gz", file("archive.tar.gz", "application/gzip"))).toBe(true)
    expect(accepts(".png", file("a.pdf", "application/pdf"))).toBe(false)
  })

  test("is case insensitive on both sides", () => {
    expect(accepts("IMAGE/*", file("a.png", "image/png"))).toBe(true)
    expect(accepts(".png", file("a.PNG"))).toBe(true)
    expect(accepts(".PNG", file("a.png", "image/png"))).toBe(true)
  })

  test("handles a comma separated list with surrounding whitespace", () => {
    const isValid = createFileTypeValidator(" image/png , .txt ")
    expect(isValid(file("a.png", "image/png"))[0]).toBe(true)
    expect(isValid(file("b.txt"))[0]).toBe(true)
    expect(isValid(file("c.pdf", "application/pdf"))[0]).toBe(false)
  })

  test("falls back to the extension when the file has no type", () => {
    expect(accepts("text/*,.pdf", file("c.pdf"))).toBe(true)
    // nothing to infer a type from
    expect(accepts("image/*", file("photo"))).toBe(false)
  })

  test("always accepts the firefox directory placeholder", () => {
    expect(accepts("image/png", file("moz", "application/x-moz-file"))).toBe(true)
  })

  test("accepts an array of types", () => {
    expect(accepts(["image/*"], file("a.png", "image/png"))).toBe(true)
    expect(accepts([".png", "application/pdf"], file("c.pdf", "application/pdf"))).toBe(true)
    expect(accepts([" .TXT "], file("b.txt"))).toBe(true)
    expect(accepts(["image/*"], file("c.pdf", "application/pdf"))).toBe(false)
  })

  test("reports the error alongside the result", () => {
    expect(isValidFileType(file("a.png", "image/png"), "image/*")).toEqual([true, null])
    expect(isValidFileType(file("a.pdf", "application/pdf"), "image/*")).toEqual([false, "FILE_INVALID_TYPE"])
  })

  test("validators are independent", () => {
    const png = file("photo.png", "image/png")
    const images = createFileTypeValidator("image/*")
    const pdfs = createFileTypeValidator("application/pdf")

    expect(images(png)[0]).toBe(true)
    expect(pdfs(png)[0]).toBe(false)
    expect(images(png)[0]).toBe(true)
  })
})
