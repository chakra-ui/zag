"use client"

import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { sidebarTree, type SidebarNode } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { JSX, useEffect, useId, useMemo, useState } from "react"
import styles from "@styles/sidebar.module.css"

export function Sidebar() {
  const pathname = usePathname() || "/"
  const searchParams = useSearchParams()

  const selectedFromParam = searchParams.get("selected")
  const selectedFromPath = getActiveValueFromPath(pathname)
  const activeValue = selectedFromParam || selectedFromPath
  const activeBranch = activeValue?.split("/")[0]

  const expandedRaw = searchParams.get("expanded")
  const expandedFromUrl = useMemo(() => {
    if (expandedRaw == null) return activeBranch ? [activeBranch] : []
    return expandedRaw ? expandedRaw.split(",").filter(Boolean) : []
  }, [expandedRaw, activeBranch])

  // URL only grows on expand; collapses stay local so they don't write history entries.
  const [localExpanded, setLocalExpanded] = useState<string[] | null>(null)
  const expandedValue = localExpanded ?? expandedFromUrl

  const expandedKey = expandedFromUrl.join("|")
  useEffect(() => {
    setLocalExpanded(null)
  }, [expandedKey])

  const [query, setQuery] = useState("")

  const collection = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return baseCollection
    const keep = new Set<string>()
    sidebarTree.children?.forEach((child) => collectKeepSet(child, trimmed, false, keep))
    return baseCollection.filter((node) => keep.has(node.id))
  }, [query])

  // Search expansion is local-only — searching shouldn't pollute the URL.
  const [searchExpanded, setSearchExpanded] = useState<string[] | null>(null)
  useEffect(() => {
    if (!query.trim()) {
      setSearchExpanded(null)
      return
    }
    setSearchExpanded(collection.getBranchValues())
  }, [query, collection])

  const machineExpanded = searchExpanded ?? expandedValue

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    selectedValue: activeValue ? [activeValue] : [],
    expandedValue: machineExpanded,
    onExpandedChange: (details) => {
      if (query.trim()) {
        setSearchExpanded(details.expandedValue)
        return
      }
      setLocalExpanded(details.expandedValue)
    },
  })

  const api = tree.connect(service, normalizeProps)

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <strong>Zagjs</strong>
      </header>

      <div className={styles.search}>
        <SearchIcon size={14} aria-hidden />
        <input
          type="search"
          placeholder="Find component"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button type="button" className={styles.clear} aria-label="Clear search" onClick={() => setQuery("")}>
            <XIcon size={14} />
          </button>
        )}
      </div>

      <div {...api.getRootProps()} className={styles.tree}>
        <div {...api.getTreeProps()}>
          {collection.rootNode.children?.length ? (
            collection.rootNode.children.map((node, index) => (
              <TreeNode
                key={node.id}
                node={node}
                indexPath={[index]}
                api={api}
                expanded={machineExpanded}
                selected={activeValue}
              />
            ))
          ) : (
            <p className={styles.empty}>No matches</p>
          )}
        </div>
      </div>
    </aside>
  )
}

interface TreeNodeProps {
  node: SidebarNode
  indexPath: number[]
  api: tree.Api
  expanded: string[]
  selected: string | null
}

function TreeNode(props: TreeNodeProps): JSX.Element {
  const { node, indexPath, api, expanded, selected } = props
  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  // Branch href targets its first leaf and bakes the branch into `?expanded=` so one navigation does it all.
  const target = node.href ? node : node.children?.find((c) => c.href)
  const nextExpanded = nodeState.isBranch && !expanded.includes(node.id) ? [...expanded, node.id] : expanded
  const href = target?.href ? `${target.href}${buildSearch(target.id, nextExpanded)}` : "#"

  return (
    <div {...api.getNodeGroupProps(nodeProps)}>
      <Link href={href} {...api.getNodeProps(nodeProps)}>
        <div {...api.getNodeCellProps(nodeProps)}>
          {nodeState.isBranch && (
            <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })} className={styles.chevron}>
              <ChevronRightIcon size={14} />
            </span>
          )}
          <span {...api.getNodeTextProps(nodeProps)} className={styles.label}>
            {node.name}
          </span>
        </div>
      </Link>
      {nodeState.isBranch && (
        <div {...api.getNodeGroupContentProps(nodeProps)}>
          {node.children?.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              indexPath={[...indexPath, index]}
              api={api}
              expanded={expanded}
              selected={selected}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const baseCollection = tree.collection<SidebarNode>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: sidebarTree,
})

const filter = createFilter({ sensitivity: "base" })

// Mark a node as a keeper if it OR any ancestor matches; needed because `collection.filter`
// alone would prune children of a matched branch when the children don't themselves match.
function collectKeepSet(node: SidebarNode, query: string, ancestorMatched: boolean, keep: Set<string>): boolean {
  const selfMatched = ancestorMatched || filter.contains(node.name, query)
  let anyChildKept = false
  for (const child of node.children ?? []) {
    if (collectKeepSet(child, query, selfMatched, keep)) anyChildKept = true
  }
  if (selfMatched || anyChildKept) {
    keep.add(node.id)
    return true
  }
  return false
}

function getActiveValueFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length < 2) return null
  return `${segments[0]}/${segments[1]}`
}

function buildSearch(selected: string | null, expanded: string[]): string {
  const params = new URLSearchParams()
  if (selected) params.set("selected", selected)
  if (expanded.length) params.set("expanded", expanded.join(","))
  const out = params.toString()
  return out ? `?${out}` : ""
}
