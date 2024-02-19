export const Show = (props: { when: boolean; children: React.ReactNode }) => {
  const { when, children } = props
  return when ? <>{children}</> : null
}
