import { deflateSync } from "node:zlib"
import { expect, test } from "./_test"

function crc32(buffer: Buffer) {
  let crc = ~0
  for (const byte of buffer) {
    crc ^= byte
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return ~crc >>> 0
}

function chunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

// a solid 320x240 RGB PNG, so the test needs no fixture file
function png(width: number, height: number) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header.set([8, 2, 0, 0, 0], 8)
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, 0x5a)])
  const pixels = deflateSync(Buffer.concat(Array.from({ length: height }, () => row)))
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([signature, chunk("IHDR", header), chunk("IDAT", pixels), chunk("IEND", Buffer.alloc(0))])
}

test.describe("image-cropper avatar-upload", () => {
  test("crop an uploaded photo into a round avatar, then start over", async ({ page }) => {
    await page.goto("/image-cropper/avatar-upload")

    await page
      .getByLabel("Choose a photo")
      .setInputFiles({ name: "me.png", mimeType: "image/png", buffer: png(320, 240) })
    await expect(page.locator("[data-image-cropper-image]")).toHaveAttribute("src", /^blob:/)
    await expect(page.locator("[data-image-cropper-root]")).toHaveAttribute("data-shape", "circle")

    await page.getByRole("slider", { name: "Zoom" }).fill("2")
    await expect(page.getByRole("slider", { name: "Zoom" })).toHaveValue("2")

    await page.getByRole("button", { name: "Save avatar" }).click()
    await expect(page.getByRole("img", { name: "Your new avatar" })).toHaveAttribute("src", /^data:image\/png/)

    await page.getByRole("button", { name: "Choose another photo" }).click()
    await expect(page.getByLabel("Choose a photo")).toBeVisible()
    await expect(page.getByRole("img", { name: "Your new avatar" })).toHaveCount(0)
  })
})
