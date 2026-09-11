import { X } from "lucide-static"

export function ToastItem(props: any) {
  return (
    <div x-toast-item="{...toast, index, parent}" x-toast-item:root {...props}>
      <span x-toast-item:ghost-before />
      <div data-scope="toast" data-part="progressbar" />
      <div
        x-toast-item:title
        x-html="`${$toastItem().type === 'loading' ? '<...>' : ''} ${$toastItem().title} ${$toastItem().type}`"
      />
      <div x-toast-item:description x-html="$toastItem().description" />
      <button x-toast-item:close-trigger>{html(X)}</button>
      <span x-toast-item:ghost-after />
    </div>
  )
}
