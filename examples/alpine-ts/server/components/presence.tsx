export function Presence(props: any) {
  return (
    <div
      x-data="{present: !$el.hidden}"
      x-presence="{ present }"
      x-ref="presence"
      x-init="$presence().setNode($refs.presence)"
      data-scope="presence"
      x-bind:data-state="$presence().skip ? undefined : present ? 'open' : 'closed'"
      {...props}
    >
      <slot />
    </div>
  )
}
