export function IFrame(props: any) {
  return (
    <>
      <iframe x-bind:title="$id('frame')" x-ref="frame" {...props}></iframe>
      <template
        x-init="Array.from($el.content.cloneNode(true).children).forEach((child) =>
          $refs.frame.contentWindow.document.body.appendChild(child))"
      >
        <slot />
      </template>
    </>
  )
}
