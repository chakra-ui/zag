import { A, useLocation, useSearchParams } from "@solidjs/router"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { sidebarTree, type SidebarNode } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, SearchIcon, XIcon } from "lucide-solid"
import { Accessor, createEffect, createMemo, createSignal, createUniqueId, Index, JSX, Show } from "solid-js"
import styles from "@styles/sidebar.module.css"

export function Sidebar() {
  const location = useLocation()
  const [searchParams] = useSearchParams<{ selected?: string; expanded?: string }>()

  const activeValue = createMemo(() => {
    if (searchParams.selected) return searchParams.selected
    return getActiveValueFromPath(location.pathname)
  })
  const activeBranch = createMemo(() => activeValue()?.split("/")[0])

  const expandedFromUrl = createMemo<string[]>(() => {
    const raw = searchParams.expanded
    if (raw == null) {
      const branch = activeBranch()
      return branch ? [branch] : []
    }
    return raw ? raw.split(",").filter(Boolean) : []
  })

  // URL only grows on expand; collapses stay local so they don't write history entries.
  const [localExpanded, setLocalExpanded] = createSignal<string[] | null>(null)
  const expandedValue = createMemo(() => localExpanded() ?? expandedFromUrl())

  createEffect(() => {
    expandedFromUrl()
    setLocalExpanded(null)
  })

  const [query, setQuery] = createSignal("")

  const collection = createMemo(() => {
    const trimmed = query().trim()
    if (!trimmed) return baseCollection
    const keep = new Set<string>()
    sidebarTree.children?.forEach((child) => collectKeepSet(child, trimmed, false, keep))
    return baseCollection.filter((node) => keep.has(node.id))
  })

  // Search expansion is local-only — searching shouldn't pollute the URL.
  const [searchExpanded, setSearchExpanded] = createSignal<string[] | null>(null)
  createEffect(() => {
    if (!query().trim()) {
      setSearchExpanded(null)
      return
    }
    setSearchExpanded(collection().getBranchValues())
  })

  const machineExpanded = createMemo(() => searchExpanded() ?? expandedValue())

  const service = useMachine(tree.machine, () => ({
    id: createUniqueId(),
    collection: collection(),
    selectedValue: activeValue() ? [activeValue()!] : [],
    expandedValue: machineExpanded(),
    onExpandedChange: (details) => {
      if (query().trim()) {
        setSearchExpanded(details.expandedValue)
        return
      }
      setLocalExpanded(details.expandedValue)
    },
  }))

  const api = createMemo(() => tree.connect(service, normalizeProps))

  return (
    <aside class={styles.sidebar}>
      <header class={styles.header}>
        <strong>Zagjs</strong>
      </header>

      <div class={styles.search}>
        <SearchIcon size={14} aria-hidden />
        <input
          type="search"
          placeholder="Find component"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
        <Show when={query()}>
          <button type="button" class={styles.clear} aria-label="Clear search" onClick={() => setQuery("")}>
            <XIcon size={14} />
          </button>
        </Show>
      </div>

      <div {...api().getRootProps()} class={styles.tree}>
        <div {...api().getTreeProps()}>
          <Show when={collection().rootNode.children?.length} fallback={<p class={styles.empty}>No matches</p>}>
            <Index each={collection().rootNode.children}>
              {(node, index) => <TreeNode node={node()} indexPath={[index]} api={api} expanded={machineExpanded()} />}
            </Index>
          </Show>
        </div>
      </div>
    </aside>
  )
}

interface TreeNodeProps {
  node: SidebarNode
  indexPath: number[]
  api: Accessor<tree.Api>
  expanded: string[]
}

function TreeNode(props: TreeNodeProps): JSX.Element {
  const nodeProps = () => ({ indexPath: props.indexPath, node: props.node })
  const nodeState = createMemo(() => props.api().getNodeState(nodeProps()))

  const target = createMemo(() => (props.node.href ? props.node : props.node.children?.find((c) => c.href)))
  const nextExpanded = createMemo(() =>
    nodeState().isBranch && !props.expanded.includes(props.node.id)
      ? [...props.expanded, props.node.id]
      : props.expanded,
  )
  const href = createMemo(() => {
    const t = target()
    return t?.href ? `${t.href}${buildSearch(t.id, nextExpanded())}` : "#"
  })

  return (
    <div {...props.api().getNodeGroupProps(nodeProps())}>
      <A href={href()} {...props.api().getNodeProps(nodeProps())}>
        <div {...props.api().getCellProps(nodeProps())}>
          <Show when={nodeState().isBranch}>
            <span {...props.api().getNodeIndicatorProps({ ...nodeProps(), type: "expanded" })} class={styles.chevron}>
              <ChevronRightIcon size={14} />
            </span>
          </Show>
          <span {...props.api().getNodeTextProps(nodeProps())} class={styles.label}>
            {props.node.name}
          </span>
        </div>
      </A>
      <Show when={nodeState().isBranch}>
        <div {...props.api().getNodeGroupContentProps(nodeProps())}>
          <Index each={props.node.children}>
            {(child, index) => (
              <TreeNode
                node={child()}
                indexPath={[...props.indexPath, index]}
                api={props.api}
                expanded={props.expanded}
              />
            )}
          </Index>
        </div>
      </Show>
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
