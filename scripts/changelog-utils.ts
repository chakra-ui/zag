import { Octokit, RestEndpointMethodTypes } from "@octokit/rest"
import { promises as fs } from "fs"

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

/* -----------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------*/

type PullRequests = RestEndpointMethodTypes["pulls"]["list"]["response"]["data"]
type PullRequest = PullRequests[number]

type PrData = {
  id: number
  url: string
  body: string
  date: string
}

/* -----------------------------------------------------------------------------
 *  Get details of a pull request
 * -----------------------------------------------------------------------------*/

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
}

export function getPrData(pr: PullRequest): PrData {
  const content = pr.body ?? ""
  const date = new Date(pr.merged_at!).toLocaleDateString("en-US", dateFormatOptions)

  const body = [
    "---",
    `Release PR: ${pr.html_url}`,
    `Release Date: ${date}`,
    "---",
    "\n",
    `${content.split("# Releases\n")[1]}`,
  ]

  return {
    id: pr.number,
    url: pr.html_url,
    body: body.join("\n"),
    date: date,
  }
}

/* -----------------------------------------------------------------------------
 * Pull request related helpers
 * -----------------------------------------------------------------------------*/

export async function getPrByNumber(num: number): Promise<PullRequest> {
  const { data } = await octokit.pulls.get({
    owner: "chakra-ui",
    repo: "zag",
    pull_number: num,
  })

  return data as any
}

export async function getMergedPrs(): Promise<PullRequests> {
  const { data } = await octokit.pulls.list({
    state: "all",
    owner: "chakra-ui",
    repo: "zag",
    base: "main",
    head: "chakra-ui:changeset-release/main",
    per_page: 100,
  })

  return data.filter((pr) => pr.merged_at)
}

export async function writePrFile(pr: PrData) {
  return fs.writeFile(`.changelog/pr-${pr.id}.md`, pr.body)
}

/* -----------------------------------------------------------------------------
 * The manifest file helpers
 * -----------------------------------------------------------------------------*/

export const manifest = {
  path: ".changelog/manifest.json",
  async write(data: PrData[]) {
    const sortedData = data.sort((a, b) => b.id - a.id)
    return fs.writeFile(this.path, JSON.stringify(sortedData, null, 2))
  },
  async read(): Promise<PrData[]> {
    try {
      return JSON.parse(await fs.readFile(this.path, "utf8"))
    } catch (error) {
      return []
    }
  },
  async update(data: PrData) {
    const prevData = await this.read()
    const newData = [data, ...prevData]
    return this.write(newData)
  },
}

/* -----------------------------------------------------------------------------
 * The readme file helpers
 * -----------------------------------------------------------------------------*/

export async function writeReadme() {
  const data = await manifest.read()
  const sortedData = data.map((pr) => `### ${pr.date}: [#${pr.id}](pr-${pr.id}.md)`)
  const [latestRelease, ...otherReleases] = sortedData

  const readme = [
    "# Changelog",
    "\n",
    "## Latest Release",
    latestRelease,
    "\n",
    "## Previous Releases",
    ...otherReleases,
  ].join("\n")

  await fs.writeFile("CHANGELOG.md", readme)
}
