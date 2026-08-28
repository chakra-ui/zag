import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { InfiniteScrollProps } from "./infinite-scroll.types"

export const props = createProps<InfiniteScrollProps>()([
  "count",
  "dir",
  "disabled",
  "edge",
  "getRootNode",
  "hasMore",
  "id",
  "ids",
  "loading",
  "offset",
  "onLoadMore",
  "orientation",
  "scrollEl",
  "translations",
])
export const splitProps = createSplitProps<Partial<InfiniteScrollProps>>(props)
