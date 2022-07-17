import { getMergedPrs, getPrByNumber, getPrData, writePrFile, writeReadme, manifest } from "./changelog-utils"

async function sync() {
  const prs = await getMergedPrs()
  const data = prs.map(getPrData)
  await Promise.all([...data.map(writePrFile), manifest.write(data)])
  await writeReadme()
}

async function syncByNumber(prNumber: number) {
  const data = getPrData(await getPrByNumber(prNumber))
  await writePrFile(data)
  await manifest.update(data)
  await writeReadme()
}

const arg = process.argv[2]

if (arg) {
  const prNumber = +arg.replace("--number=", "")
  syncByNumber(prNumber)
} else {
  sync()
}
