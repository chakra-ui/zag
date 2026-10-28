const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function formatCompact(n: number): string {
  return compact.format(n)
}
