type Searchable = { name: string; description: string; author: string }

export function filterProjects<T extends Searchable>(
  projects: T[],
  query: string,
) {
  const q = query.trim().toLowerCase()
  if (!q) return projects
  return projects.filter((p) =>
    [p.name, p.description, p.author].some((field) =>
      field.toLowerCase().includes(q),
    ),
  )
}
