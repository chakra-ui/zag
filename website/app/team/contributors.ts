export interface Contributor {
  login: string
  avatar_url: string
  html_url: string
}

// first page of contributors, refreshed daily. an empty list hides the section
export async function fetchContributors(
  exclude: string[] = [],
): Promise<Contributor[]> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/chakra-ui/zag/contributors?per_page=100",
      {
        headers: { "User-Agent": "zag-website-team" },
        next: { revalidate: 60 * 60 * 24 },
      },
    )
    if (!response.ok) return []
    const contributors: Contributor[] = await response.json()
    const skip = new Set(exclude.map((login) => login.toLowerCase()))
    return contributors.filter(
      (person) =>
        !person.login.includes("[bot]") &&
        !skip.has(person.login.toLowerCase()),
    )
  } catch {
    return []
  }
}
