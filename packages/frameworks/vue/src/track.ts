import { watch } from "vue"

export const useTrack = (deps: any[], effect: VoidFunction) => {
  watch(
    () => deps.map((d) => (typeof d === "function" ? d() : d)),
    () => effect(),
  )
}
