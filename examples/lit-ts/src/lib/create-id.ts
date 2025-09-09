let id = 0

export const createId = () => {
  return (++id).toString()
}
