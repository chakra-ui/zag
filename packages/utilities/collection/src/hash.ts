export function hash(str: string) {
  let i
  let l
  let hval = 2166136261

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }
  return `00000${(hval >>> 0).toString(36)}`.slice(-6)
}
