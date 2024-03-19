export function getHours() {
  const hours: string[] = []
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString())
  }
  return hours
}

export function getMinutes() {
  const minutes: string[] = []
  for (let i = 0; i < 60; i++) {
    minutes.push(i.toString())
  }
  return minutes
}
