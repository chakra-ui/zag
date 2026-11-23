import { expect, test } from "vitest"
import { getFileEntries } from "../../src/file"

type Tree = { [name: string]: Tree | null }

const fileEntry = (name: string) => ({
  name,
  isFile: true,
  isDirectory: false,
  file: (cb: (file: File) => void) => cb({ name } as File),
})

const directoryEntry = (name: string, tree: Tree): any => ({
  name,
  isFile: false,
  isDirectory: true,
  createReader() {
    const batches = [Object.entries(tree).map(([n, sub]) => (sub ? directoryEntry(n, sub) : fileEntry(n))), []]
    return { readEntries: (cb: (entries: any[]) => void) => cb(batches.shift() ?? []) }
  },
})

test("getFileEntries / relativePath keeps nested directory separators", async () => {
  const items = [
    { kind: "file", webkitGetAsEntry: () => directoryEntry("a", { "x.txt": null, b: { c: { "d.txt": null } } }) },
  ] as unknown as DataTransferItemList
  const files = (await getFileEntries(items, true)).flat(Infinity) as Array<File & { relativePath: string }>
  expect(files.map((file) => file.relativePath).sort()).toEqual(["a/b/c/d.txt", "a/x.txt"])
})
