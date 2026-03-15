import Alpine from "alpinejs"

export const track = (deps: any[], effect: VoidFunction) => {
  // @ts-ignore @types/alpinejs is outdated
  Alpine.watch(
    () => [...deps.map((d) => d())],
    () => effect(),
  )
}
