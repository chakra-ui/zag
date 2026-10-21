import { describe, expect, test } from "vitest"
import { getFileMimeType } from "../src/get-file-mime-type"

describe("getFileMimeType", () => {
  test("returns the mime type for a known extension", () => {
    expect(getFileMimeType("photo.png")).toBe("image/png")
    expect(getFileMimeType("archive.tar.gz")).toBe("application/gzip")
  })

  test("ignores the case of the extension", () => {
    expect(getFileMimeType("IMG_0001.HEIC")).toBe("image/heic")
    expect(getFileMimeType("photo.JPG")).toBe("image/jpeg")
    expect(getFileMimeType("Report.Pdf")).toBe("application/pdf")
  })

  test("returns null for an unknown extension", () => {
    expect(getFileMimeType("notes.unknownext")).toBeNull()
    expect(getFileMimeType("file.")).toBeNull()
  })
})
