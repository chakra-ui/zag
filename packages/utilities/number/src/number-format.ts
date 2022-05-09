export const nf = new Intl.NumberFormat("en-US", { style: "decimal", maximumFractionDigits: 20 })

export function formatter(n: number) {
  return parseFloat(nf.format(n))
}
