export function Presence() {
  return (
    <div
      data-scope="presence"
      x-data="{present: !hidden}"
      x-presence="{ present }"
      x-bind:data-state="$presence.skip ? undefined : present ? 'open' : 'closed'"
    />
  )
}
