import { isEqual } from "@zag-js/utils"

type NoInfer<T> = [T][T extends any ? 0 : never]

export function memo<TDeps extends any[], TDepArgs, TResult>(
  getDeps: (depArgs: TDepArgs) => [...TDeps],
  fn: (...args: NoInfer<[...TDeps]>) => TResult,
  opts?: {
    onChange?: (result: TResult) => void
  },
): (depArgs: TDepArgs) => TResult {
  let deps: any[] = []
  let result: TResult | undefined

  return (depArgs: TDepArgs) => {
    const newDeps = getDeps(depArgs)
    const depsChanged =
      newDeps.length !== deps.length || newDeps.some((dep: any, index: number) => !isEqual(deps[index], dep))
    if (!depsChanged) return result!
    deps = newDeps
    result = fn(...newDeps)
    opts?.onChange?.(result)
    console.log("result", result)
    return result!
  }
}
