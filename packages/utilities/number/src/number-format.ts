export const nf = new Intl.NumberFormat("en-US", { style: "decimal" })

export function formatter(n: number) {
  return parseFloat(nf.format(n))
}
