import { describe, expect, test } from "vitest"
import { getFileEntries } from "../src/data-transfer"

type Tree = { [name: string]: Tree | null }

const fileEntry = (name: string) => ({
  name,
  isFile: true,
  isDirectory: false,
  file: (cb: (file: File) => void) => cb({ name, size: 1, type: "" } as File),
})

const directoryEntry = (name: string, tree: Tree): any => ({
  name,
  isFile: false,
  isDirectory: true,
  createReader() {
    // like the real reader: entries are handed out once, then an empty batch ends the listing
    let batches = [
      Object.entries(tree).map(([child, sub]) => (sub ? directoryEntry(child, sub) : fileEntry(child))),
      [],
    ]
    return { readEntries: (cb: (entries: any[]) => void) => cb(batches.shift() ?? []) }
  },
})

const droppedDirectory = (name: string, tree: Tree) =>
  [{ kind: "file", webkitGetAsEntry: () => directoryEntry(name, tree) }] as unknown as DataTransferItemList

const relativePaths = async (items: DataTransferItemList) => {
  const files = (await getFileEntries(items, true)).flat(Infinity) as Array<File & { relativePath: string }>
  return files.map((file) => file.relativePath).sort()
}

describe("getFileEntries / relativePath", () => {
  test("file directly inside the dropped directory", async () => {
    const items = droppedDirectory("photos", { "a.png": null })
    expect(await relativePaths(items)).toEqual(["photos/a.png"])
  })

  test("file inside a nested directory keeps a separator between directory names", async () => {
    const items = droppedDirectory("photos", { "a.png": null, "2024": { "b.png": null } })
    expect(await relativePaths(items)).toEqual(["photos/2024/b.png", "photos/a.png"])
  })

  test("two levels of nesting", async () => {
    const items = droppedDirectory("a", { b: { c: { "d.txt": null } } })
    expect(await relativePaths(items)).toEqual(["a/b/c/d.txt"])
  })
})
