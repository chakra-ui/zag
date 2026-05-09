import { componentRoutes } from "./routes"

export interface SidebarNode {
  id: string
  name: string
  href?: string
  children?: SidebarNode[]
}

export const sidebarTree: SidebarNode = {
  id: "ROOT",
  name: "",
  children: componentRoutes
    .map((component) => ({
      id: component.slug,
      name: component.label,
      children: component.examples.map((example) => ({
        id: `${component.slug}/${example.slug}`,
        name: example.title,
        href: `/${component.slug}/${example.slug}`,
      })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
}

export function getActiveNodeId(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length < 2) return null
  return `${segments[0]}/${segments[1]}`
}
