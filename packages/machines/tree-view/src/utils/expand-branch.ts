import { type Params } from "@zag-js/core"
import { add, ensure, partition, uniq } from "@zag-js/utils"
import type { NodeWithError, TreeViewSchema } from "../tree-view.types"

export function expandBranches(params: Params<TreeViewSchema>, values: string[]) {
  const { context, prop, refs } = params

  if (!prop("loadChildren")) {
    context.set("expandedValue", (prev) => uniq(add(prev, ...values)))
    return
  }

  const loadingStatus = context.get("loadingStatus")
  const [loadedValues, loadingValues] = partition(values, (value) => loadingStatus[value] === "loaded")

  if (loadedValues.length > 0) {
    context.set("expandedValue", (prev) => uniq(add(prev, ...loadedValues)))
  }

  if (loadingValues.length === 0) return

  const collection = prop("collection")
  const [nodeWithChildren, nodeWithoutChildren] = partition(loadingValues, (id) => {
    const node = collection.findNode(id)
    return collection.getNodeChildren(node).length > 0
  })

  // Check if node already has children (skip loading)
  if (nodeWithChildren.length > 0) {
    context.set("expandedValue", (prev) => uniq(add(prev, ...nodeWithChildren)))
  }

  if (nodeWithoutChildren.length === 0) return

  context.set("loadingStatus", (prev) => ({
    ...prev,
    ...nodeWithoutChildren.reduce((acc, id) => ({ ...acc, [id]: "loading" }), {}),
  }))

  const nodesToLoad = nodeWithoutChildren.map((id) => {
    const indexPath = collection.getIndexPath(id)!
    const valuePath = collection.getValuePath(indexPath)!
    const node = collection.findNode(id)!
    return { id, indexPath, valuePath, node }
  })

  const pendingAborts = refs.get("pendingAborts")

  // load children asynchronously
  const loadChildren = prop("loadChildren")
  ensure(loadChildren, () => "[zag-js/tree-view] `loadChildren` is required for async expansion")

  const proms = nodesToLoad.map(({ id, indexPath, valuePath, node }) => {
    const existingAbort = pendingAborts.get(id)
    if (existingAbort) {
      existingAbort.abort()
      pendingAborts.delete(id)
    }
    const abortController = new AbortController()
    pendingAborts.set(id, abortController)
    return loadChildren({
      valuePath,
      indexPath,
      node,
      signal: abortController.signal,
    })
  })

  // prefer `Promise.allSettled` over `Promise.all` to avoid early termination
  Promise.allSettled(proms).then((results) => {
    const loadedValues: string[] = []
    const nodeWithErrors: NodeWithError[] = []

    const nextLoadingStatus = context.get("loadingStatus")

    // Read up to date collection to avoid stale data
    let collection = prop("collection")

    results.forEach((result, index) => {
      const { id, indexPath, node, valuePath } = nodesToLoad[index]
      if (result.status === "fulfilled") {
        nextLoadingStatus[id] = "loaded"
        loadedValues.push(id)
        collection = collection.replace(indexPath, { ...node, children: result.value })
      } else {
        pendingAborts.delete(id)
        Reflect.deleteProperty(nextLoadingStatus, id)
        nodeWithErrors.push({ node, error: result.reason, indexPath, valuePath })
      }
    })

    context.set("loadingStatus", nextLoadingStatus)

    if (loadedValues.length) {
      context.set("expandedValue", (prev) => uniq(add(prev, ...loadedValues)))
      prop("onLoadChildrenComplete")?.({ collection })
    }

    if (nodeWithErrors.length) {
      prop("onLoadChildrenError")?.({ nodes: nodeWithErrors })
    }
  })
}
