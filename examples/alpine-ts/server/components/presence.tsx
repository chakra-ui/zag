export function Presence(props: any) {
  return (
    <div
      {...props}
      data-scope="presence"
      x-data="{present: !hidden}"
      x-presence="{ present }"
      x-bind:data-state="$presence.skip ? undefined : present ? 'open' : 'closed'"
    >
      <slot />
    </div>
  )
}
