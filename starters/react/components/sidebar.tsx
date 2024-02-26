"use client"
import { Collapsible } from "@/components/collapsible"
import Link from "next/link"

interface Item {
  id: string
  name: string
  href?: string
  items?: Item[]
}

export interface SidebarNavigationProps {
  items: Item[]
  pathname?: string
}

export const SidebarNavigation = (props: SidebarNavigationProps) => {
  const { items } = props
  //   const [currentPath, setCurrentPath] = useState<string>(pathname)
  //   const [expandedIds, setExpandedIds] = useState<string[]>([])

  //   useEffect(() => {
  //     document.addEventListener("astro:before-swap", (e: TransitionBeforeSwapEvent) => {
  //       setCurrentPath(e.to.pathname)
  //     })
  //   }, [])

  const renderItem = (item: Item, depth = 1) => {
    if (item.items) {
      return (
        <li key={item.name}>
          <Collapsible trigger={<button>{item.name}</button>}>
            <ul key={item.id} data-depth={depth}>
              {item.items.map((i) => renderItem(i, depth + 1))}
            </ul>
          </Collapsible>
        </li>
      )
    }
    return (
      <li key={item.name}>
        <Link
          href={item.href}
          //   aria-current={item.href === currentPath ? "page" : undefined}
          // @ts-expect-error
          style={{ "--depth": depth }}
        >
          {item.name}
        </Link>
      </li>
    )
  }

  return (
    <aside>
      <nav>
        <ul>{items.map((item) => renderItem(item))}</ul>
      </nav>
    </aside>
  )
}
