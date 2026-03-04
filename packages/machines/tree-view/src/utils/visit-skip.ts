import type { TreeSkipFn } from "@zag-js/collection"
import type { Params } from "@zag-js/core"
import type { TreeViewSchema } from "../tree-view.types"

export function skipFn(params: Pick<Params<TreeViewSchema>, "prop" | "context">): TreeSkipFn<any> {
  const { prop, context } = params
  return function skip({ indexPath }) {
    const paths = prop("collection").getValuePath(indexPath).slice(0, -1)
    return paths.some((value) => !context.get("expandedValue").includes(value))
  }
}
