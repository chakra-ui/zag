export const uuid = (() => {
  let id = 0
  return () => {
    id++
    return id.toString(36)
  }
})()
