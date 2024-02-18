import { describe, test } from "vitest"
import { formatBytes } from "../src/format-bytes"
import { expect } from "vitest"

describe("formatBytes", () => {
  test("default", () => {
    expect(formatBytes(0)).toMatchInlineSnapshot(`"0 B"`)

    expect(formatBytes(1024)).toMatchInlineSnapshot(`"1.02 kB"`)

    expect(formatBytes(1048576)).toMatchInlineSnapshot(`"1.05 MB"`)

    expect(formatBytes(1073741824)).toMatchInlineSnapshot(`"1.07 GB"`)

    expect(formatBytes(1099511627776)).toMatchInlineSnapshot(`"1.1 TB"`)

    expect(formatBytes(1023)).toMatchInlineSnapshot(`"1.02 kB"`)

    expect(formatBytes(1048575)).toMatchInlineSnapshot(`"1.05 MB"`)

    expect(formatBytes(1073741823)).toMatchInlineSnapshot(`"1.07 GB"`)

    expect(formatBytes(1099511627775)).toMatchInlineSnapshot(`"1.1 TB"`)
  })
})
