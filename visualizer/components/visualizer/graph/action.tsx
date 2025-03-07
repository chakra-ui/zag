export const Action: React.FC<{
  action: string
  kind: "entry" | "exit" | "do" | "effect"
}> = (props) => {
  const { action, kind } = props

  return (
    <div data-part="action" data-action={kind}>
      <div data-part="action-type" title={action}>
        <strong>{action}</strong>
      </div>
    </div>
  )
}
